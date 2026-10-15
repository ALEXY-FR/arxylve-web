/* Security regression tests. All state is temporary; mail and DNS are stubbed. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const Module=require('node:module');
const {createHash,scryptSync}=require('node:crypto');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'arxylve-security-'));
process.env.ARXYLVE_CMS_DIR=path.join(temporary,'cms');
process.env.CONTACT_STATE_DIR=path.join(temporary,'contacts');
Object.assign(process.env,{OVH_SMTP_HOST:'mail.test.invalid',OVH_SMTP_USER:'test@test.invalid',OVH_SMTP_PORT:'587',OVH_SMTP_PASSWORD_BASE64:Buffer.from('fake-test-password').toString('base64'),CONTACT_EMAIL:'owner@test.invalid'});
delete process.env.RENDER;
const jar=new Map(),mail=[];
const cookieJar={get:name=>jar.has(name)?{value:jar.get(name)}:undefined,set:(name,value)=>jar.set(name,value),delete:name=>jar.delete(name)};
const originalLoad=Module._load;
Module._load=function(name,...args){
  if(name==='next/headers')return{cookies:async()=>cookieJar};
  if(name==='nodemailer')return{createTransport:()=>({sendMail:async message=>{mail.push(message);if(failMail)throw Error('Simulated SMTP failure');}})};
  if(name.endsWith('/email-domain'))return{emailDomainAcceptsMail:async()=>{dnsCalls++;return true;}};
  return originalLoad.call(this,name,...args);
};
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const load=file=>require(path.join(root,file));
const {readJsonBody,RequestError}=load('lib/request-body.ts');
let limits=load('lib/request-limits.ts');
const cms=load('lib/cms-store.ts');
const auth=load('lib/admin-auth.ts');
const store=load('lib/contact-store.mjs');
let dnsCalls=0,failMail=false;
let passed=0;
async function test(name,fn){await fn();passed++;console.log('PASS '+name);}
async function denied(promise,status){await assert.rejects(promise,e=>e instanceof RequestError&&e.status===status);}
const digest=v=>createHash('sha256').update(v).digest('hex');
const origin='http://localhost:3999';
function request(body,headers={}){return new Request(origin+'/api/contact',{method:'POST',headers:{origin,'content-type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});}
function limitedRequest(chunks,headers={}){return new Request(origin,{method:'POST',headers:{'content-type':'application/json',...headers},duplex:'half',body:new ReadableStream({start(controller){for(const chunk of chunks)controller.enqueue(typeof chunk==='string'?Buffer.from(chunk):chunk);controller.close();}})});}
async function fixture(){
  const salt='test-only-salt';
  await cms.atomicJson('credentials.json',{salt,hash:scryptSync('test-only-password',salt,64).toString('hex')});
  await cms.atomicJson('devices.json',{devices:['A','B'].map(id=>({id,hash:digest('token-'+id),name:'Test '+id,created:Date.now(),expires:Date.now()+86400000})),sessions:[],invite:null});
  // The retired global lock must never prevent a trusted device logging in.
  await cms.atomicJson('login-attempts.json',{count:3,until:Date.now()+86400000,lastFailure:Date.now()});
}
(async()=>{
  await test('JSON limits count streamed bytes even without or with a false Content-Length',async()=>{
    assert.deepEqual(await readJsonBody(request({text:'é'}),64),{text:'é'});
    await denied(readJsonBody(limitedRequest(['{"x":"','a'.repeat(80),'"}']),32),413);
    await denied(readJsonBody(limitedRequest(['{"x":"','a'.repeat(80),'"}'],{'content-length':'1'}),32),413);
    await denied(readJsonBody(request('{}',{'content-length':'1000'}),32),413);
    await denied(readJsonBody(request('"éé"'),5),413);
  });
  await test('Malformed JSON, UTF-8, length, compressed and non-JSON bodies are refused',async()=>{
    await denied(readJsonBody(request('{bad'),64),400);
    await denied(readJsonBody(limitedRequest([new Uint8Array([34,0xff,34])]),64),400);
    await denied(readJsonBody(request('{}',{'content-length':'bogus'}),64),400);
    await denied(readJsonBody(request('{}',{'content-encoding':'gzip'}),64),415);
    await denied(readJsonBody(request('{}',{'content-type':'text/plain'}),64),415);
  });
  await test('Only Render ingress addresses are trusted; spoofed X-Forwarded-For prefixes are ignored',async()=>{
    assert.equal(limits.requesterAddress(request('{}',{'cf-connecting-ip':'198.51.100.2'})),'direct-local');
    process.env.RENDER='true';
    assert.equal(limits.requesterAddress(request('{}',{'cf-connecting-ip':'198.51.100.2','x-forwarded-for':'203.0.113.1'})),'198.51.100.2');
    assert.equal(limits.requesterAddress(request('{}',{'x-forwarded-for':'203.0.113.1,198.51.100.2'})),'198.51.100.2');
    assert.equal(limits.requesterAddress(request('{}',{'cf-connecting-ip':'invalid'})),'unknown-ingress');
    delete process.env.RENDER;
  });
  await test('Concurrent requests cannot exceed a limit; identities and scopes are isolated',async()=>{
    const results=await Promise.allSettled(Array.from({length:12},()=>limits.consumeLimit('test','A',{limit:3,windowMs:60000})));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,3);
    assert(results.filter(r=>r.status==='rejected').every(r=>r.reason.status===429&&r.reason.retryAfter>0));
    await limits.consumeLimit('test','B',{limit:3,windowMs:60000});
    await limits.consumeLimit('other','A',{limit:3,windowMs:60000});
    assert(!fs.readFileSync(path.join(process.env.ARXYLVE_CMS_DIR,'request-limits-v1.json'),'utf8').includes('198.51.100.2'));
  });
  await test('Limits survive process reload and expire after the window',async()=>{
    const file=require.resolve(path.join(root,'lib/request-limits.ts'));delete require.cache[file];limits=require(file);
    await denied(limits.consumeLimit('test','A',{limit:3,windowMs:60000}),429);
    const originalNow=Date.now;Date.now=()=>originalNow()+61000;
    try{await limits.consumeLimit('test','A',{limit:3,windowMs:60000});}finally{Date.now=originalNow;}
  });
  await fixture();
  await test('Unknown browsers cannot consume trusted-device retries or trigger the old global lock',async()=>{
    jar.clear();for(let i=0;i<8;i++)await denied(auth.signIn('wrong'),401);
    jar.set('arxylve-device','token-A');const result=await auth.signIn('test-only-password');
    jar.set('arxylve-admin',result.token);assert.equal(await auth.isAdmin(),true);
  });
  await test('Password brute-force lockout is limited to one device and resets after 15 minutes',async()=>{
    for(let i=0;i<5;i++)await denied(auth.signIn('wrong'),401);
    await denied(auth.signIn('test-only-password'),429);
    jar.set('arxylve-device','token-B');assert((await auth.signIn('test-only-password')).token);
    jar.set('arxylve-device','token-A');const originalNow=Date.now;Date.now=()=>originalNow()+16*60000;
    try{assert((await auth.signIn('test-only-password')).token);}finally{Date.now=originalNow;}
  });
  await test('Pairing requires a valid invitation AND the password; revoked devices lose sessions',async()=>{
    jar.clear();await cms.atomicJson('device-invite.json',{hash:digest('test-invitation'),expires:Date.now()+60000});
    await denied(auth.signIn('wrong',undefined,'test-invitation'),401);
    assert(await cms.readJson('device-invite.json',null));
    const result=await auth.signIn('test-only-password',undefined,'test-invitation','Test C');
    assert(result.deviceToken);assert.equal(await cms.readJson('device-invite.json',null),null);
    jar.set('arxylve-device',result.deviceToken);jar.set('arxylve-admin',result.token);assert(await auth.isAdmin());
    const devices=await auth.listDevices();await auth.revokeDevice(devices.find(d=>d.current).id);assert.equal(await auth.isAdmin(),false);
  });
  await test('Contact quota follows the private requester token, not someone else’s claimed email',async()=>{
    const email='visitor@test.invalid',phone='+33600000001';
    const first=await store.reserveContact(email,phone,null,false,'requester-A');
    assert(first);assert(await store.reserveContact('other@test.invalid','+33600000002',null,false,'requester-A'));
    assert.equal(await store.reserveContact('third@test.invalid','+33600000003',null,false,'requester-A'),null);
    assert(await store.reserveContact(email,phone,null,false,'requester-B'));
    await store.releaseContact(first);assert(await store.reserveContact(email,phone,null,false,'requester-A'));
    await store.markReplied(email);assert(await store.reserveContact(email,phone,null,false,'requester-A'));
  });
  await test('Quota expires after seven days without deleting request history',async()=>{
    await store.reserveContact('old@test.invalid','+33600000009',null,false,'old-browser');
    await store.reserveContact('old@test.invalid','+33600000009',null,false,'old-browser');
    const originalNow=Date.now;Date.now=()=>originalNow()+8*86400000;
    try{assert(await store.reserveContact('old@test.invalid','+33600000009',null,false,'old-browser'));}finally{Date.now=originalNow;}
    assert(JSON.parse(fs.readFileSync(path.join(process.env.CONTACT_STATE_DIR,'contacts.json'),'utf8')).requests.length>=3);
  });
  const contact=load('app/api/contact/route.ts');
  const form={firstName:'Test',lastName:'Visitor',phone:'0612345678',phoneCountry:'FR',email:'test@example.com',confirmEmail:'test@example.com',category:'Miroir',dimensions:'50 x 60 cm',message:'This is a security regression test message.',consent:'accepted'};
  await test('Contact endpoint rejects cross-origin and oversized bodies before DNS or SMTP',async()=>{
    assert.equal((await contact.POST(request(form,{origin:'https://untrusted.test'}))).status,403);
    assert.equal((await contact.POST(request('{}',{'content-length':'65537'}))).status,413);
    assert.equal(dnsCalls,0);assert.equal(mail.length,0);
  });
  await test('Valid contact submissions still send; third pending request is refused without another email',async()=>{
    jar.clear();const response=await contact.POST(request(form));assert.equal(response.status,200);assert(jar.get('arxylve-contact'));
    assert.equal((await contact.POST(request(form))).status,200);
    assert.equal((await contact.POST(request(form))).status,429);assert.equal(mail.length,2);
    assert.equal(mail[0].replyTo,form.email);
  });
  await test('Failed SMTP releases the pending reservation and does not expose provider details',async()=>{
    jar.clear();failMail=true;
    const originalError=console.error;console.error=()=>{};
    let response;try{response=await contact.POST(request(form));}finally{console.error=originalError;failMail=false;}
    assert.equal(response.status,502);assert(!(await response.text()).includes('Simulated SMTP'));
    assert.equal((await contact.POST(request(form))).status,200);assert.equal((await contact.POST(request(form))).status,200);
  });
  await test('Contact attempts are capped before expensive mail or DNS work',async()=>{
    for(let i=0;i<24;i++)await contact.POST(request({}));const count=dnsCalls;
    const response=await contact.POST(request(form));assert.equal(response.status,429);assert(Number(response.headers.get('retry-after'))>0);assert.equal(dnsCalls,count);
  });
  const session=load('app/api/admin/session/route.ts');
  await test('Admin HTTP login keeps unknown-browser traffic separate from a trusted device',async()=>{
    jar.clear();for(let i=0;i<22;i++)await session.POST(request({password:'wrong'}));
    assert.equal((await session.POST(request({password:'test-only-password'}))).status,429);
    jar.set('arxylve-device','token-B');const response=await session.POST(request({password:'test-only-password'}));assert.equal(response.status,200);assert(await auth.isAdmin());
  });
  await test('CSP blocks inline scripts without a nonce while preserving same-origin editor frames',async()=>{
    const {contentSecurityPolicy,securityHeaders}=load('lib/security-policy.ts');
    const csp=contentSecurityPolicy('test-nonce',false,false);
    assert(csp.includes("'nonce-test-nonce'"));assert(csp.includes("'strict-dynamic'"));assert(!csp.includes("'unsafe-eval'"));assert(csp.includes("frame-ancestors 'self'"));assert(csp.includes("object-src 'none'"));
    assert.equal(securityHeaders.find(h=>h.key==='X-Frame-Options').value,'SAMEORIGIN');
  });
  await test('First setup needs its private invitation and creates credentials only in the isolated store',async()=>{
    jar.clear();fs.unlinkSync(path.join(process.env.ARXYLVE_CMS_DIR,'credentials.json'));await cms.atomicJson('devices.json',{devices:[],sessions:[],invite:null});
    const {invite}=load('scripts/invite-admin.cjs'),invitation=invite(origin,root);assert(invitation.file.startsWith(process.env.ARXYLVE_CMS_DIR));
    const token=new URLSearchParams(new URL(fs.readFileSync(invitation.file,'utf8').trim()).hash.slice(1)).get('setup');
    await denied(auth.signIn('local-setup-password','invalid-token'),401);assert.equal(await auth.configured(),false);
    const result=await auth.signIn('local-setup-password',token);assert(result.deviceToken);assert.equal(await auth.configured(),true);assert.equal(await cms.readJson('setup.json',null),null);
  });
  await test('A full public limiter cannot consume the slots reserved for trusted admin devices',async()=>{
    const buckets={};for(let i=0;i<4096;i++)buckets['fake-public-'+i]={count:1,reset:Date.now()+60000};
    await cms.atomicJson('request-limits-v1.json',{version:1,salt:'fake-limit-salt',buckets});
    const file=require.resolve(path.join(root,'lib/request-limits.ts'));delete require.cache[file];const fresh=require(file);
    await denied(fresh.consumeLimit('admin-login','ip:198.51.100.1',{limit:20,windowMs:60000}),503);
    await fresh.consumeLimit('admin-login','device:B',{limit:60,windowMs:60000});
    await fresh.consumeLimit('admin-password','device:B',{limit:5,windowMs:60000});
  });
  console.log(`${passed} security regression groups passed; no production state or mail used.`);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{Module._load=originalLoad;fs.rmSync(temporary,{recursive:true,force:true});});

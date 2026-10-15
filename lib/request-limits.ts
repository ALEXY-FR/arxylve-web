import {createHmac,randomBytes} from 'node:crypto';
import {isIP} from 'node:net';
import {readJson,atomicJson} from './cms-store';
import {RequestError} from './request-body';

type Bucket={count:number;reset:number;protected?:boolean};
type LimitState={version:1;salt:string;buckets:Record<string,Bucket>};
export type Rule={limit:number;windowMs:number};
let current:LimitState|undefined,queue=Promise.resolve();
function serial<T>(action:()=>Promise<T>){const job=queue.then(action);queue=job.then(()=>{},()=>{});return job;}
const keyFor=(state:LimitState,scope:string,identity:string)=>createHmac('sha256',state.salt).update(scope+'\0'+identity).digest('hex');
async function state(){
  if(current)return current;
  const saved=await readJson<LimitState|null>('request-limits-v1.json',null);
  if(saved&&(saved.version!==1||!saved.salt||typeof saved.buckets!=='object'))throw new Error('Invalid limit state');
  current=saved??{version:1,salt:randomBytes(32).toString('hex'),buckets:{}};return current;
}

// Only the Render ingress is trusted to supply client addresses. Never use the
// leftmost X-Forwarded-For entry: callers can prepend their own addresses.
export function requesterAddress(request:Request){
  if(process.env.RENDER!=='true')return 'direct-local';
  const cloudflare=request.headers.get('cf-connecting-ip')?.trim();
  if(cloudflare&&isIP(cloudflare))return cloudflare.toLowerCase();
  const forwarded=request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return forwarded&&isIP(forwarded)?forwarded.toLowerCase():'unknown-ingress';
}

export function consumeLimit(scope:string,identity:string,rule:Rule){return serial(async()=>{
  const s=await state(),now=Date.now(),key=keyFor(s,scope,identity),old=s.buckets[key];
  if(old&&old.reset>now&&old.count>=rule.limit)throw new RequestError('Trop de tentatives. Réessayez plus tard.',429,Math.max(1,Math.ceil((old.reset-now)/1000)));
  for(const [id,bucket] of Object.entries(s.buckets))if(bucket.reset<=now)delete s.buckets[id];
  // Unknown requesters cannot fill the slots reserved for authenticated devices
  // and validated setup/pairing invitations. Neither pool evicts active limits.
  const protectedPool=scope==='admin-password'||(scope==='admin-login'&&identity.startsWith('device:'));
  const poolSize=Object.values(s.buckets).filter(bucket=>(bucket.protected===true)===protectedPool).length;
  if(!s.buckets[key]&&poolSize>=(protectedPool?256:4096))throw new RequestError('Service momentanément indisponible. Réessayez plus tard.',503,60);
  s.buckets[key]=old&&old.reset>now?{...old,count:old.count+1}:{count:1,reset:now+rule.windowMs,...(protectedPool?{protected:true}:{})};
  await atomicJson('request-limits-v1.json',s);
});}

export function clearLimit(scope:string,identity:string){return serial(async()=>{const s=await state(),key=keyFor(s,scope,identity);if(s.buckets[key]){delete s.buckets[key];await atomicJson('request-limits-v1.json',s);}});}

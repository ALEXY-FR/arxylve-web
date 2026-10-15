import {consumeLimit,clearLimit} from './request-limits';
import {RequestError} from './request-body';
import {createHash,randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';import {cookies} from 'next/headers';import {readJson,atomicJson} from './cms-store';
type Credentials={salt:string;hash:string};type Session={hash:string;expires:number;device?:string};type Device={id:string;hash:string;name:string;created:number;expires:number};type State={devices:Device[];sessions:Session[];invite:{hash:string;expires:number}|null};const cookieName='arxylve-admin',deviceCookie='arxylve-device';const digest=(v:string)=>createHash('sha256').update(v).digest('hex');const empty:State={devices:[],sessions:[],invite:null};
let queue=Promise.resolve();function serial<T>(fn:()=>Promise<T>):Promise<T>{const job=queue.then(fn);queue=job.then(()=>{},()=>{});return job}
async function state(){return readJson<State>('devices.json',structuredClone(empty))}
export async function isAdmin(){const jar=await cookies(),token=jar.get(cookieName)?.value,device=jar.get(deviceCookie)?.value;if(!token||!device)return false;const s=await state(),now=Date.now(),d=s.devices.find(d=>d.hash===digest(device)&&d.expires>now);return !!d&&s.sessions.some(t=>t.hash===digest(token)&&t.device===d.id&&t.expires>now)}
export async function canTrustLegacy(){const existing=await readJson<State|null>('devices.json',null);if(existing)return false;const token=(await cookies()).get(cookieName)?.value,legacy=await readJson<Session|null>('session.json',null);return !!token&&!!legacy&&legacy.expires>Date.now()&&legacy.hash===digest(token)}
export {sameOrigin,secureAdminCookies} from './request-origin';
export async function configured(){return !!await readJson<Credentials|null>('credentials.json',null)}
async function deviceToken(){return (await cookies()).get(deviceCookie)?.value}
async function addDevice(s:State,name:string){const token=randomBytes(32).toString('hex'),d={id:randomBytes(12).toString('hex'),hash:digest(token),name:name.trim().slice(0,80)||'Mon appareil',created:Date.now(),expires:Date.now()+365*86400000};s.devices.push(d);return {device:d,token}}
export function signIn(password:string,setup?:string,pairing?:string,name='Mon appareil'){return serial(async()=>{
 const now=Date.now();let c=await readJson<Credentials|null>('credentials.json',null);
 const s=await state(),existing=await deviceToken();let device=s.devices.find(d=>existing&&d.hash===digest(existing)&&d.expires>now),newToken:string|undefined;
 const first=!c,serverInvitation=await readJson<State['invite']>('device-invite.json',null);
 const paired=typeof pairing==='string'&&[s.invite,serverInvitation].some(invitation=>!!invitation&&invitation.expires>now&&digest(pairing)===invitation.hash);
 // An unknown device cannot consume a trusted device's password allowance.
 if(c&&!device&&!paired)throw new RequestError('Ce navigateur n’est pas autorisé. Utilisez une invitation créée depuis votre appareil connecté.',401);
 if(first){
  const invitation=await readJson<{hash:string;expires?:number}|null>('setup.json',null);
  if(typeof setup!=='string'||!invitation||(invitation.expires!==undefined&&invitation.expires<=now)||digest(setup)!==invitation.hash)throw new RequestError('Lien de création du compte invalide.',401);
  if(password.length<12||password.length>200)throw new RequestError('Choisissez un mot de passe d’au moins 12 caractères.');
 }
 const identity=device?'device:'+device.id:first?'setup:'+digest(setup!):'invite:'+digest(pairing!);
 await consumeLimit('admin-password',identity,{limit:5,windowMs:15*60000});
 if(!c){const salt=randomBytes(16).toString('hex');c={salt,hash:scryptSync(password,salt,64).toString('hex')};await atomicJson('credentials.json',c);await atomicJson('setup.json',null);}
 else if(!timingSafeEqual(Buffer.from(c.hash,'hex'),scryptSync(password,c.salt,64)))throw new RequestError('Mot de passe incorrect.',401);
 if(!device&&(first||paired)){const added=await addDevice(s,name);device=added.device;newToken=added.token;s.invite=null;await atomicJson('device-invite.json',null);}
 if(!device)throw new RequestError('Appareil non autorisé.',401);
 const token=randomBytes(32).toString('hex'),deviceId=device.id;s.sessions=s.sessions.filter(t=>t.expires>now&&t.device!==deviceId);s.sessions.push({hash:digest(token),expires:now+8*3600000,device:device.id});await atomicJson('devices.json',s);
 await clearLimit('admin-password',identity);return{token,deviceToken:newToken};
});}

export async function setSession(result:{token:string;deviceToken?:string},secure:boolean){const jar=await cookies();jar.set(cookieName,result.token,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:8*3600});if(result.deviceToken)jar.set(deviceCookie,result.deviceToken,{httpOnly:true,sameSite:'strict',secure,path:'/',maxAge:365*86400})}
export function trustLegacy(secure:boolean,name:string){return serial(async()=>{if(!await canTrustLegacy())throw Error('Connexion existante requise.');const s=await state(),added=await addDevice(s,name),token=randomBytes(32).toString('hex');s.sessions.push({hash:digest(token),device:added.device.id,expires:Date.now()+8*3600000});s.invite=null;await atomicJson('devices.json',s);await atomicJson('session.json',null);await atomicJson('device-invite.json',null);await setSession({token,deviceToken:added.token},secure)})}
export async function listDevices(){const token=await deviceToken();return (await state()).devices.map(({id,name,created,expires,hash})=>({id,name,created,expires,current:!!token&&hash===digest(token)}))}
export function inviteDevice(){return serial(async()=>{if(!await isAdmin())throw Error('Connexion requise.');const s=await state(),code=randomBytes(24).toString('hex');s.invite={hash:digest(code),expires:Date.now()+600000};await atomicJson('devices.json',s);return code})}
export function revokeDevice(id:string){return serial(async()=>{if(!await isAdmin())throw Error('Connexion requise.');const s=await state();s.devices=s.devices.filter(d=>d.id!==id);s.sessions=s.sessions.filter(t=>t.device!==id);await atomicJson('devices.json',s)})}
export function signOut(){return serial(async()=>{const token=(await cookies()).get(cookieName)?.value,s=await state();s.sessions=s.sessions.filter(t=>!token||t.hash!==digest(token));await atomicJson('devices.json',s);(await cookies()).delete(cookieName)})}

// This browser-only privilege skips the contact quota; it never grants an admin session.
export async function isTrustedContactBrowser(){const token=await deviceToken();if(!token)return false;const now=Date.now();return (await state()).devices.some(device=>device.expires>now&&device.hash===digest(token))}

export async function trustedDeviceId(){const token=await deviceToken();if(!token)return null;const now=Date.now();return (await state()).devices.find(device=>device.expires>now&&device.hash===digest(token))?.id??null;}

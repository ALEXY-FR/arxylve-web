import {isAdmin,configured,canTrustLegacy,sameOrigin,secureAdminCookies,signIn,setSession,signOut,trustedDeviceId} from '../../../../lib/admin-auth';
import {readJsonBody,RequestError,requestErrorResponse} from '../../../../lib/request-body';
import {consumeLimit,requesterAddress} from '../../../../lib/request-limits';
export async function GET(){return Response.json({admin:await isAdmin(),configured:await configured(),needsTrust:await canTrustLegacy()},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({message:'Origine refusée.'},{status:403});
 try{
  const device=await trustedDeviceId();
  await consumeLimit('admin-login',device?'device:'+device:'ip:'+requesterAddress(request),{limit:device?60:20,windowMs:10*60000});
  const body=await readJsonBody<Record<string,unknown>>(request,4096);
  if(!body||typeof body.password!=='string'||body.password.length>200)throw new RequestError('Mot de passe invalide.');
  const result=await signIn(body.password,typeof body.setup==='string'?body.setup:undefined,typeof body.pairing==='string'?body.pairing:undefined,typeof body.name==='string'?body.name:'Mon appareil');
  await setSession(result,secureAdminCookies(request));return Response.json({admin:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return requestErrorResponse(error,'Connexion impossible. Réessayez dans un instant.');}
}
export async function DELETE(request:Request){if(!sameOrigin(request)||!await isAdmin())return Response.json({message:'Accès refusé.'},{status:403});await signOut();return Response.json({ok:true});}

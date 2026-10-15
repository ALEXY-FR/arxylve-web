import {readJsonBody} from '../../../../lib/request-body';
import {isAdmin,sameOrigin} from '../../../../lib/admin-auth';
import {listContacts,updateContact} from '../../../../lib/contact-store.mjs';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store'};
export async function GET(){
 if(!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401,headers});
 try{return Response.json(await listContacts(),{headers})}catch{return Response.json({message:'Impossible de charger les demandes.'},{status:503,headers})}
}
export async function PATCH(request:Request){
 if(!sameOrigin(request)||!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401,headers});
 try{
 const data=await readJsonBody<Record<string,unknown>>(request,1024);if(!data||typeof data.id!=='string'||!(['received','replied','in-progress','completed'] as unknown[]).includes(data.status))throw Error('Demande invalide.');
 await updateContact(data.id,data.status as import('../../../../lib/contact-store.mjs').ContactStatus);
 return Response.json(await listContacts(),{headers});
 }catch{return Response.json({message:'Modification impossible. Actualisez puis réessayez.'},{status:400,headers})}
}


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
 const text=await request.text();if(text.length>1000)throw Error('Demande invalide.');
 const data=JSON.parse(text);if(!data||typeof data.id!=='string'||typeof data.status!=='string')throw Error('Demande invalide.');
 await updateContact(data.id,data.status);
 return Response.json(await listContacts(),{headers});
 }catch{return Response.json({message:'Modification impossible. Actualisez puis réessayez.'},{status:400,headers})}
}


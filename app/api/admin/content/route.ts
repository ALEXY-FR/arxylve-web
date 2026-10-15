import {readJsonBody} from '../../../../lib/request-body';
import {isAdmin,sameOrigin} from '../../../../lib/admin-auth';import {readContent,saveContent} from '../../../../lib/cms-store';
export async function GET(){if(!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401});return Response.json(await readContent(),{headers:{'Cache-Control':'no-store'}})}
export async function PUT(request:Request){if(!sameOrigin(request)||!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401});try{return Response.json(await saveContent(await readJsonBody<import('../../../../data/content').SiteContent>(request,2000000)))}catch(e){return Response.json({message:e instanceof Error?e.message:'Enregistrement impossible.'},{status:400})}}

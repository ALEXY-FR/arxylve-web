import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isAdmin,sameOrigin} from '../../../../lib/admin-auth';
import {cmsDir} from '../../../../lib/cms-store';
import {browserVideo,mediaFormat,MAX_MEDIA_BYTES} from '../../../../lib/media-upload';

export const runtime='nodejs';
export const maxDuration=180;

export async function POST(request:Request){
 if(!sameOrigin(request)||!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401});
 try{
  if(Number(request.headers.get('content-length'))>85e6)throw Error('Fichier trop volumineux (80 Mo maximum).');
  const data=await request.formData(),file=data.get('file');
  if(!(file instanceof File)||file.size>MAX_MEDIA_BYTES||!file.size)throw Error('Fichier invalide (80 Mo maximum).');
  const bytes=Buffer.from(await file.arrayBuffer()),format=mediaFormat(bytes,file.name);
  if(!format)throw Error('Formats acceptés : JPG, PNG, WebP, MOV, MP4 et WebM.');
  const video=format==='mov'||format==='mp4'||format==='webm';
  if(!video&&file.size>20e6)throw Error('Image trop volumineuse (20 Mo maximum).');
  const content=video?await browserVideo(bytes,format):bytes;
  const name=randomUUID()+'.'+(video?'mp4':format);
  await mkdir(path.join(cmsDir,'media'),{recursive:true});
  await writeFile(path.join(cmsDir,'media',name),content);
  return Response.json({src:'/media/'+name,video});
 }catch(e){return Response.json({message:e instanceof Error?e.message:'Import impossible.'},{status:400});}
}

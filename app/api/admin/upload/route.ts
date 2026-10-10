import {mkdir,mkdtemp,open,rename,unlink,rmdir} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isAdmin,sameOrigin} from '../../../../lib/admin-auth';
import {cmsDir} from '../../../../lib/cms-store';
import {browserVideo,mediaFormat,MAX_MEDIA_BYTES} from '../../../../lib/media-upload';

export const runtime='nodejs';
export const maxDuration=180;
let importing=false;

export async function POST(request:Request){
 if(!sameOrigin(request)||!await isAdmin())return Response.json({message:'Connexion requise.'},{status:401});
 if(importing)return Response.json({message:'Un import est déjà en cours. Patientez jusqu’à sa fin, puis réessayez.'},{status:429});
 importing=true;
 let folder='',input='',output='';
 try{
  // Send the File directly from the browser, avoiding multipart/arrayBuffer copies.
  const filename=decodeURIComponent(request.headers.get('x-media-name')??'');
  if(!filename||!request.body)throw Error('Actualisez la page d’administration, puis sélectionnez votre fichier.');
  if(Number(request.headers.get('content-length'))>MAX_MEDIA_BYTES)throw Error('Fichier trop volumineux (80 Mo maximum).');
  await mkdir(cmsDir,{recursive:true});
  folder=await mkdtemp(path.join(cmsDir,'upload-'));input=path.join(folder,'source');output=path.join(folder,'converted.mp4');
  const handle=await open(input,'wx'),reader=request.body.getReader();
  let size=0,header=Buffer.alloc(0);
  try{
   while(true){
    const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;
    if(size>MAX_MEDIA_BYTES)throw Error('Fichier trop volumineux (80 Mo maximum).');
    if(header.length<32)header=Buffer.concat([header,Buffer.from(value.subarray(0,32-header.length))]);
    let offset=0;
    while(offset<value.byteLength){const {bytesWritten}=await handle.write(value,offset,value.byteLength-offset);offset+=bytesWritten;}
   }
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();await handle.close();}
  if(!size)throw Error('Le fichier est vide.');
  const format=mediaFormat(header,filename);
  if(!format)throw Error('Formats acceptés : JPG, PNG, WebP, MOV, MP4 et WebM.');
  const video=format==='mov'||format==='mp4'||format==='webm';
  if(!video&&size>20e6)throw Error('Image trop volumineuse (20 Mo maximum).');
  if(video)await browserVideo(input,output);
  const name=randomUUID()+'.'+(video?'mp4':format);
  await mkdir(path.join(cmsDir,'media'),{recursive:true});
  await rename(video?output:input,path.join(cmsDir,'media',name));
  return Response.json({src:'/media/'+name,video});
 }catch(e){return Response.json({message:e instanceof Error?e.message:'Import impossible.'},{status:400});}
 finally{
  if(folder){await Promise.all([unlink(input).catch(()=>{}),unlink(output).catch(()=>{})]);await rmdir(folder).catch(()=>{});}
  importing=false;
 }
}

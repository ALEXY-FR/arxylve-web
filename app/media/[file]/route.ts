import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {cmsDir} from '../../../lib/cms-store';
export const runtime='nodejs';
type Context={params:Promise<{file:string}>};
export async function GET(request:Request,{params}:Context){
 const {file}=await params;
 if(!/^[a-f0-9-]+\.(jpg|png|webp|mp4|webm)$/.test(file))return new Response(null,{status:404});
 try{
  const filename=path.join(cmsDir,'media',file),{size}=await stat(filename);
  const types:Record<string,string>={jpg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',webm:'video/webm'};
  const headers:Record<string,string>={'Content-Type':types[file.split('.').pop()!],'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable','Accept-Ranges':'bytes'};
  let start=0,end=size-1,status=200;
  const range=request.headers.get('range');
  if(range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(range);
   if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
   if(m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;}
   else start=Math.max(0,size-Number(m[2]));
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
   status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
  }
  headers['Content-Length']=String(Math.max(0,end-start+1));
  if(request.method==='HEAD'||size===0)return new Response(null,{status,headers});
  // Pull one small disk chunk at a time; even a Range request never reads the whole video.
  const source=createReadStream(filename,{start,end,highWaterMark:64*1024}),iterator=source[Symbol.asyncIterator]();
  const abort=()=>source.destroy();request.signal.addEventListener('abort',abort,{once:true});
  source.once('close',()=>request.signal.removeEventListener('abort',abort));
  const body=new ReadableStream<Uint8Array>({
   async pull(controller){try{const next=await iterator.next();if(next.done)controller.close();else controller.enqueue(next.value);}catch(e){controller.error(e);source.destroy();}},
   cancel(){source.destroy();},
  });
  if(request.signal.aborted)source.destroy();
  return new Response(body,{status,headers});
 }catch{return new Response(null,{status:404});}
}
export async function HEAD(request:Request,context:Context){return GET(request,context);}

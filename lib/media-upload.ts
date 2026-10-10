import {execFile} from 'node:child_process';
import {mkdtemp,readFile,writeFile,unlink,rmdir} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {promisify} from 'node:util';
import ffmpegPath from 'ffmpeg-static';

const execute=promisify(execFile);
export const MAX_MEDIA_BYTES=80_000_000;
export type MediaFormat='jpg'|'png'|'webp'|'mp4'|'webm'|'mov';

export function mediaFormat(bytes:Buffer,name:string):MediaFormat|null {
 if(bytes.subarray(0,3).equals(Buffer.from([255,216,255])))return 'jpg';
 if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'webp';
 if(bytes.subarray(0,4).equals(Buffer.from([26,69,223,163])))return 'webm';
 if(bytes.toString('ascii',4,8)==='ftyp'){
  const brand=bytes.toString('ascii',8,12);
  if(brand==='qt  ')return 'mov';
  if(/^(isom|iso[2-9]|mp41|mp42|avc1|dash|M4V |MSNV)$/.test(brand))return 'mp4';
 }
 // Older QuickTime files can begin with an atom instead of an ftyp box.
 if(/\.mov$/i.test(name)&&['moov','mdat','wide'].includes(bytes.toString('ascii',4,8)))return 'mov';
 return null;
}

// Keep only one encoder active on the hosting server.
let encoding=Promise.resolve();
export function browserVideo(bytes:Buffer,format:'mp4'|'webm'|'mov'):Promise<Buffer>{
 const result=encoding.then(()=>convertVideo(bytes,format));
 encoding=result.then(()=>{},()=>{});
 return result;
}

async function convertVideo(bytes:Buffer,format:'mp4'|'webm'|'mov'){
 if(!ffmpegPath)throw Error('La conversion vidéo est indisponible. Réessayez plus tard.');
 const folder=await mkdtemp(path.join(tmpdir(),'arxylve-video-'));
 const input=path.join(folder,'source.'+format),output=path.join(folder,'converted.mp4');
 try{
  await writeFile(input,bytes);
  let metadata='';
  try{await execute(ffmpegPath,['-hide_banner','-i',input],{timeout:10000,windowsHide:true,maxBuffer:256000});}
  catch(error){metadata=(error as {stderr?:string}).stderr??'';}
  const hdr=/smpte2084|arib-std-b67/.test(metadata);
  const scale="scale=w='if(gte(iw,ih),min(1920,iw),min(1080,iw))':h='if(gte(iw,ih),min(1080,ih),min(1920,ih))':force_original_aspect_ratio=decrease:force_divisible_by=2";
  const filters=(hdr?'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,':'')+scale+',setsar=1';
  await execute(ffmpegPath,[
   '-hide_banner','-loglevel','error','-nostdin','-y','-threads','2','-i',input,
   '-map','0:v:0','-map','0:a:0?','-map_metadata','-1',
   '-vf',filters,'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-threads','2',
   '-c:a','aac','-b:a','128k','-ac','2','-movflags','+faststart',output,
  ],{timeout:180000,windowsHide:true,maxBuffer:256000});
  const converted=await readFile(output);
  if(!converted.length||converted.length>MAX_MEDIA_BYTES)throw Error('Converted video too large');
  return converted;
 }catch(error){
  if((error as NodeJS.ErrnoException).code==='ENOENT')throw Error('La conversion vidéo est indisponible. Réessayez plus tard.');
  throw Error('Cette vidéo ne peut pas être importée. Vérifiez que le fichier est complet et réessayez avec une courte vidéo MOV, MP4 ou WebM.');
 }finally{
  await Promise.all([unlink(input).catch(()=>{}),unlink(output).catch(()=>{})]);
  await rmdir(folder).catch(()=>{});
 }
}

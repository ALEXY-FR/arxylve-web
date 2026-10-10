import {execFile} from 'node:child_process';
import {stat} from 'node:fs/promises';
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

// The upload route admits one import at a time; conversion never holds the file in RAM.
export async function browserVideo(input:string,output:string){
 if(!ffmpegPath)throw Error('La conversion vidéo est indisponible. Réessayez plus tard.');
 try{
  let metadata='';
  try{await execute(ffmpegPath,['-hide_banner','-threads','1','-i',input],{timeout:10000,windowsHide:true,maxBuffer:256000});}
  catch(error){metadata=(error as {stderr?:string}).stderr??'';}
  const duration=/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/.exec(metadata);
  if(duration&&Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3])>120)throw Error('Les vidéos doivent durer au maximum 2 minutes.');
  const hdr=/smpte2084|arib-std-b67/.test(metadata);
  // Reduce the image before the float HDR filters, and disable threaded frame queues.
  const scale="scale=w='if(gte(iw,ih),min(1280,iw),min(720,iw))':h='if(gte(iw,ih),min(720,ih),min(1280,ih))':force_original_aspect_ratio=decrease:force_divisible_by=2";
  const filters=scale+(hdr?',zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv':'')+',setsar=1';
  await execute(ffmpegPath,[
   '-hide_banner','-loglevel','error','-nostdin','-y','-threads','1','-filter_threads','1','-filter_complex_threads','1','-i',input,
   '-map','0:v:0','-map','0:a:0?','-map_metadata','-1',
   '-vf',filters,'-c:v','libx264','-preset','veryfast','-tune','zerolatency','-crf','22','-pix_fmt','yuv420p','-threads','1',
   '-c:a','aac','-b:a','128k','-ac','2','-movflags','+faststart',output,
  ],{timeout:180000,windowsHide:true,maxBuffer:256000});
  const converted=await stat(output);
  if(!converted.size||converted.size>MAX_MEDIA_BYTES)throw Error('La vidéo préparée dépasse 80 Mo. Choisissez une vidéo plus courte.');
 }catch(error){
  if(error instanceof Error&&/maximum 2 minutes|dépasse 80 Mo/.test(error.message))throw error;
  if((error as NodeJS.ErrnoException).code==='ENOENT')throw Error('La conversion vidéo est indisponible. Réessayez plus tard.');
  throw Error('Cette vidéo ne peut pas être importée. Vérifiez que le fichier est complet et réessayez avec une courte vidéo MOV, MP4 ou WebM.');
 }
}

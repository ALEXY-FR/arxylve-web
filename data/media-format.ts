import type {SiteContent} from './content';

export const mediaFormats={original:'Format original',square:'Carré · 1:1',vertical:'Vertical · 2:3',portrait:'Portrait iPhone · 9:16',horizontal:'Horizontal · 3:2'};
export type MediaFormat=keyof typeof mediaFormats;
export const mediaRatios={square:1,vertical:2/3,portrait:9/16,horizontal:3/2};
export function mediaRatio(format:MediaFormat|undefined,natural:number){return format&&format!=='original'?mediaRatios[format]:natural;}

// The owner requested a 9:16 display for this existing landscape export.
// Only supply its initial format; any later explicit choice remains authoritative.
const nitescenceExport='/media/dd65f510-6c71-421d-9708-0d4e5ed61651.mp4';
export function normalizeMediaFormats(content:SiteContent):SiteContent{
 const sculptures=content.sculptures.map(work=>{
  if(!work.videos?.some(video=>video.src===nitescenceExport&&video.format===undefined))return work;
  return {...work,videos:work.videos.map(video=>video.src===nitescenceExport&&video.format===undefined?{...video,format:'portrait' as const}:video)};
 });
 return sculptures.every((work,index)=>work===content.sculptures[index])?content:{...content,sculptures};
}

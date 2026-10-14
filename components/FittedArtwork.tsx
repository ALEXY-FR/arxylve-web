"use client";
import {mediaRatio,type MediaFormat} from '../data/media-format';
import {fullVideo,videoBorders,videoPlacement,type VideoCrop} from '../data/video-frame';
import {useCopy} from './SiteCopy';
import Image from 'next/image';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
type Media={src:string;alt:string;video?:boolean;format?:MediaFormat};
function displayRatio(media:Media,natural:number){return media.video?mediaRatio(media.format,natural):natural;}
export function FittedArtwork({image,alt,photos,videos}:{image:string;alt:string;photos?:Media[];videos?:Media[]}){
 const t=useCopy(),host=useRef<HTMLDivElement>(null),rail=useRef<HTMLDivElement>(null),player=useRef<HTMLVideoElement>(null);
 const [space,setSpace]=useState({width:0,height:0,padding:13}),[ratios,setRatios]=useState<Record<string,number>>({}),[crops,setCrops]=useState<Record<string,VideoCrop>>({}),[active,setActive]=useState(0),[hovered,setHovered]=useState(false),[keyboard,setKeyboard]=useState(false),[failed,setFailed]=useState(false);
 const activeIndex=useRef(0),programmatic=useRef(false),settleTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const views=useMemo<Media[]>(()=>[{src:image,alt},...(photos??[]),...(videos??[]).map(v=>({...v,video:true}))],[image,alt,photos,videos]);
 const selected=views[active]??views[0],multiple=views.length>1,natural=ratios[selected.src]??1,crop=crops[selected.src]??fullVideo,ratio=displayRatio(selected,natural*crop.width/crop.height),cropped=!!selected.video&&!!selected.format&&selected.format!=='original';
 const remember=useCallback((src:string,width:number,height:number)=>{if(width&&height){const next=width/height;setRatios(current=>current[src]===next?current:{...current,[src]:next});}},[]);
 const readBorders=useCallback((video:HTMLVideoElement)=>{
  if(video.readyState<2||!video.videoWidth||!video.videoHeight)return;
  try{
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=Math.min(640,Math.max(32,Math.round(320*video.videoHeight/video.videoWidth)));
   const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return;context.drawImage(video,0,0,canvas.width,canvas.height);
   const border=videoBorders(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height)??fullVideo;
   setCrops(current=>{
    const old=current[video.getAttribute('src')!],left=Math.min(old?.left??border.left,border.left),top=Math.min(old?.top??border.top,border.top);
    const right=Math.max(old?old.left+old.width:0,border.left+border.width),bottom=Math.max(old?old.top+old.height:0,border.top+border.height);
    if(old&&old.left===left&&old.top===top&&old.width===right-left&&old.height===bottom-top)return current;
    return {...current,[video.getAttribute('src')!]:{left,top,width:right-left,height:bottom-top}};
   });
  }catch{/* Cross-origin media keeps its original proportions. */}
 },[]);
 const select=useCallback((n:number)=>{activeIndex.current=n;setActive(n);setFailed(false);},[]);
 const choose=useCallback((n:number)=>{
  select(n);const node=rail.current,button=node?.children[n] as HTMLElement|undefined;if(!node||!button)return;
  programmatic.current=true;if(settleTimer.current)clearTimeout(settleTimer.current);
  const box=node.getBoundingClientRect(),item=button.getBoundingClientRect();
  node.scrollTo({left:node.scrollLeft+item.left+item.width/2-box.left-box.width/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  settleTimer.current=setTimeout(()=>{programmatic.current=false;},700);
 },[select]);
 useEffect(()=>{const node=host.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setSpace({width:entry.contentRect.width,height:entry.contentRect.height,padding:(parseFloat(getComputedStyle(node).getPropertyValue('--mobile-artwork-inset'))||12)+1}));observer.observe(node);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  const node=rail.current;if(!node)return;let wheel=0,lastStep=0,frame=0;
  const nearest=()=>{if(programmatic.current)return;const box=node.getBoundingClientRect(),center=box.left+box.width/2;let closest=0,distance=Infinity;
   Array.from(node.children).forEach((child,n)=>{const item=child.getBoundingClientRect(),delta=Math.abs(item.left+item.width/2-center);if(delta<distance){distance=delta;closest=n;}});
   if(closest!==activeIndex.current)select(closest);
  };
  const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(nearest);};
  const manual=()=>{programmatic.current=false;if(settleTimer.current)clearTimeout(settleTimer.current);};
  const end=()=>{manual();nearest();};
  const onWheel=(event:WheelEvent)=>{
   if(Math.abs(event.deltaX)>=Math.abs(event.deltaY)){manual();return;}
   event.preventDefault();wheel+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?node.clientWidth:1);
   if(Math.abs(wheel)<30||performance.now()-lastStep<160)return;
   const next=Math.max(0,Math.min(views.length-1,activeIndex.current+(wheel>0?1:-1)));wheel=0;lastStep=performance.now();if(next!==activeIndex.current)choose(next);
  };
  node.addEventListener('scroll',scroll,{passive:true});node.addEventListener('scrollend',end);node.addEventListener('pointerdown',manual);node.addEventListener('wheel',onWheel,{passive:false});
  return()=>{cancelAnimationFrame(frame);if(settleTimer.current)clearTimeout(settleTimer.current);node.removeEventListener('scroll',scroll);node.removeEventListener('scrollend',end);node.removeEventListener('pointerdown',manual);node.removeEventListener('wheel',onWheel);};
 },[multiple,views.length,choose,select]);
 useEffect(()=>{
  const video=player.current;if(!video)return;let visible=true;
  const sync=()=>{if(visible&&document.visibilityState==='visible'){video.muted=true;void video.play().catch(()=>{});}else video.pause();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});observer.observe(video);
  const sample=setTimeout(()=>readBorders(video),600);video.addEventListener('canplay',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{clearTimeout(sample);observer.disconnect();video.removeEventListener('canplay',sync);document.removeEventListener('visibilitychange',sync);video.pause();};
 },[selected.src,selected.video,readBorders]);
 const padding=space.padding,width=Math.max(26,Math.min(space.width,(space.height-padding*2)*ratio+padding*2)),height=(width-padding*2)/ratio+padding*2;
 return <div className="fitted-artwork-host media-gallery" data-multiple={multiple} data-tray={hovered||keyboard}
 onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true);}} onPointerLeave={()=>setHovered(false)} onPointerDown={()=>setKeyboard(false)} onFocus={e=>{if(e.target.matches(':focus-visible'))setKeyboard(true);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setKeyboard(false);}}>
 <div ref={host} className="artwork-viewer"><div className="fitted-artwork-frame" tabIndex={0} aria-label={t('FittedArtwork.1','Photos de l’œuvre')} style={{...(space.width?{width,height}:{}),'--media-ratio':ratio} as CSSProperties}>
 <div className="fitted-artwork-media" data-video={selected.video||undefined} data-cropped={cropped}>{selected.video?<video ref={player} key={selected.src} autoPlay loop muted playsInline disablePictureInPicture disableRemotePlayback preload="auto" style={videoPlacement(natural,crop,ratio)} onLoadedData={e=>readBorders(e.currentTarget)} src={selected.src} aria-label={selected.alt} onLoadedMetadata={e=>remember(selected.src,e.currentTarget.videoWidth,e.currentTarget.videoHeight)} onError={()=>setFailed(true)}/>:<Image key={selected.src} src={selected.src} alt={selected.alt} fill priority sizes="(max-width:767px) 100vw, 55vw" onLoad={e=>remember(selected.src,e.currentTarget.naturalWidth,e.currentTarget.naturalHeight)} onError={()=>setFailed(true)}/>}</div>
 {failed&&<p className="media-error" role="status">{selected.alt} — {t('FittedArtwork.error','Média indisponible.')}</p>}
 </div></div>
 {multiple&&<div ref={rail} className="artwork-photo-tray media-choice-rail" role="group" aria-label={t('FittedArtwork.2','Choisir une photographie')}
 onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?views.length-1:(activeIndex.current+(e.key==='ArrowRight'?1:-1)+views.length)%views.length;choose(n);(rail.current?.children[n] as HTMLElement)?.focus({preventScroll:true});}if(e.key==='Escape'){setKeyboard(false);setHovered(false);}}}>
 {views.map((media,n)=><button key={media.src+':'+n} type="button" style={{'--thumb-ratio':displayRatio(media,(ratios[media.src]??1)*(crops[media.src]?.width??1)/(crops[media.src]?.height??1))} as CSSProperties} aria-label={(media.video?t('FittedArtwork.video','Vidéo '):t('FittedArtwork.attribute.1','Photographie '))+(n+1)+' — '+media.alt} aria-pressed={active===n} onClick={()=>choose(n)}>
 {media.video?<span className="media-video-window media-thumb-window"><video src={media.src} muted playsInline preload="metadata" aria-hidden="true" style={videoPlacement(ratios[media.src]??1,crops[media.src]??fullVideo,displayRatio(media,(ratios[media.src]??1)*(crops[media.src]?.width??1)/(crops[media.src]?.height??1)))} onLoadedMetadata={e=>remember(media.src,e.currentTarget.videoWidth,e.currentTarget.videoHeight)}/></span>:<span className="media-thumb-window"><Image src={media.src} alt="" fill sizes="100px" onLoad={e=>remember(media.src,e.currentTarget.naturalWidth,e.currentTarget.naturalHeight)}/></span>}
 </button>)}
 </div>}
 </div>;
}

"use client";
import {useCopy} from './SiteCopy';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
type Media={src:string;alt:string;video?:boolean};
export function FittedArtwork({image,alt,photos,videos}:{image:string;alt:string;photos?:Media[];videos?:Media[]}){
 const t=useCopy(),host=useRef<HTMLDivElement>(null),rail=useRef<HTMLDivElement>(null);
 const [space,setSpace]=useState({width:0,height:0}),[ratio,setRatio]=useState(1),[active,setActive]=useState(0),[hovered,setHovered]=useState(false),[keyboard,setKeyboard]=useState(false),[failed,setFailed]=useState(false);
 const views:Media[]=[{src:image,alt},...(photos??[]),...(videos??[]).map(v=>({...v,video:true}))];const selected=views[active]??views[0],multiple=views.length>1;
 useEffect(()=>{const node=host.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setSpace({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(node);return()=>observer.disconnect()},[]);
 const padding=13,width=Math.max(26,Math.min(space.width,(space.height-padding*2)*ratio+padding*2)),height=(width-padding*2)/ratio+padding*2;
 function choose(n:number){setActive(n);setFailed(false);rail.current?.children[n]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})}
 return <div ref={host} className="fitted-artwork-host media-gallery" data-multiple={multiple} data-tray={hovered||keyboard}
 onPointerEnter={e=>{if(e.pointerType==='mouse')setHovered(true)}} onPointerLeave={()=>setHovered(false)} onPointerDown={()=>setKeyboard(false)} onFocus={e=>{if(e.target.matches(':focus-visible'))setKeyboard(true)}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setKeyboard(false)}}>
 <div className="fitted-artwork-frame" tabIndex={0} aria-label={t('FittedArtwork.1','Photos de l’œuvre')} style={space.width?{width,height}:undefined}>
 <div className="fitted-artwork-media">{selected.video?<video key={selected.src} controls playsInline preload="metadata" src={selected.src} aria-label={selected.alt} onLoadedMetadata={e=>{if(e.currentTarget.videoHeight)setRatio(e.currentTarget.videoWidth/e.currentTarget.videoHeight)}} onError={()=>setFailed(true)}/>:<Image key={selected.src} src={selected.src} alt={selected.alt} fill priority sizes="(max-width:767px) 100vw, 55vw" onLoad={e=>{if(e.currentTarget.naturalHeight)setRatio(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)}} onError={()=>setFailed(true)}/>}</div>
 {failed&&<p className="media-error" role="status">{selected.alt} — {t('FittedArtwork.error','Média indisponible.')}</p>}

 </div>
 {multiple&&<div ref={rail} className="artwork-photo-tray media-choice-rail" role="group" aria-label={t('FittedArtwork.2','Choisir une photographie')}
 onWheel={e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX))e.currentTarget.scrollLeft+=e.deltaY}}
 onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?views.length-1:(active+(e.key==='ArrowRight'?1:-1)+views.length)%views.length;choose(n);(rail.current?.children[n] as HTMLElement)?.focus()}if(e.key==='Escape'){setKeyboard(false);setHovered(false)}}}>
 {views.map((media,n)=><button key={media.src+':'+n} type="button" aria-label={(media.video?'Vidéo ':t('FittedArtwork.attribute.1','Photographie '))+(n+1)+' — '+media.alt} aria-pressed={active===n} onClick={()=>choose(n)}>
 {media.video?<><video src={media.src} muted playsInline preload="metadata" aria-hidden="true" onLoadedMetadata={e=>{if(e.currentTarget.videoHeight)e.currentTarget.parentElement!.style.aspectRatio=String(e.currentTarget.videoWidth/e.currentTarget.videoHeight)}}/><span className="media-play" aria-hidden="true">▶</span></>:<Image src={media.src} alt="" width={110} height={110} onLoad={e=>{if(e.currentTarget.naturalHeight)e.currentTarget.parentElement!.style.aspectRatio=String(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)}}/>}
 </button>)}
 </div>}
 </div>;
}

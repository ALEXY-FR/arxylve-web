"use client";
import {ArtworkVideoPreview} from './ArtworkVideoPreview';
import {mediaRatio,type MediaFormat} from '../data/media-format';
import {formatPrice,statusLabels,type Sculpture} from '../data/sculptures';
import Image from 'next/image';
import Link from 'next/link';
import {useLocalizedSite as useSite} from './useLocalizedSite';
import {useCopy} from './SiteCopy';
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties,type MouseEvent} from 'react';

type Slide={src:string;alt:string;format?:MediaFormat;video?:boolean};
function MobileWorkCard({item,playing,first,suppressClick}:{item:Sculpture;playing:boolean;first:boolean;suppressClick:(event:MouseEvent<HTMLAnchorElement>)=>void}){
 const t=useCopy(),card=useRef<HTMLDivElement>(null),info=useRef<HTMLDivElement>(null);
 const slides=useMemo<Slide[]>(()=>{
  const seen=new Set<string>();
  const all:Slide[]=[...(item.videos??[]).map(video=>({...video,video:true})),{src:item.image,alt:item.imageAlt},...(item.photos??[])];
  return all.filter(media=>{const key=(media.video?'video:':'photo:')+media.src;if(seen.has(key))return false;seen.add(key);return true;});
 },[item.videos,item.image,item.imageAlt,item.photos]);
 const [frame,setFrame]=useState({index:0,ready:false,failed:false}),[ratios,setRatios]=useState<Record<string,number>>({});
 const index=frame.index%slides.length,selected=slides[index],ratio=mediaRatio(selected.format,ratios[selected.src]??1);
 const advance=useCallback(()=>setFrame(current=>({index:(current.index+1)%slides.length,ready:false,failed:false})),[slides.length]);
 const ready=useCallback((failed=false)=>setFrame(current=>current.index%slides.length!==index?current:current.ready&&current.failed===failed?current:{...current,ready:true,failed}),[index,slides.length]);
 const remember=useCallback((natural:number)=>setRatios(current=>current[selected.src]===natural?current:{...current,[selected.src]:natural}),[selected.src]);
 useEffect(()=>{const node=info.current;if(!node)return;const observer=new ResizeObserver(()=>card.current?.style.setProperty('--mobile-info-height',node.getBoundingClientRect().height+'px'));observer.observe(node);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!playing||!frame.ready||slides.length<2||(selected.video&&!frame.failed))return;const timer=setTimeout(advance,5000);return()=>clearTimeout(timer);},[playing,frame.ready,frame.failed,index,selected.video,slides.length,advance]);
 const href='/collection/'+item.slug;
 return <div ref={card} className="mobile-work-card" data-slide={index} data-slide-count={slides.length}>
  <Link href={href} className="mobile-work-image" aria-label={t('HomeGallery.attribute.1','Voir les informations et la fiche de ')+item.title} draggable={false} onClick={suppressClick}>
   <span className="mobile-home-slide" data-kind={selected.video?'video':'photo'} data-ready={frame.ready} style={{'--slide-ratio':ratio} as CSSProperties}>
    {selected.video?<ArtworkVideoPreview key={index+':'+selected.src} video={selected} poster={item.image} playing={playing} retain={playing} loop={slides.length===1} sizes="92vw" onRatio={remember} onReady={()=>ready()} onUnavailable={()=>ready(true)} onEnded={()=>{if(playing)advance();}}/>:<Image key={index+':'+selected.src} className="mobile-slide-image" src={selected.src} alt={selected.alt} fill sizes="(max-width:767px) 92vw, 1px" priority={first&&index===0&&!selected.video} loading={playing?'eager':'lazy'} draggable={false} style={{objectFit:selected.format&&selected.format!=='original'?'cover':'contain'}} onLoad={event=>{const image=event.currentTarget;if(image.naturalHeight)remember(image.naturalWidth/image.naturalHeight);ready();}} onError={()=>ready(true)}/>}
   </span>
  </Link>
  <div ref={info} className="mobile-work-info">
   <div className="mobile-work-heading"><h2><Link href={href} onClick={suppressClick}>{item.title}</Link></h2></div>
   <dl><div><dt>{t('HomeGallery.4','Édition')}</dt><dd>{item.editionLabel}</dd></div><div><dt>{t('HomeGallery.5','Dimensions')}</dt><dd>{item.dimensions}</dd></div><div><dt>{t('HomeGallery.6','État')}</dt><dd>{t('status.'+item.status,statusLabels[item.status])}</dd></div><div><dt>{t('HomeGallery.7','Prix')}</dt><dd>{item.price===null?t('HomeGallery.8','Sur demande'):formatPrice(item.price)}</dd></div></dl>
  </div>
 </div>;
}
export function MobileHomeGallery(){
 const {content}=useSite(),t=useCopy(),rail=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number;left:number;mouse:boolean}|null>(null),dragged=useRef(false);
 const count=content.sculptures.length,[active,setActive]=useState(0),[visible,setVisible]=useState(false);
 useEffect(()=>{const node=rail.current;if(!node)return;let inView=false;const sync=()=>setVisible(inView&&document.visibilityState==='visible');const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync();},{threshold:.1});observer.observe(node);document.addEventListener('visibilitychange',sync);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);};},[]);
 useEffect(()=>{
  const node=rail.current;if(!node)return;
  let lastWheel=0,sum=0,lastEvent=0,previousWidth=node.clientWidth,frame=0;
  const works=Array.from(node.querySelectorAll<HTMLElement>('.mobile-home-work'));
  const measure=()=>{if(!node.clientWidth)return;const index=previousWidth?Math.round(node.scrollLeft/previousWidth):0;if(node.clientWidth!==previousWidth){node.scrollLeft=index*node.clientWidth;previousWidth=node.clientWidth;}const next=Math.round(node.scrollLeft/node.clientWidth);setActive(next);const selected=works[next];if(selected)node.style.height=selected.offsetHeight+'px';};
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(schedule);observer.observe(node);works.forEach(work=>observer.observe(work));node.addEventListener('scroll',schedule,{passive:true});schedule();
  const wheel=(event:WheelEvent)=>{if(event.ctrlKey||count<2||!node.clientWidth)return;if(Math.abs(event.deltaY)>Math.abs(event.deltaX)&&document.documentElement.scrollHeight>innerHeight)return;event.preventDefault();const now=Date.now();if(now-lastWheel<650)return;if(now-lastEvent>180)sum=0;lastEvent=now;sum+=(Math.abs(event.deltaY)>Math.abs(event.deltaX)?event.deltaY:event.deltaX)*(event.deltaMode===1?16:event.deltaMode===2?node.clientWidth:1);if(Math.abs(sum)<35)return;const next=(Math.round(node.scrollLeft/node.clientWidth)+(sum>0?1:-1)+count)%count;sum=0;lastWheel=now;node.scrollTo({left:next*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};node.addEventListener('wheel',wheel,{passive:false});
  return()=>{observer.disconnect();cancelAnimationFrame(frame);node.removeEventListener('scroll',schedule);node.removeEventListener('wheel',wheel);};
 },[count,content.sculptures]);
 const suppressClick=(event:MouseEvent<HTMLAnchorElement>)=>{if(dragged.current&&event.detail!==0){event.preventDefault();dragged.current=false;}};
 return <div className="mobile-home-gallery" ref={rail} role="region" aria-label={t('HomeGallery.2','Galerie des sculptures : molette, glissement ou touches directionnelles')} tabIndex={0}
  onPointerDown={event=>{if(event.button!==0)return;start.current={x:event.clientX,y:event.clientY,left:event.currentTarget.scrollLeft,mouse:event.pointerType==='mouse'};dragged.current=false;}}
  onPointerMove={event=>{const origin=start.current;if(!origin)return;if(Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>12)dragged.current=true;if(origin.mouse&&dragged.current){event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.style.scrollSnapType='none';event.currentTarget.scrollLeft=origin.left+origin.x-event.clientX;}}}
  onPointerUp={event=>{const origin=start.current;start.current=null;if(!origin?.mouse||!dragged.current)return;const node=event.currentTarget;node.style.removeProperty('scroll-snap-type');const delta=origin.x-event.clientX,index=Math.max(0,Math.min(count-1,Math.round(origin.left/node.clientWidth)+(Math.abs(delta)>35?Math.sign(delta):0)));node.scrollTo({left:index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}
  onPointerCancel={event=>{start.current=null;dragged.current=true;event.currentTarget.style.removeProperty('scroll-snap-type');}}
  onKeyDown={event=>{if(event.target!==event.currentTarget||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)||!rail.current||!count)return;event.preventDefault();const node=rail.current,index=(Math.round(node.scrollLeft/node.clientWidth)+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+count)%count;node.scrollTo({left:index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>
  <h1 className="sr-only">{t('HomeGallery.3','ARXYLVE — Atelier de design')}</h1>
  {content.sculptures.map((item,index)=><article className="mobile-home-work" key={item.slug}><MobileWorkCard item={item} playing={visible&&active===index} first={index===0} suppressClick={suppressClick}/></article>)}
  {!count&&<p>{t('HomeGallery.1','La collection se prépare.')}</p>}
 </div>;
}

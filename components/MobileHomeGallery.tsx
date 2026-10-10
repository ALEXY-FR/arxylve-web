"use client";
import {ArtworkVideoPreview} from './ArtworkVideoPreview';
import {mediaRatio} from '../data/media-format';
import type {Sculpture} from '../data/sculptures';
import Image from "next/image";
import Link from "next/link";
import {useLocalizedSite as useSite} from "./useLocalizedSite";
import {useCopy} from "./SiteCopy";
import {useEffect,useRef,useState} from 'react';

function MobileVideo({video,poster,playing}:{video:NonNullable<Sculpture['videos']>[number];poster:string;playing:boolean}){
 const [ratio,setRatio]=useState(()=>mediaRatio(video.format,1));
 return <span className="mobile-home-video" style={{aspectRatio:ratio}}><ArtworkVideoPreview video={video} poster={poster} playing={playing} onRatio={setRatio}/></span>;
}
export function MobileHomeGallery(){
 const {content}=useSite();const t=useCopy();const rail=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number;left:number;mouse:boolean}|null>(null),dragged=useRef(false);
 const count=content.sculptures.length;const [active,setActive]=useState(0),[visible,setVisible]=useState(false);
 useEffect(()=>{const node=rail.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.1});observer.observe(node);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  const node=rail.current;if(!node)return;
  let lastWheel=0,sum=0,lastEvent=0,previousWidth=node.clientWidth,frame=0;
  const works=Array.from(node.querySelectorAll<HTMLElement>('.mobile-home-work'));
  const measure=()=>{
   if(!node.clientWidth)return;
   const index=previousWidth?Math.round(node.scrollLeft/previousWidth):0;
   if(node.clientWidth!==previousWidth){node.scrollLeft=index*node.clientWidth;previousWidth=node.clientWidth}
   const indexNow=Math.round(node.scrollLeft/node.clientWidth);setActive(indexNow);
   const selected=works[indexNow];
   if(selected)node.style.height=selected.offsetHeight+'px';
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure)};
  const observer=new ResizeObserver(schedule);observer.observe(node);works.forEach(work=>observer.observe(work));
  node.addEventListener('scroll',schedule,{passive:true});schedule();
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||count<2||!node.clientWidth)return;
   if(Math.abs(event.deltaY)>Math.abs(event.deltaX)&&document.documentElement.scrollHeight>innerHeight)return;
   event.preventDefault();const now=Date.now();if(now-lastWheel<650)return;
   if(now-lastEvent>180)sum=0;lastEvent=now;
   sum+=(Math.abs(event.deltaY)>Math.abs(event.deltaX)?event.deltaY:event.deltaX)*(event.deltaMode===1?16:event.deltaMode===2?node.clientWidth:1);
   if(Math.abs(sum)<35)return;
   const index=(Math.round(node.scrollLeft/node.clientWidth)+(sum>0?1:-1)+count)%count;
   sum=0;lastWheel=now;node.scrollTo({left:index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };node.addEventListener('wheel',wheel,{passive:false});
  return()=>{observer.disconnect();cancelAnimationFrame(frame);node.removeEventListener('scroll',schedule);node.removeEventListener('wheel',wheel)};
 },[count,content.sculptures]);
 return <div className="mobile-home-gallery" ref={rail} role="region" aria-label={t('HomeGallery.2','Galerie des sculptures : molette, glissement ou touches directionnelles')} tabIndex={0}
  onPointerDown={e=>{if(e.button!==0)return;start.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,mouse:e.pointerType==='mouse'};dragged.current=false}}
  onPointerMove={e=>{const origin=start.current;if(!origin)return;if(Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>12)dragged.current=true;if(origin.mouse&&dragged.current){e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.style.scrollSnapType='none';e.currentTarget.scrollLeft=origin.left+origin.x-e.clientX}}}
  onPointerUp={e=>{const origin=start.current;start.current=null;if(!origin?.mouse||!dragged.current)return;const node=e.currentTarget;node.style.removeProperty('scroll-snap-type');const delta=origin.x-e.clientX,index=Math.max(0,Math.min(count-1,Math.round(origin.left/node.clientWidth)+(Math.abs(delta)>35?Math.sign(delta):0)));node.scrollTo({left:index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}
  onPointerCancel={e=>{start.current=null;dragged.current=true;e.currentTarget.style.removeProperty('scroll-snap-type')}}
  onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!rail.current||!count)return;e.preventDefault();const node=rail.current,index=(Math.round(node.scrollLeft/node.clientWidth)+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+count)%count;node.scrollTo({left:index*node.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}>
  <h1 className="sr-only">{t("HomeGallery.3","Sculptures miroir ARXYLVE")}</h1>
  {content.sculptures.map((item,index)=><article className="mobile-home-work" key={item.slug}>
   <Link href={'/collection/'+item.slug} className="mobile-work-image" aria-label={t("HomeGallery.attribute.1","Voir les informations et la fiche de ")+item.title} draggable={false} onClick={e=>{if(dragged.current&&e.detail!==0){e.preventDefault();dragged.current=false}}}>
    {item.videos?.[0]?<MobileVideo key={item.videos[0].src} video={item.videos[0]} poster={item.image} playing={visible&&active===index}/>:<Image src={item.image} alt={item.imageAlt} width={1200} height={1200} sizes="(max-width:767px) 92vw, 1px" priority={index===0} draggable={false}/>}
   </Link>
  </article>)}
  {!content.sculptures.length&&<p>{t("HomeGallery.1","La collection se prépare.")}</p>}
 </div>
}

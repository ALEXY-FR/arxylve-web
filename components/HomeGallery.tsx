"use client";
import {SiteCopy,useCopy} from "./SiteCopy";
import {useLocalizedSite as useSite} from "./useLocalizedSite";
import {HomeSidePhotos} from "./HomeSidePhotos";
import {MobileHomeGallery} from "./MobileHomeGallery";
import {TabletHomeGallery} from './TabletHomeGallery';
import Image from "next/image";import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {statusLabels,formatPrice} from "../data/sculptures";
export function HomeGallery(){return <><DesktopHomeGallery/><TabletHomeGallery/><MobileHomeGallery/></>}
function DesktopHomeGallery(){const t=useCopy();const {content}=useSite();const sculptures=content.sculptures;
 const [active,setActive]=useState(0),[direction,setDirection]=useState(1),[info,setInfo]=useState(false),[ratio,setRatio]=useState(1),[space,setSpace]=useState({width:0,height:0});
 const lastPointer=useRef<{x:number;y:number}|null>(null);
 const surface=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),lastMove=useRef(0),didSwipe=useRef(false),touch=useRef(false),start=useRef<{x:number;y:number}|null>(null);
 const count=sculptures.length;
 function move(delta:number){if(count<2)return;setDirection(delta);setInfo(false);setActive(current=>(current+delta+count)%count);}
 useEffect(()=>{const node=stage.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setSpace({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{const node=surface.current;if(!node||count<2)return;let sum=0,last=0;const wheel=(e:WheelEvent)=>{const panel=(e.target as Element).closest<HTMLElement>(".hover-artwork-info");if(panel&&panel.scrollHeight>panel.clientHeight&&Math.abs(e.deltaY)>Math.abs(e.deltaX))return;e.preventDefault();const now=Date.now();if(now-lastMove.current<650)return;if(now-last>180)sum=0;last=now;sum+=Math.abs(e.deltaY)>Math.abs(e.deltaX)?e.deltaY:e.deltaX;if(Math.abs(sum)<35)return;const delta=sum>0?1:-1;sum=0;lastMove.current=now;setDirection(delta);setInfo(false);setActive(current=>(current+delta+count)%count)};node.addEventListener('wheel',wheel,{passive:false});return()=>node.removeEventListener('wheel',wheel)},[count]);
 useEffect(()=>{const timer=setTimeout(()=>{const pointer=lastPointer.current;const frame=stage.current?.querySelector('.fitted-object');if(!pointer||!frame)return;const box=frame.getBoundingClientRect();if(pointer.x>=box.left&&pointer.x<=box.right&&pointer.y>=box.top&&pointer.y<=box.bottom)setInfo(true);},550);return()=>clearTimeout(timer)},[active]);
 const item=sculptures[active];if(!item)return <p><SiteCopy id="HomeGallery.1" fallback="La collection se prépare."/></p>;
 const padding=13;const width=Math.max(0,Math.min(space.width*.64,(space.height-16-padding*2)*ratio+padding*2));const height=(width-padding*2)/ratio+padding*2;
 return <div className="home-gallery minimal-gallery" ref={surface} onPointerMove={e=>{if(e.pointerType==='mouse')lastPointer.current={x:e.clientX,y:e.clientY}}} onPointerLeave={()=>{lastPointer.current=null}} tabIndex={0} role="region" aria-label={t("HomeGallery.2","Galerie des sculptures : molette, glissement ou touches directionnelles")} onKeyDown={e=>{if(['ArrowRight','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();move(1)}if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();move(-1)}if(e.key==='Escape')setInfo(false)}} onPointerDown={e=>{touch.current=e.pointerType==='touch';didSwipe.current=false;if(touch.current)start.current={x:e.clientX,y:e.clientY}}} onPointerUp={e=>{if(!start.current)return;const x=e.clientX-start.current.x,y=e.clientY-start.current.y;start.current=null;const delta=Math.abs(x)>Math.abs(y)?x:y;if(Math.abs(delta)>45){didSwipe.current=true;move(delta<0?1:-1)}}} onPointerCancel={()=>{start.current=null}}>
 <h1 className="sr-only"><SiteCopy id="HomeGallery.3" fallback="Sculptures miroir ARXYLVE"/></h1>
 <div className="gallery-stage" ref={stage} data-direction={direction} data-hover={info}>
 <HomeSidePhotos key={"side-"+item.slug} slug={item.slug} space={space} mainWidth={width} visible={info} photos={item.photos?.length?item.photos:[{src:item.image,alt:item.imageAlt+" — vue secondaire 1"},{src:item.image,alt:item.imageAlt+" — vue secondaire 2"}]}/>
 <Link key={"main-"+item.slug} className="gallery-object fitted-object" href={'/collection/'+item.slug} style={space.width?{width,height}:undefined} aria-label={t("HomeGallery.attribute.1","Voir les informations et la fiche de ")+item.title} onPointerEnter={e=>{if(e.pointerType==='mouse'){lastPointer.current={x:e.clientX,y:e.clientY};setInfo(true)}}} onPointerLeave={e=>{if(e.pointerType==='mouse')setInfo(false)}} onFocus={()=>{if(!touch.current)setInfo(true)}} onBlur={()=>setInfo(false)} onClick={e=>{if(didSwipe.current){e.preventDefault();didSwipe.current=false;return;}if(touch.current&&!info){e.preventDefault();setInfo(true);}}} draggable={false}>
 <div className="gallery-media"><Image src={item.image} alt={item.imageAlt} fill priority loading="eager" sizes="90vw" draggable={false} onLoad={e=>{const image=e.currentTarget;if(image.naturalWidth&&image.naturalHeight)setRatio(image.naturalWidth/image.naturalHeight)}}/></div>
 <div className="hover-artwork-info" data-visible={info} aria-hidden={!info}><h2>{item.title}</h2><dl><div><dt><SiteCopy id="HomeGallery.4" fallback="Édition"/></dt><dd>{item.editionLabel}</dd></div><div><dt><SiteCopy id="HomeGallery.5" fallback="Dimensions"/></dt><dd>{item.dimensions}</dd></div><div><dt><SiteCopy id="HomeGallery.6" fallback="État"/></dt><dd>{t('status.'+item.status,statusLabels[item.status])}</dd></div><div><dt><SiteCopy id="HomeGallery.7" fallback="Prix"/></dt><dd>{item.price===null?t("HomeGallery.8","Sur demande"):formatPrice(item.price)}</dd></div></dl></div>
 </Link></div></div>;
}

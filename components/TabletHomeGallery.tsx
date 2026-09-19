"use client";
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {useLocalizedSite} from './useLocalizedSite';
import {useCopy} from './SiteCopy';
import {formatPrice,statusLabels} from '../data/sculptures';

function TabletPhoto({src,alt,href,onClick,suppressClick}:{src:string;alt:string;href?:string;onClick?:()=>void;suppressClick?:()=>boolean}){
 const host=useRef<HTMLDivElement>(null),[space,setSpace]=useState({width:0,height:0}),[ratio,setRatio]=useState(1);
 useEffect(()=>{const node=host.current;if(!node)return;const observer=new ResizeObserver(([entry])=>setSpace({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(node);return()=>observer.disconnect()},[]);
 const inset=11,width=Math.max(inset*2,Math.min(space.width,(space.height-inset*2)*ratio+inset*2)),height=(width-inset*2)/ratio+inset*2;
 useEffect(()=>{if(href&&space.width)host.current?.closest<HTMLElement>('.tablet-home-gallery')?.style.setProperty('--main-photo-height',height+'px')},[href,height,space.width]);
 const image=<span className="tablet-photo-media"><Image src={src} alt={alt} fill sizes="(max-width:1199px) 55vw, 40vw" draggable={false} onLoad={e=>{if(e.currentTarget.naturalHeight)setRatio(e.currentTarget.naturalWidth/e.currentTarget.naturalHeight)}}/></span>;
 return <div className="tablet-photo-host" ref={host}>{href?<Link className="tablet-photo-frame" href={href} style={{width,height}} draggable={false} onClick={e=>{if(suppressClick?.())e.preventDefault()}}>{image}</Link>:<button className="tablet-photo-frame" type="button" style={{width,height}} onClick={onClick}>{image}</button>}</div>;
}

export function TabletHomeGallery(){
 const {content}=useLocalizedSite(),t=useCopy(),[active,setActive]=useState(0),[photo,setPhoto]=useState<number|null>(null);
 const root=useRef<HTMLDivElement>(null),start=useRef<{x:number;y:number}|null>(null),dragged=useRef(false);const count=content.sculptures.length;
 function move(delta:number){if(count<2)return;setActive(n=>(n+delta+count)%count);setPhoto(null)}
 useEffect(()=>{const node=root.current;if(!node)return;let last=0;const wheel=(e:WheelEvent)=>{if(e.ctrlKey||!node.clientWidth||(e.target as HTMLElement).closest('.tablet-artwork-info'))return;e.preventDefault();if(Date.now()-last<650||Math.abs(e.deltaY)+Math.abs(e.deltaX)<20||count<2)return;last=Date.now();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;setActive(n=>(n+(delta>0?1:-1)+count)%count);setPhoto(null)};node.addEventListener('wheel',wheel,{passive:false});return()=>node.removeEventListener('wheel',wheel)},[count]);
 const item=content.sculptures[active]??content.sculptures[0];if(!item)return null;
 const photos=(item.photos?.length?item.photos:[{src:item.image,alt:item.imageAlt},{src:item.image,alt:item.imageAlt}]).slice(0,6),selected=photo===null?{src:item.image,alt:item.imageAlt}:photos[photo];
 return <div className="tablet-home-gallery" ref={root} tabIndex={0} role="region" aria-label={t('HomeGallery.2','Galerie des sculptures : molette, glissement ou touches directionnelles')}
 onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}}
 onPointerDown={e=>{dragged.current=false;if(!(e.target as HTMLElement).closest('.tablet-artwork-info'))start.current={x:e.clientX,y:e.clientY}}}
 onPointerUp={e=>{const p=start.current;start.current=null;if(!p)return;const dx=e.clientX-p.x;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(e.clientY-p.y)){dragged.current=true;move(dx<0?1:-1)}}}
 onPointerCancel={()=>{start.current=null;dragged.current=true}}>
 <div className="tablet-main-photo"><TabletPhoto key={selected.src} src={selected.src} alt={selected.alt} href={'/collection/'+item.slug} suppressClick={()=>dragged.current}/></div>
 <section className="tablet-artwork-info"><h1>{item.title}</h1><dl>
 <div><dt>{t('HomeGallery.4','Édition')}</dt><dd>{item.editionLabel}</dd></div>
 <div><dt>{t('HomeGallery.5','Dimensions')}</dt><dd>{item.dimensions}</dd></div>
 <div><dt>{t('HomeGallery.6','État')}</dt><dd>{t('status.'+item.status,statusLabels[item.status])}</dd></div>
 <div><dt>{t('HomeGallery.7','Prix')}</dt><dd>{item.price===null?t('HomeGallery.8','Sur demande'):formatPrice(item.price)}</dd></div>
 </dl></section>
 <div className="tablet-secondary-photos" style={{gridTemplateColumns:`repeat(${Math.min(3,photos.length)}, minmax(0,1fr))`}}>{photos.map((p,i)=><TabletPhoto key={item.slug+':'+i+':'+p.src} src={p.src} alt={p.alt} onClick={()=>{if(!dragged.current)setPhoto(i)}}/>)}</div>
 </div>;
}

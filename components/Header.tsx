"use client";
import {SiteCopy,useCopy} from "./SiteCopy";
import Link from "next/link";
import {useSite} from "./SiteProvider";
import {palette} from "../data/palette";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState,type CSSProperties} from "react";

const links=[{href:"/collection",label:"Collection"},{href:"/sur-mesure",label:"Sur-Mesure"},{href:"/a-propos",label:"À Propos"},{href:"/panier",label:"Panier"}];
export function Header(){
 const t=useCopy(),{admin,preview}=useSite(),pathname=usePathname();
 const header=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 const [tone,setTone]=useState(3),[open,setOpen]=useState(false);
 const recolor=()=>setTone(previous=>{const choices=palette.map((_,index)=>index).filter(index=>index!==previous);return choices[Math.floor(Math.random()*choices.length)]});
 useEffect(()=>{const node=header.current;if(!node)return;const observer=new ResizeObserver(()=>document.documentElement.style.setProperty("--navigation-height",node.getBoundingClientRect().height+"px"));observer.observe(node);return()=>{observer.disconnect();document.documentElement.style.removeProperty("--navigation-height")}},[pathname]);
 useEffect(()=>{function close(e:KeyboardEvent){if(e.key==='Escape'&&open){setOpen(false);toggle.current?.focus()}}function outside(e:PointerEvent){if(open&&!header.current?.contains(e.target as Node))setOpen(false)}document.addEventListener('keydown',close);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',close);document.removeEventListener('pointerdown',outside)}},[open]);
 if(pathname==='/admin')return null;
 return <header ref={header} className="site-header" style={{"--active-color":palette[tone].rgb} as CSSProperties}>
 <Link href="/" className="wordmark brand-button" aria-label={t("Header.1","ARXYLVE — Accueil")} aria-current={pathname==='/'?'page':undefined} onClick={()=>{setOpen(false);recolor()}}><SiteCopy id="Header.2" fallback="ARXYLVE"/></Link>
 <div className="navigation-group"><button ref={toggle} className="glass-menu-toggle" type="button" aria-label={open?'Fermer le menu':'Ouvrir le menu'} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}><span/><span/><span/></button>
 <nav id="main-navigation" className="desktop-nav" data-open={open} aria-label={t("Header.3","Navigation principale")}>{links.map(link=><Link key={link.href} href={link.href} onClick={()=>{setOpen(false);recolor()}} aria-current={pathname.startsWith(link.href)?"page":undefined}><SiteCopy id={'Header.nav'+link.href} fallback={link.label}/></Link>)}</nav></div>
 {admin&&!preview&&<Link className="admin-shortcut" href="/admin"><SiteCopy id="Header.4" fallback="Administration"/></Link>}</header>
}

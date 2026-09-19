"use client";
import {SiteCopy,useCopy} from "./SiteCopy";
import Link from "next/link";
import {LanguageSelector} from "./LanguageSelector";
import {useSite} from "./SiteProvider";
import {palette} from "../data/palette";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const links = [{href:"/collection",label:"Collection"},{href:"/sur-mesure",label:"Sur mesure"},{href:"/a-propos",label:"À propos"},{href:"/panier",label:"Panier"}];
export function Header() {const t=useCopy();const {admin,preview}=useSite();
  const pathname=usePathname(); const [tone,setTone]=useState(3); const recolor=()=>setTone(previous=>{const choices=palette.map((_,index)=>index).filter(index=>index!==previous);return choices[Math.floor(Math.random()*choices.length)]}); const [open,setOpen]=useState(false); const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const frame=requestAnimationFrame(()=>{setOpen(false);setTone(previous=>{const choices=palette.map((_,index)=>index).filter(index=>index!==previous);return choices[Math.floor(Math.random()*choices.length)]})});return()=>cancelAnimationFrame(frame)},[pathname]);
  useEffect(()=>{ if(!open)return; const escape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);toggle.current?.focus();}}; const media=window.matchMedia("(min-width: 801px)"); const close=()=>{if(media.matches)setOpen(false)}; media.addEventListener("change",close); document.addEventListener("keydown",escape); return ()=>{document.removeEventListener("keydown",escape);media.removeEventListener("change",close)}; },[open]);
  if(pathname==='/admin')return null; return <header className="site-header" style={{"--active-color":palette[tone].rgb} as CSSProperties}><Link href="/" className="wordmark brand-button" aria-label={t("Header.1","ARXYLVE — Accueil")} aria-current={pathname==='/'?'page':undefined} onClick={recolor}><SiteCopy id="Header.2" fallback="ARXYLVE"/></Link><nav className="desktop-nav" aria-label={t("Header.3","Navigation principale")}>{links.map(link=><Link key={link.href} href={link.href} onClick={recolor} aria-current={pathname.startsWith(link.href)?"page":undefined}><SiteCopy id={'Header.nav'+link.href} fallback={link.label}/></Link>)}</nav>{admin&&!preview&&<Link className="admin-shortcut" href="/admin"><SiteCopy id="Header.4" fallback="Administration"/></Link>}<LanguageSelector/><div className="header-actions"><button ref={toggle} className="menu-toggle" aria-controls="mobile-menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?t("Header.5","Fermer"):t("Header.6","Menu")}</button></div>{open&&<nav id="mobile-menu" className="mobile-nav" aria-label={t("Header.7","Navigation mobile")}>{links.map(link=><Link key={link.href} href={link.href} onClick={()=>{setOpen(false);recolor()}} aria-current={pathname.startsWith(link.href)?"page":undefined}><SiteCopy id={'Header.nav'+link.href} fallback={link.label}/></Link>)}</nav>}</header>;
}

"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {languageTag,parseLanguage,type Language} from '../data/languages';
import {translate} from '../data/translations';
const Context=createContext<{language:Language;setLanguage:(language:Language)=>void}>({language:'fr',setLanguage:()=>{}});
export const useLanguage=()=>useContext(Context);
export function LanguageProvider({initial,children}:{initial:Language;children:ReactNode}){
 const [selected,setSelected]=useState(initial);const pathname=usePathname();const language=pathname==='/admin'?'fr':selected;
 function setLanguage(next:Language){setSelected(next);document.cookie='arxylve-language='+next+'; Path=/; Max-Age=31536000; SameSite=Lax';}
 useEffect(()=>{const requested=parseLanguage(new URLSearchParams(location.search).get('lang'));if(requested){const frame=requestAnimationFrame(()=>setLanguage(requested));return()=>cancelAnimationFrame(frame)}},[]);
 useEffect(()=>{document.documentElement.lang=languageTag[language];const title:Record<string,string>={'/':'Sculptures miroir ARXYLVE','/collection':'Collection','/sur-mesure':'Sur mesure','/a-propos':'À propos','/panier':'Panier'};if(title[pathname])document.title=translate(title[pathname],language)+(pathname==='/'?'':' — ARXYLVE')},[language,pathname]);
 return <Context.Provider value={{language,setLanguage}}>{children}</Context.Provider>;
}

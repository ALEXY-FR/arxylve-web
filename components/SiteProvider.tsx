"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {initialContent,type SiteContent} from '../data/content';
import {copyFields} from '../data/copy-fields';
const Context=createContext<{content:SiteContent;admin:boolean;preview:boolean;cartPreview:'filled'|'empty';save:(next:SiteContent)=>Promise<void>}>({content:initialContent,admin:false,preview:false,cartPreview:'filled',save:async()=>{}});
export const useSite=()=>useContext(Context);
export function SiteProvider({children,initial,admin}:{children:ReactNode;initial:SiteContent;admin:boolean}){
 const [content,setContent]=useState(initial),[preview,setPreview]=useState(false),[picking,setPicking]=useState(false),[cartPreview,setCartPreview]=useState<'filled'|'empty'>('filled');const pathname=usePathname();
 useEffect(()=>{if(!admin||window.parent===window)return;const frame=requestAnimationFrame(()=>setPreview(true));
 const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='arxylve:draft')return;const next=event.data.content;if(!next||!Array.isArray(next.sculptures)||!next.texts)return;setContent(next);setPicking(!!event.data.picking);setCartPreview(event.data.cartPreview==='empty'?'empty':'filled')};
 addEventListener('message',receive);parent.postMessage({type:'arxylve:ready',path:location.pathname},location.origin);return()=>{cancelAnimationFrame(frame);removeEventListener('message',receive)};
 },[admin,pathname]);
 useEffect(()=>{if(!preview)return;document.documentElement.dataset.visualPreview=String(picking);
 const submit=(event:Event)=>{event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'arxylve:notice',message:'Aperçu uniquement : aucune demande n’a été envoyée.'},location.origin)};
 const click=(event:MouseEvent)=>{const target=event.target as HTMLElement;const link=target.closest('a');if(link&&(link.origin!==location.origin||link.pathname==='/admin')){event.preventDefault();event.stopImmediatePropagation();return}
 if(!picking)return;let key=target.closest<HTMLElement>('[data-copy-key]')?.dataset.copyKey;
 if(!key&&target.matches('input,textarea')){const hint=(target as HTMLInputElement).placeholder;const field=copyFields.find(f=>f.kind==='placeholder'&&(content.copy?.[scope()+':'+f.id]??f.fallback)===hint);if(field)key=scope()+':'+field.id}
 if(!key){const button=target.closest('button');if(button){const value=button.textContent;const field=copyFields.find(f=>f.kind==='text'&&(content.copy?.[scope()+':'+f.id]??f.fallback)===value);if(field)key=scope()+':'+field.id}}if(key){event.preventDefault();event.stopImmediatePropagation();parent.postMessage({type:'arxylve:select',key},location.origin)}};
 function scope(){return pathname.startsWith('/collection/')?'artwork':pathname==='/'?'home':pathname.slice(1)}
 document.addEventListener('submit',submit,true);document.addEventListener('click',click,true);return()=>{delete document.documentElement.dataset.visualPreview;document.removeEventListener('submit',submit,true);document.removeEventListener('click',click,true)};
 },[preview,picking,pathname,content.copy]);
 async function save(next:SiteContent){if(admin&&window.parent!==window){setContent(next);parent.postMessage({type:'arxylve:change',content:next},location.origin);return}const r=await fetch('/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)}),data=await r.json();if(!r.ok)throw Error(data.message);setContent(data)}
 return <Context.Provider value={{content,admin,preview,cartPreview,save}}>{children}</Context.Provider>
}

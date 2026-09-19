"use client";
import {useSite} from "./SiteProvider";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import {isSelectable,selectionKey,type Selection} from "../data/sculptures";
const storageKey="arxylve-mirror-cart-v2";
const Context=createContext<{items:Selection[];ready:boolean;add:(item:Selection)=>void;remove:(key:string)=>void}>({items:[],ready:false,add:()=>{},remove:()=>{}});
export function CartProvider({children}:{children:ReactNode}){const {content,admin,preview,cartPreview}=useSite();const sculptures=content.sculptures;
 const [items,setItems]=useState<Selection[]>([]);const [ready,setReady]=useState(false);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{if(admin&&window.parent!==window){const first=sculptures[0];setItems(cartPreview==='empty'||!first?[]:[{slug:first.slug,number:first.editionType==='limited-numbered'?first.availableNumbers?.[0]:undefined}]);setReady(true);return}try{const stored:unknown=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(stored)){const valid:Selection[]=[];for(const entry of stored){if(!entry||typeof entry!=="object"||typeof entry.slug!=="string")continue;const sculpture=sculptures.find(s=>s.slug===entry.slug);if(sculpture&&isSelectable(sculpture,entry.number)&&!valid.some(s=>selectionKey(s)===selectionKey(entry)))valid.push({slug:entry.slug,number:entry.number});}setItems(valid);}}catch{}finally{setReady(true)}});return()=>cancelAnimationFrame(frame)},[sculptures,admin,preview,cartPreview]);
 useEffect(()=>{if(ready&&!(admin&&window.parent!==window))try{localStorage.setItem(storageKey,JSON.stringify(items))}catch{}},[items,ready,admin]);
 function add(item:Selection){const sculpture=sculptures.find(s=>s.slug===item.slug);if(ready&&sculpture&&isSelectable(sculpture,item.number))setItems(current=>current.some(s=>selectionKey(s)===selectionKey(item))?current:[...current,item]);}
 return <Context.Provider value={{items,ready,add,remove:key=>setItems(current=>current.filter(item=>selectionKey(item)!==key))}}>{children}</Context.Provider>;
}
export const useCart=()=>useContext(Context);

"use client";
import {useEffect,useRef} from "react";
import {palette} from "../data/palette";

const initialTones=[0,2,1,3,0];
export function AmbientBackground(){
  const field=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const active=new WeakMap<HTMLElement,number>();
    let timer:ReturnType<typeof setInterval>|undefined;
    function vary(){
      field.current?.querySelectorAll<HTMLElement>('.ambient-blob').forEach((blob,index)=>{
        const layers=blob.querySelectorAll<HTMLElement>('.ambient-blob-color');
        const previous=active.get(blob),next=previous===undefined?0:1-previous;
        const tone=palette[Math.floor(Math.random()*palette.length)];
        // Paint a new color once, then crossfade cached layers with opacity.
        layers[next].style.backgroundColor='rgb('+tone.rgb+')';
        layers[next].style.opacity='1';
        layers[1-next].style.opacity='0';
        active.set(blob,next);
        if(previous===undefined)blob.style.borderRadius=Array.from({length:4},()=>Math.round(30+Math.random()*40)+'%').join(' ')+' / '+Array.from({length:4},()=>Math.round(30+Math.random()*40)+'%').join(' ');
        blob.style.transform='translate3d('+((Math.random()-.5)*65)+'vw, '+((Math.random()-.5)*60)+'vh, 0) rotate('+Math.floor(Math.random()*180)+'deg) scale('+(.2+Math.random()*.65)+')';
        blob.style.transitionDuration=(18+index*3)+'s';
      });
    }
    function update(){
      if(timer)clearInterval(timer);
      timer=undefined;
      if(!media.matches&&document.visibilityState==='visible'){vary();timer=setInterval(vary,18000);}
    }
    update();media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
    return()=>{if(timer)clearInterval(timer);media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
  },[]);
  return <div ref={field} className="ambient-background stable-ambient" aria-hidden="true">
    {initialTones.map((tone,index)=><div className="ambient-blob" key={index}>
      {[0,1].map(layer=><span key={layer} className="ambient-blob-color" style={{backgroundColor:'rgb('+palette[tone].rgb+')',opacity:layer===0?1:0}}/>)}
    </div>)}
  </div>;
}

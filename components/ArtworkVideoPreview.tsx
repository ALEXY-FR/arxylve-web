"use client";
import {mediaRatio} from '../data/media-format';
import Image from 'next/image';
import {useCallback,useEffect,useRef,useState} from 'react';
import {fullVideo,videoBorders,videoPlacement,type VideoCrop} from '../data/video-frame';
import type {Sculpture} from '../data/sculptures';
type Video=NonNullable<Sculpture['videos']>[number];
export function ArtworkVideoPreview({video,playing,poster,onRatio}:{video:Video;playing:boolean;poster:string;onRatio?:(ratio:number)=>void}){
 const player=useRef<HTMLVideoElement>(null),receiver=useRef(onRatio);
 const [natural,setNatural]=useState(1),[crop,setCrop]=useState<VideoCrop>(fullVideo),[failed,setFailed]=useState(false);
 const ratio=mediaRatio(video.format,natural*crop.width/crop.height);
 useEffect(()=>{receiver.current=onRatio;},[onRatio]);
 useEffect(()=>{receiver.current?.(ratio);},[ratio]);
 const borders=useCallback((element:HTMLVideoElement)=>{
  if(element.readyState<2||!element.videoWidth||!element.videoHeight)return;
  try{
   const canvas=document.createElement('canvas');canvas.width=320;canvas.height=Math.min(640,Math.max(32,Math.round(320*element.videoHeight/element.videoWidth)));
   const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return;context.drawImage(element,0,0,canvas.width,canvas.height);
   const next=videoBorders(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height)??fullVideo;
   setCrop(old=>{
    const left=Math.min(old===fullVideo?next.left:old.left,next.left),top=Math.min(old===fullVideo?next.top:old.top,next.top);
    const right=Math.max(old===fullVideo?0:old.left+old.width,next.left+next.width),bottom=Math.max(old===fullVideo?0:old.top+old.height,next.top+next.height);
    if(old.left===left&&old.top===top&&old.width===right-left&&old.height===bottom-top)return old;
    return {left,top,width:right-left,height:bottom-top};
   });
  }catch{/* Keep the source proportions if pixels cannot be inspected. */}
 },[]);
 useEffect(()=>{
  const element=player.current;if(!element||!playing||failed)return;let visible=true;
  const sync=()=>{if(visible&&document.visibilityState==='visible'){element.muted=true;void element.play().catch(()=>{});}else element.pause();};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1});observer.observe(element);
  const timer=setTimeout(()=>borders(element),600);element.addEventListener('canplay',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{clearTimeout(timer);observer.disconnect();element.removeEventListener('canplay',sync);document.removeEventListener('visibilitychange',sync);element.pause();};
 },[playing,failed,borders]);
 return <span className="home-video-preview">{playing&&!failed?<video ref={player} src={video.src} poster={poster} aria-label={video.alt} autoPlay muted loop playsInline disablePictureInPicture disableRemotePlayback preload="auto" style={videoPlacement(natural,crop,ratio)} onLoadedMetadata={event=>{if(event.currentTarget.videoHeight)setNatural(event.currentTarget.videoWidth/event.currentTarget.videoHeight);}} onLoadedData={event=>borders(event.currentTarget)} onError={()=>setFailed(true)}/>:<Image src={poster} alt={video.alt} fill sizes="24vw" style={{objectFit:'contain'}}/>}</span>;
}

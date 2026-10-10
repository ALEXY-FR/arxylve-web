"use client";
import {useRef,useState} from 'react';
import styles from './UploadProgress.module.css';
type Progress={phase:'transfer'|'prepare'|'done'|'error';percent:number;name:string;index:number;total:number;error?:string};
type Uploaded={src:string;video:boolean;alt:string};
export function useMediaUpload(){
 const [progress,setProgress]=useState<Progress|null>(null),active=useRef(false);
 async function transfer(files:FileList,video=false):Promise<Uploaded[]>{
  if(active.current)throw Error('Un import est déjà en cours.');
  active.current=true;const total=files.length,results:Uploaded[]=[];
  try{
   const list=Array.from(files);
   for(const file of list){
    if(!file.size||file.size>(video?80e6:20e6))throw Error(video?'Vidéo invalide (80 Mo maximum).':'Image invalide (20 Mo maximum).');
    if(video?!/\.(mov|mp4|webm)$/i.test(file.name):!/\.(jpe?g|png|webp)$/i.test(file.name))throw Error(video?'Choisissez une vidéo MOV, MP4 ou WebM.':'Choisissez une image JPG, PNG ou WebP.');
   }
   for(let index=0;index<list.length;index++){
    const file=list[index],base={name:file.name,index:index+1,total:list.length};
    setProgress({...base,phase:'transfer',percent:0});
    const data=await new Promise<{src:string;video:boolean}>((resolve,reject)=>{
     const xhr=new XMLHttpRequest();xhr.open('POST','/api/admin/upload');xhr.timeout=600000;
     xhr.setRequestHeader('Content-Type','application/octet-stream');xhr.setRequestHeader('X-Media-Name',encodeURIComponent(file.name));
     xhr.upload.onprogress=event=>setProgress({...base,phase:'transfer',percent:event.lengthComputable?Math.round(100*event.loaded/event.total):0});
     xhr.upload.onload=()=>setProgress({...base,phase:'prepare',percent:100});
     xhr.onload=()=>{try{const data=JSON.parse(xhr.responseText);if(xhr.status<200||xhr.status>=300)throw Error(data.message||'Import impossible.');if(typeof data.src!=='string'||data.video!==video)throw Error('Choisissez le bon type de média.');resolve(data);}catch(e){reject(e);}};
     xhr.onerror=()=>reject(Error('Connexion interrompue. Vérifiez votre connexion, puis réessayez.'));
     xhr.ontimeout=()=>reject(Error('La préparation a pris trop de temps. Réessayez avec une vidéo plus courte.'));
     xhr.onabort=()=>reject(Error('Téléversement interrompu.'));xhr.send(file);
    });
    results.push({...data,alt:file.name.replace(/\.[^.]+$/,'')});
   }
   setProgress({phase:'done',percent:100,name:'',index:list.length,total:list.length});return results;
  }catch(e){setProgress(previous=>({name:previous?.name??'',index:previous?.index??1,total,percent:0,phase:'error',error:e instanceof Error?e.message:'Import impossible.'}));throw e;}
  finally{active.current=false;}
 }
 return {transfer,progress,dismiss:()=>setProgress(null)};
}
export function UploadProgress({progress,dismiss}:{progress:Progress|null;dismiss:()=>void}){
 if(!progress)return null;
 const done=progress.phase==='done',failed=progress.phase==='error',finished=done||failed;
 return <aside className={styles.panel} aria-label="Téléversement des médias" role={failed?'alert':'status'} aria-live="polite" aria-atomic="true">
  <div className={styles.heading}>{finished?<span aria-hidden="true">{done?'✓':'!'}</span>:<span className={styles.spinner} aria-hidden="true"/>}<strong>{done?'Téléversement terminé':failed?'Téléversement non terminé':progress.phase==='prepare'?'Préparation du média…':'Téléversement en cours…'}</strong></div>
  {!finished&&<><p className={styles.filename}>{progress.name} · {progress.index}/{progress.total}</p><progress aria-label="Progression du fichier" max={100} value={progress.phase==='transfer'?progress.percent:undefined}/><p>{progress.phase==='transfer'?progress.percent+' % envoyé':'Fichier reçu. Patientez pendant sa préparation pour le site.'}</p><small>Gardez cette page ouverte jusqu’à la confirmation.</small></>}
  {done&&<p>{progress.total} média{progress.total>1?'s':''} prêt{progress.total>1?'s':''}. Cliquez sur ARXYLVE pour enregistrer et publier vos changements.</p>}
  {failed&&<p>{progress.error}</p>}
  {finished&&<button type="button" onClick={dismiss}>Fermer</button>}
 </aside>;
}

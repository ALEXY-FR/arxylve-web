import type {SiteContent} from './content';
import type {Sculpture} from './sculptures';

export function slugFromTitle(title:string){
 return title.toLocaleLowerCase('fr').replaceAll('œ','oe').replaceAll('æ','ae').replaceAll('ß','ss').replaceAll('ł','l').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160).replace(/-+$/g,'')||'oeuvre';
}

export function availableArtworkSlug(title:string,sculptures:Sculpture[],current?:Sculpture){
 const base=slugFromTitle(title);
 const occupied=new Set(sculptures.filter(s=>s!==current).flatMap(s=>[s.slug,...(s.previousSlugs??[])]));
 if(current&&!occupied.has(current.slug)&&(current.slug===base||(current.slug.startsWith(base+'-')&&/^\d+$/.test(current.slug.slice(base.length+1)))))return current.slug;
 let candidate=base,number=2;
 while(occupied.has(candidate))candidate=base.slice(0,150)+'-'+number++;
 return candidate;
}

export function findArtwork(sculptures:Sculpture[],slug:string|undefined){
 return sculptures.find(s=>s.slug===slug)??sculptures.find(s=>slug!==undefined&&s.previousSlugs?.includes(slug));
}

// Keep every former address reserved for its work, with direct redirects to the latest name.
export function normalizeArtworkSlugs(content:SiteContent):SiteContent{
 const sculptures=[...content.sculptures];
 for(let i=0;i<sculptures.length;i++){
  const s=sculptures[i],slug=availableArtworkSlug(s.title,sculptures,s);
  if(slug!==s.slug)sculptures[i]={...s,slug,previousSlugs:[...new Set([...(s.previousSlugs??[]),s.slug])].filter(old=>old!==slug)};
 }
 if(sculptures.every((s,i)=>s===content.sculptures[i]))return content;
 const mapping=new Map<string,string>();
 sculptures.forEach(s=>[s.slug,...(s.previousSlugs??[])].forEach(old=>mapping.set(old,s.slug)));
 const canonical=(slug:string)=>mapping.get(slug)??slug;
 function rekey<T>(record:Record<string,T>){
  const entries=new Map<string,T>();
  for(const [old,value] of Object.entries(record)){const key=canonical(old);if(key===old||!entries.has(key))entries.set(key,value);}
  return Object.fromEntries(entries);
 }
 const translations=content.translations&&Object.fromEntries(Object.entries(content.translations).map(([language,entries])=>{
  const mapped=new Map<string,{source:string;value:string}>();
  for(const [old,value] of Object.entries(entries)){
   const key=old.replace(/^work:([^:]+):/,(_,slug:string)=>'work:'+canonical(slug)+':');
   if(key===old||!mapped.has(key))mapped.set(key,value);
  }
  return [language,Object.fromEntries(mapped)];
 }));
 return {...content,sculptures,homeLayouts:rekey(content.homeLayouts),catalogLayout:{...content.catalogLayout,order:[...new Set(content.catalogLayout.order.map(canonical))],placements:rekey(content.catalogLayout.placements)},...(translations?{translations}:{})};
}

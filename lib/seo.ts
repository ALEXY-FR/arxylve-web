import type {Metadata} from 'next';

export const siteUrl = 'https://arxylve.com';
export function pageMetadata(title:string,description:string,path:string,image?:string):Metadata {
  const url=siteUrl+path;
  const fullTitle=path==='/'?`ARXYLVE — ${title}`:`${title} — ARXYLVE`;
  return {title:{absolute:fullTitle},description,alternates:{canonical:url},
    openGraph:{type:'website',siteName:'ARXYLVE',title:fullTitle,description,url,...(image?{images:[{url:new URL(image,siteUrl).href}]}:{})},
    twitter:{card:image?'summary_large_image':'summary',title:fullTitle,description,...(image?{images:[new URL(image,siteUrl).href]}:{})}};
}

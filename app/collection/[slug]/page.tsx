import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import {pageMetadata} from '../../../lib/seo';
import {readContent} from '../../../lib/cms-store';
import {findArtwork} from '../../../data/artwork-slugs';
import {ArtworkPage} from '../../../components/ArtworkPage';

export const dynamic='force-dynamic';
async function resolveArtwork(slug:string){
 const {sculptures}=await readContent();
 const work=findArtwork(sculptures,slug);
 if(work&&work.slug!==slug)permanentRedirect('/collection/'+work.slug);
 return work;
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const work=await resolveArtwork((await params).slug);
 if(!work)return {title:'Œuvre introuvable',robots:{index:false,follow:false}};
 return pageMetadata(work.title,work.description,'/collection/'+work.slug,work.image);
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const work=await resolveArtwork((await params).slug);
 if(!work)notFound();
 return <ArtworkPage slug={work.slug}/>;
}

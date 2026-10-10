import {pageMetadata} from "../../../lib/seo";
import {readContent} from "../../../lib/cms-store";
import type {Metadata} from "next";

import {notFound,permanentRedirect} from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {sculptures}=await readContent();const {slug}=await params;const s=sculptures.find(s=>s.slug===slug);if(!s){if(slug==='faille-01'&&sculptures.some(s=>s.slug==='ligne-deau'&&s.image==='/images/reflet-deau.jpg'))permanentRedirect('/collection/ligne-deau');return {title:"Œuvre introuvable",robots:{index:false,follow:false}};}return pageMetadata(s.title,s.description,"/collection/"+s.slug,s.image)}

import {ArtworkPage} from '../../../components/ArtworkPage';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {sculptures}=await readContent();if(!sculptures.some(s=>s.slug===slug)){if(slug==='faille-01'&&sculptures.some(s=>s.slug==='ligne-deau'&&s.image==='/images/reflet-deau.jpg'))permanentRedirect('/collection/ligne-deau');notFound();}return <ArtworkPage slug={slug}/>}
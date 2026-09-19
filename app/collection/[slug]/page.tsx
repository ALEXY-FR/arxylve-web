import {readContent} from "../../../lib/cms-store";
import type {Metadata} from "next";

import {notFound} from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {sculptures}=await readContent();const {slug}=await params;const s=sculptures.find(s=>s.slug===slug);if(!s)return {title:"Œuvre introuvable"};return {title:s.title,description:s.description,openGraph:{title:s.title+" — ARXYLVE",description:s.description,images:[]},twitter:{card:"summary",title:s.title+" — ARXYLVE",description:s.description,images:[]}}}

import {ArtworkPage} from '../../../components/ArtworkPage';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {sculptures}=await readContent();if(!sculptures.some(s=>s.slug===slug))notFound();return <ArtworkPage slug={slug}/>}
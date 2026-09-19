import type {Metadata} from "next";
export const metadata:Metadata={title:"Sur mesure",description:"Imaginons votre sculpture miroir en résine colorée ou en béton. Échangez directement avec l’atelier ARXYLVE."};

import {CustomPage} from '../../components/CustomPage';
export default async function Page({searchParams}:{searchParams:Promise<{oeuvre?:string}>}){const {oeuvre}=await searchParams;return <CustomPage artworkSlug={oeuvre}/>}
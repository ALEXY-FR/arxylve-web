import {pageMetadata} from "../../lib/seo";
export const metadata=pageMetadata("Sur-Mesure","Créations sur mesure par ARXYLVE, atelier de design : imaginons ensemble votre œuvre, objet ou mobilier. Échangez directement avec l’atelier.","/sur-mesure");

import {CustomPage} from '../../components/CustomPage';
export default async function Page({searchParams}:{searchParams:Promise<{oeuvre?:string}>}){const {oeuvre}=await searchParams;return <CustomPage artworkSlug={oeuvre}/>}
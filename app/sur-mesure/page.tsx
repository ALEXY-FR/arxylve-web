import {pageMetadata} from "../../lib/seo";
export const metadata=pageMetadata("Sur mesure","Imaginons votre sculpture miroir en résine colorée ou en béton. Échangez directement avec l’atelier ARXYLVE.","/sur-mesure");

import {CustomPage} from '../../components/CustomPage';
export default async function Page({searchParams}:{searchParams:Promise<{oeuvre?:string}>}){const {oeuvre}=await searchParams;return <CustomPage artworkSlug={oeuvre}/>}
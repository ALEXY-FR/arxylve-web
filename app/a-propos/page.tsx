import {pageMetadata} from "../../lib/seo";
export const metadata=pageMetadata("À propos","Découvrez ARXYLVE, l’atelier de design d’Alexy Mekerke, et sa démarche autour de l’art, des objets et du mobilier.","/a-propos");
export const dynamic="force-dynamic";

import {AboutPage} from '../../components/AboutPage';
export default function Page(){return <AboutPage/>}
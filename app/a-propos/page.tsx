import {pageMetadata} from "../../lib/seo";
export const metadata=pageMetadata("À propos","Alexy Mekerke, fondateur d’ARXYLVE, explore la sculpture miroir à travers la résine colorée et le béton.","/a-propos");
export const dynamic="force-dynamic";

import {AboutPage} from '../../components/AboutPage';
export default function Page(){return <AboutPage/>}
import type {Metadata} from "next";
export const metadata:Metadata={title:"À propos",description:"Alexy Mekerke, fondateur d’ARXYLVE, explore la sculpture miroir à travers la résine colorée et le béton."};
export const dynamic="force-dynamic";

import {AboutPage} from '../../components/AboutPage';
export default function Page(){return <AboutPage/>}
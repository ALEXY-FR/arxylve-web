import type { Metadata } from "next";
export const metadata: Metadata={title:"Collection",description:"Le catalogue des sculptures miroir ARXYLVE en résine colorée et en béton."};
export const dynamic="force-dynamic";

import {CollectionPage} from '../../components/CollectionPage';
export default function Page(){return <CollectionPage/>}
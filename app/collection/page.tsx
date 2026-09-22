import {pageMetadata} from "../../lib/seo";
export const metadata=pageMetadata("Collection","Le catalogue des sculptures miroir ARXYLVE en résine colorée et en béton.","/collection");
export const dynamic="force-dynamic";

import {CollectionPage} from '../../components/CollectionPage';
export default function Page(){return <CollectionPage/>}
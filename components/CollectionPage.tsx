"use client";
import {SiteCopy} from "./SiteCopy";
import {useLocalizedSite as useSite} from "./useLocalizedSite";
import Link from "next/link";
import { Catalog } from "./Catalog";
export function CollectionPage(){const {content}=useSite();const {sculptures}=content;return <main id="contenu" className="section collection-page"><h1 className="sr-only"><SiteCopy id="CollectionPage.1" fallback="Collection"/></h1>{sculptures.length?<Catalog items={sculptures}/>:<div className="catalog-empty"><span className="eyebrow"><SiteCopy id="CollectionPage.2" fallback="Les premières pièces arrivent"/></span><h2><SiteCopy id="CollectionPage.3" fallback="La collection"/><br/><em><SiteCopy id="CollectionPage.4" fallback="se prépare."/></em></h2><p><SiteCopy id="CollectionPage.5" fallback="Les sculptures seront présentées ici avec leurs photographies, leurs dimensions et leurs conditions d’acquisition."/></p><Link className="button" href="/sur-mesure"><SiteCopy id="CollectionPage.6" fallback="Échanger avec l’atelier "/></Link></div>}</main>}

"use client";
import Link from 'next/link';
import {SiteCopy} from './SiteCopy';
export function NotFoundPage(){return <main id="contenu" className="not-found-page"><section className="not-found-panel"><div className="lost-reflection" aria-hidden="true"><span/><span/><span/></div><p className="eyebrow"><SiteCopy id="NotFoundPage.1" fallback="404 / Page introuvable"/></p><h1><SiteCopy id="NotFoundPage.2" fallback="Reprenons"/><br/><em><SiteCopy id="NotFoundPage.3" fallback="la visite."/></em></h1><p><SiteCopy id="NotFoundPage.description" fallback="Cette page n’existe plus ou son adresse a changé. Les sculptures vous attendent dans la collection."/></p><nav aria-label="Reprendre la visite"><Link className="button" href="/"><SiteCopy id="NotFoundPage.home" fallback="Retour à l’accueil"/></Link><Link className="button" href="/collection"><SiteCopy id="NotFoundPage.4" fallback="Retour à la collection"/></Link></nav></section></main>}


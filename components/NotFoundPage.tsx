"use client";
import {SiteCopy} from './SiteCopy';

export function NotFoundPage() {
  return <main id="contenu" className="not-found-page">
    <section className="not-found-panel">
      <div className="lost-reflection" aria-hidden="true"><span/><span/><span/></div>
      <h1 className="not-found-label"><SiteCopy id="NotFoundPage.1" fallback="404 / Page introuvable"/></h1>
    </section>
  </main>;
}

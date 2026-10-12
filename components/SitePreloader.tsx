"use client";

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

// The root layout persists across navigation: show this only on a home arrival.
export function SitePreloader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'hidden'>(pathname === '/' ? 'loading' : 'hidden');

  useEffect(() => {
    if (pathname !== '/' || phase !== 'loading') return;
    let cancelled = false;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let assetsReady = false;
    let minimumElapsed = reducedMotion;
    const controller = new AbortController();
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.site-header, #contenu, .skip-link'));
    const previous = targets.map(element => element.inert);
    targets.forEach(element => { element.inert = true; });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function revealIfReady() {
      if (!cancelled && assetsReady && minimumElapsed) setPhase('leaving');
    }
    function finish() {
      assetsReady = true;
      revealIfReady();
    }
    const opening = window.setTimeout(() => {
      minimumElapsed = true;
      revealIfReady();
    }, reducedMotion ? 0 : 3600);
    // A failed asset must never trap the visitor behind the opening screen.
    const deadline = window.setTimeout(finish, 6000);
    const frame = requestAnimationFrame(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>('.gallery-media img, .tablet-main-photo img, .tablet-main-photo video, .mobile-home-work:first-of-type img, .mobile-home-work:first-of-type video'));
      const first = candidates.find(element => {
        const gallery = element.closest('.home-gallery, .tablet-home-gallery, .mobile-home-gallery');
        return gallery && getComputedStyle(gallery).display !== 'none';
      });
      const media = new Promise<void>(resolve => {
        if (!first || (first instanceof HTMLImageElement && first.complete) || (first instanceof HTMLVideoElement && first.readyState >= 2)) {
          resolve(); return;
        }
        const ready = () => resolve();
        for (const event of ['load', 'loadeddata', 'error']) first.addEventListener(event, ready, {once:true, signal:controller.signal});
      });
      const font = document.fonts.load('300 24px GrandCru').catch(() => []);
      Promise.all([media, font]).then(finish);
    });
    return () => {
      cancelled = true;
      clearTimeout(deadline);
      clearTimeout(opening);
      cancelAnimationFrame(frame);
      controller.abort();
      targets.forEach((element, index) => { element.inert = previous[index]; });
      document.body.style.overflow = previousOverflow;
    };
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 140 : 1400;
    const timer = setTimeout(() => setPhase('hidden'), duration);
    return () => clearTimeout(timer);
  }, [phase]);

  if (pathname !== '/' || phase === 'hidden') return null;
  return <>
    <div className="site-preloader" data-phase={phase} role="status" aria-label="Chargement de l’atelier ARXYLVE" aria-live="polite">
      <div className="preloader-scene" aria-hidden="true">
        <div className="preloader-aura preloader-aura-burgundy"/>
        <div className="preloader-aura preloader-aura-green"/>
        <div className="preloader-aura preloader-aura-blue"/>
        <span className="preloader-wordmark">ARXYLVE</span>
        <div className="preloader-matter">
          <div className="preloader-glass">
            <span className="preloader-pigment preloader-pigment-burgundy"/>
            <span className="preloader-pigment preloader-pigment-purple"/>
            <span className="preloader-pigment preloader-pigment-green"/>
            <span className="preloader-pigment preloader-pigment-blue"/>
            <span className="preloader-refraction">ARXYLVE</span>
            <span className="preloader-reflection"/>
          </div>
          <span className="preloader-caustic"/>
        </div>
      </div>
    </div>
    <noscript><style>{'.site-preloader{display:none!important}'}</style></noscript>
  </>;
}

"use client";

import {useEffect, useLayoutEffect, useState, type CSSProperties} from 'react';
import {palette} from '../data/palette';

import {AmbientBackground} from './AmbientBackground';
import {usePathname} from 'next/navigation';

const glassTones = [{name:'Argent',rgb:'230 236 245'}, ...palette];

// The root layout persists across navigation: show this only on a home arrival.
export function SitePreloader() {
  const pathname = usePathname();
  const [tone, setTone] = useState(glassTones[0]);
  useLayoutEffect(() => { setTone(glassTones[Math.floor(Math.random() * glassTones.length)]); }, []);
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
    }, reducedMotion ? 0 : 2400);
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
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 140 : 900;
    const timer = setTimeout(() => setPhase('hidden'), duration);
    return () => clearTimeout(timer);
  }, [phase]);

  if (pathname !== '/' || phase === 'hidden') return null;
  return <>
    <div className="site-preloader" data-variant="letters" data-material="textured-glass" data-tone={tone.name} style={{'--preloader-tint':tone.rgb} as CSSProperties} data-phase={phase} role="status" aria-label="Chargement de l’atelier ARXYLVE" aria-live="polite">
      <AmbientBackground/>
      <div className="preloader-letters-scene" aria-hidden="true">
        <span className="preloader-glass-wordmark">{Array.from("ARXYLVE", (letter, index) => <span className="preloader-glass-letter" key={index} style={{animationDelay:`${index * 220}ms`}}>{letter}</span>)}</span>
      </div>
    </div>
    <noscript><style>{'.site-preloader{display:none!important}'}</style></noscript>
  </>;
}

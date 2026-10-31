"use client";

import {useEffect, useId, useState} from 'react';
import {preloaderLetterPaths} from '../data/preloader-letter-paths';
import {AmbientBackground} from './AmbientBackground';
import {usePathname} from 'next/navigation';

// The root layout persists across navigation: show this only on a home arrival.
export function SitePreloader() {
  const pathname = usePathname();
  const glassId = useId();
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
    }, reducedMotion ? 0 : 4800);
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
    <div className="site-preloader" data-variant="letters" data-phase={phase} role="status" aria-label="Chargement de l’atelier ARXYLVE" aria-live="polite">
      <AmbientBackground/>
      <div className="preloader-letters-scene" aria-hidden="true">
        <span className="preloader-glass-wordmark" data-renderer="svg-paths" data-reflection="progressive">{preloaderLetterPaths.map((glyph, index) =>
          <span className="preloader-glass-letter" key={index} style={{animationDelay:(index * 440)+'ms'}}>
            <svg className="preloader-vector-letter" viewBox={'0 0 '+glyph.width+' '+glyph.height} style={{width:(glyph.width / 1000)+'em',height:'1.15em'}} aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id={glassId+'-'+index} gradientUnits="userSpaceOnUse" x1={glyph.x1} y1={glyph.y1} x2={glyph.x2} y2={glyph.y2}>
                  <stop offset="0" stopColor="white" stopOpacity=".86"/>
                  <stop offset=".5" stopColor="#ece6ff" stopOpacity=".56"/>
                  <stop offset="1" stopColor="white" stopOpacity=".8"/>
                </linearGradient>
                <linearGradient id={glassId+'-reflection-'+index} gradientTransform={'translate('+(-glyph.width*1.5)+' 0)'} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={glyph.width} y2={glyph.height*.18}>
                  <stop offset="0" stopColor="white" stopOpacity="0"/>
                  <stop offset=".3" stopColor="#ece6ff" stopOpacity=".06"/>
                  <stop offset=".5" stopColor="white" stopOpacity=".9"/>
                  <stop offset=".7" stopColor="#e9d4e6" stopOpacity=".12"/>
                  <stop offset="1" stopColor="white" stopOpacity="0"/>
                  <animateTransform attributeName="gradientTransform" type="translate" from={(-glyph.width*1.5)+' 0'} to={(glyph.width*1.5)+' 0'} begin={(index*.44)+'s'} dur="1.3s" fill="freeze"/>
                </linearGradient>
              </defs>
              <path d={glyph.path} fill={'url(#'+glassId+'-'+index+')'} stroke="#f9eeff70" strokeWidth=".6" vectorEffect="non-scaling-stroke" paintOrder="stroke fill"/>
              <path className="preloader-moving-reflection" d={glyph.path} fill={'url(#'+glassId+'-reflection-'+index+')'}/>
            </svg>
          </span>
        )}</span>
      </div>
    </div>
    <noscript><style>{'.site-preloader{display:none!important}'}</style></noscript>
  </>;
}

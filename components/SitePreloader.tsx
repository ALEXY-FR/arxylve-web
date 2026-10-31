"use client";

import {useEffect, useId, useState} from 'react';
import {preloaderLetterPaths} from '../data/preloader-letter-paths';
import {AmbientBackground} from './AmbientBackground';
import {usePathname} from 'next/navigation';

const glyphLayout = preloaderLetterPaths.map((glyph,index) => ({...glyph,x:preloaderLetterPaths.slice(0,index).reduce((sum,item)=>sum+item.width,0)}));
const wordWidth = preloaderLetterPaths.reduce((sum,glyph)=>sum+glyph.width,0);
const wordHeight = preloaderLetterPaths[0].height;
const reflectionWidth = 260;
const reflectionAngle = 8 * Math.PI / 180;
const reflectionTilt = Math.tan(reflectionAngle) * wordHeight / 2;

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
    }, reducedMotion ? 0 : 3500);
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
        <span className="preloader-glass-wordmark" data-renderer="svg-paths" data-reflection="linear-reveal" data-reflection-angle="8">
          <svg className="preloader-vector-letter" viewBox={'0 0 '+wordWidth+' '+wordHeight} style={{width:(wordWidth/1000)+'em',height:'1.15em'}} aria-hidden="true" focusable="false">
            <defs>
              {glyphLayout.map((glyph,index)=><linearGradient key={index} id={glassId+'-glass-'+index} gradientUnits="userSpaceOnUse" x1={glyph.x1} y1={glyph.y1} x2={glyph.x2} y2={glyph.y2}>
                <stop offset="0" stopColor="white" stopOpacity=".86"/>
                <stop offset=".5" stopColor="#ece6ff" stopOpacity=".56"/>
                <stop offset="1" stopColor="white" stopOpacity=".8"/>
              </linearGradient>)}
              <clipPath id={glassId+'-reveal'} clipPathUnits="userSpaceOnUse">
                <polygon points={(-2*wordWidth)+' 0 '+reflectionTilt+' 0 '+(-reflectionTilt)+' '+wordHeight+' '+(-2*wordWidth)+' '+wordHeight} transform={'translate('+(-reflectionWidth)+' 0)'}>
                  <animateTransform attributeName="transform" type="translate" from={(-reflectionWidth)+' 0'} to={(wordWidth+reflectionWidth)+' 0'} begin="0s" dur="2.8s" calcMode="linear" fill="freeze"/>
                </polygon>
              </clipPath>
              <clipPath id={glassId+'-word'} clipPathUnits="userSpaceOnUse">
                {glyphLayout.map((glyph,index)=><path key={index} d={glyph.path} transform={'translate('+glyph.x+' 0)'}/>)}
              </clipPath>
              <linearGradient id={glassId+'-reflection'} gradientUnits="userSpaceOnUse" x1={-reflectionWidth*Math.cos(reflectionAngle)} y1={wordHeight/2-reflectionWidth*Math.sin(reflectionAngle)} x2={reflectionWidth*Math.cos(reflectionAngle)} y2={wordHeight/2+reflectionWidth*Math.sin(reflectionAngle)} gradientTransform={'translate('+(-reflectionWidth)+' 0)'}>
                <stop offset="0" stopColor="white" stopOpacity="0"/>
                <stop offset=".3" stopColor="#ece6ff" stopOpacity=".15"/>
                <stop offset=".5" stopColor="white" stopOpacity=".95"/>
                <stop offset=".7" stopColor="#e9d4e6" stopOpacity=".15"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
                <animateTransform attributeName="gradientTransform" type="translate" from={(-reflectionWidth)+' 0'} to={(wordWidth+reflectionWidth)+' 0'} begin="0s" dur="2.8s" calcMode="linear" fill="freeze"/>
              </linearGradient>
            </defs>
            <g opacity=".06">
              {glyphLayout.map((glyph,index)=><path key={index} d={glyph.path} transform={'translate('+glyph.x+' 0)'} fill={'url(#'+glassId+'-glass-'+index+')'} stroke="#f9eeff70" strokeWidth=".6" vectorEffect="non-scaling-stroke" paintOrder="stroke fill"/>)}
            </g>
            <g className="preloader-lit-word" clipPath={'url(#'+glassId+'-reveal)'}>
              {glyphLayout.map((glyph,index)=><path key={index} d={glyph.path} transform={'translate('+glyph.x+' 0)'} fill={'url(#'+glassId+'-glass-'+index+')'} stroke="#f9eeff70" strokeWidth=".6" vectorEffect="non-scaling-stroke" paintOrder="stroke fill"/>)}
            </g>
            <rect className="preloader-moving-reflection" x={-reflectionWidth} y="0" width={wordWidth+2*reflectionWidth} height={wordHeight} fill={'url(#'+glassId+'-reflection)'} clipPath={'url(#'+glassId+'-word)'}/>
          </svg>
        </span>
      </div>
    </div>
    <noscript><style>{'.site-preloader{display:none!important}'}</style></noscript>
  </>;
}

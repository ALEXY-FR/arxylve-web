"use client";
import {useEffect} from 'react';

export function LiquidEffects() {
  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import('../lib/visual-effects/glass-engine').then(async ({mountSiteGlass}) => {
      const cleanup = await mountSiteGlass();
      if (cancelled) cleanup(); else dispose = cleanup;
    }).catch(() => { document.documentElement.dataset.liquidEngine = 'fallback'; });
    return () => { cancelled = true; dispose?.(); };
  }, []);
  return null;
}

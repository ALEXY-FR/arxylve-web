"use client";
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export function LiquidEffects() {
  const pathname=usePathname();
  const isAdmin=pathname==='/admin'||pathname.startsWith('/admin/');
  useEffect(() => {
    if(isAdmin) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import('../lib/visual-effects/glass-engine').then(async ({mountSiteGlass}) => {
      const cleanup = await mountSiteGlass();
      if (cancelled) cleanup(); else dispose = cleanup;
    }).catch(() => { document.documentElement.dataset.liquidEngine = 'fallback'; });
    return () => { cancelled = true; dispose?.(); };
  }, [isAdmin]);
  return null;
}

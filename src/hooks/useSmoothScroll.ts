import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../utils/gsap';

let lenisInstance: Lenis | null = null;
export const getLenis = (): Lenis | null => lenisInstance;

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays frame-perfect. */
export const useSmoothScroll = (enabled: boolean): void => {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);
};

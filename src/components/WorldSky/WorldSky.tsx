import { FC, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap';
import { vertex, fragment } from './shader';
import { createQuad } from './gl';
import styles from './WorldSky.module.css';

interface WorldSkyProps {
  reducedMotion: boolean;
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * One fixed WebGL "world" behind the page. Sections steer it declaratively:
 *   data-palette="#deep,#mid,#glow"   world colors while the section is on screen
 *   data-push                          scroll inside the section pushes the camera forward
 *   data-dim="0.4"                     dims the world (for reading sections)
 */
const WorldSky: FC<WorldSkyProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const quad = createQuad(canvas, vertex, fragment);
    if (!quad) return;

    const s = {
      time: 0, push: 0, fade: 0, mx: 0, my: 0, ripple: 0,
      deep: hex('#140c14'), mid: hex('#b0607a'), glow: hex('#ffc7a1'),
    };
    const mouse = { x: 0, y: 0, energy: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 0.85 : 1.15);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      quad.set('uRes', [canvas.width, canvas.height]);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMove = (e: PointerEvent) => {
      const min = Math.min(window.innerWidth, window.innerHeight);
      mouse.x = (e.clientX - window.innerWidth / 2) / min;
      mouse.y = -(e.clientY - window.innerHeight / 2) / min;
      mouse.energy = 1;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });

    const triggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>('[data-palette]').forEach((el) => {
      const [d, m, g] = (el.dataset.palette ?? '').split(',').map(hex);
      const dim = el.dataset.dim ? parseFloat(el.dataset.dim) : 1;
      const apply = () => {
        gsap.to(s.deep, { 0: d[0], 1: d[1], 2: d[2], duration: 1.6, ease: 'power2.inOut', overwrite: true });
        gsap.to(s.mid, { 0: m[0], 1: m[1], 2: m[2], duration: 1.6, ease: 'power2.inOut', overwrite: true });
        gsap.to(s.glow, { 0: g[0], 1: g[1], 2: g[2], duration: 1.6, ease: 'power2.inOut', overwrite: true });
        gsap.to(s, { fade: dim, duration: 1.2, ease: 'power2.inOut', overwrite: 'auto' });
      };
      triggers.push(ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 40%', onEnter: apply, onEnterBack: apply }));
      if (el.hasAttribute('data-push')) {
        triggers.push(ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => { s.push = self.progress; },
          onLeave: () => gsap.to(s, { push: 0, duration: 1.2, ease: 'power2.inOut' }),
          onLeaveBack: () => gsap.to(s, { push: 0, duration: 1.2, ease: 'power2.inOut' }),
        }));
      }
    });
    gsap.to(s, { fade: 1, duration: 2.2, ease: 'power2.out', delay: 0.2 });

    let raf = 0;
    let last = performance.now();
    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reducedMotion) s.time += dt;
      mouse.energy *= 0.96;
      s.mx += (mouse.x - s.mx) * 0.06;
      s.my += (mouse.y - s.my) * 0.06;
      s.ripple += (mouse.energy - s.ripple) * 0.1;
      quad.set('uTime', s.time);
      quad.set('uPush', s.push);
      quad.set('uFade', s.fade);
      quad.set('uMouse', [s.mx, s.my]);
      quad.set('uRipple', s.ripple);
      quad.set('uDeep', s.deep);
      quad.set('uMid', s.mid);
      quad.set('uGlow', s.glow);
      quad.draw();
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const handleVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(render); }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      triggers.forEach((t) => t.kill());
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      quad.dispose();
    };
  }, [reducedMotion]);

  return (
    <div className={styles.sky} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WorldSky;

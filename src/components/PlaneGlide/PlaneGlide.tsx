import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { PlaneGlide as PlaneGlideConfig } from '../../config/scenes';
import { createKeyer } from '../../utils/keyer';
import { loadClipInto } from '../../utils/clipLoader';
import styles from './PlaneGlide.module.css';

interface PlaneGlideProps {
  glide: PlaneGlideConfig;
  /** The scrubbed world (its sticky stage scrolls away at the end). */
  worldRef: RefObject<HTMLElement>;
  /** Where the plane lands: the first visible element marked [data-drop-target]. */
  panelRef: RefObject<HTMLElement>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const MOBILE_QUERY = '(max-width: 767px)';
/** Scroll range (share of vh, relative to the moment the stage lets go) in which the sheet folds itself into a plane. */
const FOLD_FROM = -0.5;
const FOLD_TO = 0.12;
/** Scroll (share of vh) over which the landed plane dives into the dashboard. */
const DIVE = 0.14;
/** Scroll (share of vh) the flight from the fold to the dashboard takes. */
const FLIGHT = 0.75;
/** Fired when the plane lands: the dashboard's automation flow starts over, as if this request just came in. */
export const REQUEST_EVENT = 'hub:request';

/**
 * The hand-off between the ProjectHub world and its panel: a real filmed sheet folds itself into a paper plane with the
 * scroll, then the plane glides on a curved path into the dashboard (turning along its path), dives in, and the
 * automation flow runs.
 */
const PlaneGlide: FC<PlaneGlideProps> = ({ glide, worldRef, panelRef }) => {
  const formRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    const panel = panelRef.current;
    const plane = planeRef.current;
    const canvas = formRef.current;
    const video = videoRef.current;
    if (!world || !panel || !plane || !canvas || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const keyer = createKeyer(canvas);
    let landed = false;
    let shown = -1;
    let opacity = 1;

    video.addEventListener('loadedmetadata', () => video.play().then(() => video.pause()).catch(() => {}), { once: true });

    const stopLoading = loadClipInto(video, glide.src, worldRef.current);
    const paint = () => keyer?.(video, { opacity });
    video.addEventListener('seeked', paint);
    video.addEventListener('loadeddata', paint);

    const target = () => {
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>('[data-drop-target]'))) {
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    };

    const land = (el: HTMLElement, x: number, y: number, size: number) => {
      const flash = flashRef.current;
      if (flash) {
        const s = size * 2;
        Object.assign(flash.style, { width: `${s}px`, height: `${s}px`, left: `${x - s / 2}px`, top: `${y - s / 2}px` });
        flash.animate(
          [
            { opacity: 0, transform: 'scale(.4)' },
            { opacity: 0.9, transform: 'scale(1)', offset: 0.25 },
            { opacity: 0, transform: 'scale(1.6)' },
          ],
          { duration: 1000, easing: 'cubic-bezier(.22,.9,.24,1)' },
        );
      }
      el.classList.remove(styles.hit);
      void el.offsetWidth; // restart the glow
      el.classList.add(styles.hit);
      window.dispatchEvent(new CustomEvent(REQUEST_EVENT));
    };

    const hide = () => {
      canvas.style.display = 'none';
      plane.style.display = 'none';
    };

    const tick = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const r = world.getBoundingClientRect();
      const over = vh - r.bottom; // px scrolled since the stage let go (negative while it is still pinned)
      if (over < FOLD_FROM * vh || r.bottom < -vh) {
        hide();
        if (over < 0) landed = false;
        return;
      }
      const el = target();
      if (!el) { hide(); return; }
      const t = el.getBoundingClientRect();
      const mobile = window.matchMedia(MOBILE_QUERY).matches;

      // the sheet floats in the sky beside the dashboard, mirrored so the finished plane points at it
      const cx = t.left + t.width / 2;
      const mirror = cx > vw * 0.55;
      const off = mobile ? vw * 0.16 : Math.min(vw * 0.2, 280);
      const fw = glide.width[mobile ? 1 : 0];
      const k = fw / glide.size[0]; // footage px → screen px
      const fh = glide.size[1] * k;
      const stageTop = Math.min(0, r.bottom - vh);
      const left = (mirror ? cx - off : cx + off) - fw / 2;
      const top = stageTop + vh * glide.floatAt - glide.objectTop * fh;

      const p = clamp01((over - FOLD_FROM * vh) / ((FOLD_TO - FOLD_FROM) * vh));
      const loose = over >= FOLD_TO * vh;
      const want = 0.2 + p * (glide.detachAt - 0.2);
      opacity = clamp01(p * 5);

      if (!loose && opacity > 0.001) {
        canvas.style.display = 'block';
        canvas.style.width = `${fw}px`;
        canvas.style.height = `${fh}px`;
        canvas.style.transform = `translate3d(${left}px, ${top}px, 0) scaleX(${mirror ? -1 : 1})`;
        if (Math.abs(want - shown) > 0.02 && !video.seeking && video.readyState >= 1) {
          video.currentTime = want;
          shown = want;
        } else {
          paint();
        }
      } else {
        canvas.style.display = 'none';
      }

      if (!loose) { plane.style.display = 'none'; return; }

      // the plane, gliding on a curve into the dashboard
      const [sx, sy, sw, sh] = glide.spriteRect;
      const w = sw * k;
      const h = sh * k;
      const localX = (sx + sw / 2) * k;
      const x0 = left + (mirror ? fw - localX : localX);
      // once airborne it no longer rides on the world: it starts where it was finished and the dashboard rises to meet it
      const y0 = -FOLD_TO * vh + vh * glide.floatAt - glide.objectTop * fh + (sy + sh / 2) * k;
      const x3 = cx;
      const y3 = t.top + t.height * 0.42;
      const nose = ((mirror ? 180 - glide.noseAngle : glide.noseAngle) * Math.PI) / 180;
      const D = Math.hypot(x3 - x0, y3 - y0);
      const x1 = x0 + Math.cos(nose) * D * 0.4;
      const y1 = y0 + Math.sin(nose) * D * 0.4;
      const x2 = x3 - (x3 - x0) * 0.1;
      const y2 = y3 - Math.min(D * 0.35, vh * 0.25);
      const flight = vh * FLIGHT;
      const travel = over - FOLD_TO * vh;
      const f = clamp01(travel / flight);
      const g = clamp01((travel - flight) / (DIVE * vh));

      if (g < 1) {
        const u = smooth(f) * 0.85 + f * 0.15;
        const iu = 1 - u;
        const x = iu * iu * iu * x0 + 3 * iu * iu * u * x1 + 3 * iu * u * u * x2 + u * u * u * x3;
        const y = Math.max(h * 0.55, iu * iu * iu * y0 + 3 * iu * iu * u * y1 + 3 * iu * u * u * y2 + u * u * u * y3); // never leaves the top
        // turn along the path (tangent), but never more than a gentle bank away from the filmed pose
        const dx = 3 * iu * iu * (x1 - x0) + 6 * iu * u * (x2 - x1) + 3 * u * u * (x3 - x2);
        const dy = 3 * iu * iu * (y1 - y0) + 6 * iu * u * (y2 - y1) + 3 * u * u * (y3 - y2);
        let turn = (Math.atan2(dy, dx) - nose) * (180 / Math.PI);
        turn = ((turn + 540) % 360) - 180;
        turn = Math.max(-60, Math.min(60, turn)) * clamp01(f * 4);
        const bank = Math.sin(f * Math.PI) * 18 * Math.sign(turn || 1);
        const s = (1 - 0.25 * smooth(f)) * (1 - 0.6 * g);
        plane.style.display = 'block';
        plane.style.width = `${w}px`;
        plane.style.height = `${h}px`;
        plane.style.opacity = String(1 - smooth(clamp01((g - 0.3) / 0.7)));
        plane.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) perspective(900px) rotateZ(${turn}deg) rotateY(${bank}deg) scale(${mirror ? -s : s}, ${s})`;
      } else {
        plane.style.display = 'none';
      }

      if (f >= 1 && !landed) {
        landed = true;
        land(el, x3, y3, w);
      } else if (f < 0.85 && landed) {
        landed = false; // scrolled back up: it can fly again
      }
    };

    gsap.ticker.add(tick);
    return () => {
      stopLoading();
      gsap.ticker.remove(tick);
      video.removeEventListener('seeked', paint);
      video.removeEventListener('loadeddata', paint);
      hide();
    };
  }, [glide, worldRef, panelRef]);

  return (
    <>
      <video ref={videoRef} className={styles.source} muted playsInline preload="auto" aria-hidden="true" />
      <canvas ref={formRef} className={styles.form} aria-hidden="true" />
      <img ref={planeRef} className={styles.plane} src={glide.sprite} alt="" aria-hidden="true" />
      <span ref={flashRef} className={styles.flash} aria-hidden="true" />
    </>
  );
};

export default PlaneGlide;

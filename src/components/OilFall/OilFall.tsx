import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { DropFall, PORTRAIT_CLIP_QUERY } from '../../config/scenes';
import { createKeyer } from '../../utils/keyer';
import styles from './OilFall.module.css';

interface OilFallProps {
  fall: DropFall;
  /** The scrubbed world (its sticky stage holds the clip). */
  worldRef: RefObject<HTMLElement>;
  /** Where the drop may land: elements marked [data-drop-target], in priority order. */
  panelRef: RefObject<HTMLElement>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Where (share of the viewport height) the drop hangs from its drip: just above where the world clip fades out. */
const HANG_AT = 0.56;
/** Scroll range (share of the viewport height) around the moment the world lets go, in which the drop forms. */
const FORM_FROM = -0.3;
const FORM_TO = 0.22;
/** After letting go, the thread snaps back over this range while the drop falls. */
const SNAP = 0.22;
/** On-screen diameter of the drop, in px (desktop / phones). */
const DROP_PX = [118, 74];

/**
 * The hand-off between the oil world and the project panel: on one of the drips, a real filmed drop forms
 * with the scroll, lets go, falls onto the phone (or the title), splashes with a flash of light and is absorbed.
 */
const OilFall: FC<OilFallProps> = ({ fall, worldRef, panelRef }) => {
  const formRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dropRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    const panel = panelRef.current;
    const drop = dropRef.current;
    const canvas = formRef.current;
    const video = videoRef.current;
    if (!world || !panel || !drop || !canvas || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const keyer = createKeyer(canvas);
    const { form } = fall;
    let landed = false;
    let wantTime = 0;
    let shown = 0;
    let keyOpts = { topFade: 0.2, cutBelow: 1.06, opacity: 1 };

    video.addEventListener('loadedmetadata', () => video.play().then(() => video.pause()).catch(() => {}), { once: true });
    const paint = () => keyer?.(video, keyOpts);
    video.addEventListener('seeked', paint);
    video.addEventListener('loadeddata', paint);

    const layout = () => {
      const mobile = window.matchMedia(PORTRAIT_CLIP_QUERY).matches && fall.clipMobile;
      const clip = mobile ? fall.clipMobile! : fall.clip;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / clip.size[0], vh / clip.size[1]);
      const dx = (vw - clip.size[0] * scale) / 2;
      return { columns: clip.columns.map((x) => dx + x * scale), dropPx: DROP_PX[mobile ? 1 : 0] };
    };

    /** First target that has a drip column above it, and that column. */
    const pickTarget = (columns: number[]) => {
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>('[data-drop-target]'))) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const cx = r.left + r.width / 2;
        const inside = columns.filter((x) => x > r.left + r.width * 0.15 && x < r.right - r.width * 0.15);
        if (inside.length) return { el, x: inside.reduce((a, b) => (Math.abs(b - cx) < Math.abs(a - cx) ? b : a)) };
      }
      return null;
    };

    const absorb = (el: HTMLElement, x: number, y: number, size: number) => {
      const flash = flashRef.current;
      const ring = ringRef.current;
      if (flash) {
        const s = size * 2.4;
        Object.assign(flash.style, { width: `${s}px`, height: `${s}px`, left: `${x - s / 2}px`, top: `${y - s / 2}px` });
        flash.animate(
          [
            { opacity: 0, transform: 'scale(.3)' },
            { opacity: 1, transform: 'scale(1)', offset: 0.22 },
            { opacity: 0, transform: 'scale(1.7)' },
          ],
          { duration: 950, easing: 'cubic-bezier(.22,.9,.24,1)' },
        );
      }
      if (ring) {
        const s = size * 1.1;
        Object.assign(ring.style, { width: `${s}px`, height: `${s * 0.4}px`, left: `${x - s / 2}px`, top: `${y - s * 0.2}px` });
        ring.animate(
          [
            { opacity: 0.95, transform: 'scale(.25)' },
            { opacity: 0, transform: 'scale(3.4)' },
          ],
          { duration: 1150, easing: 'cubic-bezier(.2,.8,.2,1)' },
        );
      }
      el.classList.remove(styles.hit);
      void el.offsetWidth; // restart the glow
      el.classList.add(styles.hit);
    };

    const hide = () => {
      canvas.style.display = 'none';
      drop.style.display = 'none';
    };

    const tick = () => {
      const vh = window.innerHeight;
      const r = world.getBoundingClientRect();
      const over = vh - r.bottom; // px scrolled since the stage let go (negative while it is still pinned)
      if (over < FORM_FROM * vh || r.bottom < -vh) {
        hide();
        if (over < 0) landed = false;
        return;
      }
      const { columns, dropPx } = layout();
      const target = pickTarget(columns);
      if (!target) { hide(); return; }

      // the filmed drop, hanging from the drip (moves up with the stage once it lets go)
      const k = dropPx / (fall.spriteSize[0] * 0.93); // source px → screen px
      const fw = form.size[0] * k;
      const fh = form.size[1] * k;
      const stageTop = Math.min(0, r.bottom - vh);
      const top = stageTop + vh * HANG_AT - fh * 0.08;
      const left = target.x - fw / 2;

      const p = clamp01((over - FORM_FROM * vh) / ((FORM_TO - FORM_FROM) * vh)); // forming
      const q = clamp01((over - FORM_TO * vh) / (SNAP * vh)); // after letting go
      const detached = over >= FORM_TO * vh;
      wantTime = detached ? form.detachAt + q * (form.endAt - form.detachAt) : 0.4 + p * (form.detachAt - 0.4);
      keyOpts = { topFade: 0.22, cutBelow: detached ? form.cutAfter : 1.06, opacity: detached ? 1 - clamp01((q - 0.35) / 0.65) : clamp01(p * 6) };

      if (keyOpts.opacity > 0.001) {
        canvas.style.display = 'block';
        canvas.style.width = `${fw}px`;
        canvas.style.height = `${fh}px`;
        canvas.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        if (Math.abs(wantTime - shown) > 0.02 && !video.seeking && video.readyState >= 1) {
          video.currentTime = wantTime;
          shown = wantTime;
        } else {
          paint();
        }
      } else {
        canvas.style.display = 'none';
      }

      // the free drop, from the moment it lets go
      if (!detached) { drop.style.display = 'none'; return; }
      const w = fall.spriteSize[0] * k;
      const h = fall.spriteSize[1] * k;
      const y0 = top + form.dropBottom * k - h; // where the hanging drop was
      const t = target.el.getBoundingClientRect();
      const landY = t.top + Math.min(t.height * 0.2, 64);
      const dist = Math.max(vh * 0.15, landY - h * 0.85 - y0); // constant while scrolling: both move with the page
      const travel = over - FORM_TO * vh;
      const f = clamp01(travel / (dist * 0.8));
      const g = clamp01((travel - dist * 0.8) / (vh * 0.12));

      if (g < 1) {
        const y = y0 + dist * f * f; // accelerates like a real fall
        const squash = clamp01(g / 0.3);
        const sx = 1 - 0.06 * f + 0.85 * squash - 0.55 * clamp01((g - 0.3) / 0.7);
        const sy = 1 + 0.1 * f - 0.6 * squash;
        drop.style.display = 'block';
        drop.style.width = `${w}px`;
        drop.style.height = `${h}px`;
        drop.style.opacity = String(1 - clamp01((g - 0.2) / 0.6));
        drop.style.transform = `translate3d(${target.x - w / 2}px, ${y}px, 0) scale(${sx}, ${sy})`;
      } else {
        drop.style.display = 'none';
      }

      if (f >= 1 && !landed) {
        landed = true;
        absorb(target.el, target.x, landY, w);
      } else if (f < 0.8 && landed) {
        landed = false; // scrolled back up: it can fall again
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      video.removeEventListener('seeked', paint);
      video.removeEventListener('loadeddata', paint);
      hide();
    };
  }, [fall, worldRef, panelRef]);

  return (
    <>
      <video ref={videoRef} className={styles.source} src={fall.form.src} muted playsInline preload="auto" aria-hidden="true" />
      <canvas ref={formRef} className={styles.form} aria-hidden="true" />
      <img ref={dropRef} className={styles.drop} src={fall.sprite} alt="" aria-hidden="true" />
      <span ref={ringRef} className={styles.ring} aria-hidden="true" />
      <span ref={flashRef} className={styles.flash} aria-hidden="true" />
    </>
  );
};

export default OilFall;

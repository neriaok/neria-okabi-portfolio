import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { PageDrift as PageDriftConfig, PORTRAIT_CLIP_QUERY } from '../../config/scenes';
import { createKeyer } from '../../utils/keyer';
import styles from './PageDrift.module.css';

interface PageDriftProps {
  page: PageDriftConfig;
  /** The scrubbed world (its sticky stage scrolls away at the end). */
  worldRef: RefObject<HTMLElement>;
  /** Where the page may land: elements marked [data-drop-target], in priority order. */
  panelRef: RefObject<HTMLElement>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Linear interpolation along [time, a, b] keys, clamped at both ends. */
const along = (keys: [number, number, number][], time: number): [number, number] => {
  if (time <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    if (time <= keys[i][0]) {
      const u = (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return [keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * u, keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * u];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
};
const MOBILE_QUERY = '(max-width: 767px)';
/** Scroll range (share of vh, relative to the moment the stage lets go) in which the book opens and the page tears loose. */
const FORM_FROM = -0.12;
const FORM_TO = 0.14;
/** After the page is loose, the book keeps settling and fades over this range. */
const SETTLE = 0.3;
/** Scroll (share of vh) over which the landed page sinks into the screen. */
const SINK = 0.14;

/**
 * The hand-off between the library world and the project panel: from the book floating in the world clip, a real
 * filmed page tears loose and drifts down like a leaf (sway, flutter, tilt) onto the app's screen, lies flat and sinks in.
 */
const PageDrift: FC<PageDriftProps> = ({ page, worldRef, panelRef }) => {
  const formRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    const panel = panelRef.current;
    const sprite = pageRef.current;
    const canvas = formRef.current;
    const video = videoRef.current;
    if (!world || !panel || !sprite || !canvas || !video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const keyer = createKeyer(canvas);
    [page.inWorldMobile, page.inWorldDesktop].forEach((tear) => { if (tear) new Image().src = tear.sprite; }); // ready before the hand-off
    let landed = false;
    let driftTravel = 0; // phones: how far the page has left its place in the clip (eases after the clip)
    let shown = -1;
    let keyOpts = { topFade: 0, cutBelow: 1.06, opacity: 1, cutAbove: 0 };

    video.addEventListener('loadedmetadata', () => video.play().then(() => video.pause()).catch(() => {}), { once: true });
    const paint = () => keyer?.(video, keyOpts);
    video.addEventListener('seeked', paint);
    video.addEventListener('loadeddata', paint);

    const target = () => {
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>('[data-drop-target]'))) {
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    };

    const sink = (el: HTMLElement, x: number, y: number, size: number) => {
      const flash = flashRef.current;
      if (flash) {
        const s = size * 2.2;
        Object.assign(flash.style, { width: `${s}px`, height: `${s}px`, left: `${x - s / 2}px`, top: `${y - s / 2}px` });
        flash.animate(
          [
            { opacity: 0, transform: 'scale(.4)' },
            { opacity: 0.9, transform: 'scale(1)', offset: 0.25 },
            { opacity: 0, transform: 'scale(1.6)' },
          ],
          { duration: 1100, easing: 'cubic-bezier(.22,.9,.24,1)' },
        );
      }
      el.classList.remove(styles.hit);
      void el.offsetWidth; // restart the glow
      el.classList.add(styles.hit);
    };

    const setSprite = (src: string) => {
      if (sprite.getAttribute('src') !== src) sprite.setAttribute('src', src);
    };

    const hide = () => {
      canvas.style.display = 'none';
      sprite.style.display = 'none';
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
      const el = target();
      if (!el) { hide(); return; }
      const t = el.getBoundingClientRect();
      const mobile = window.matchMedia(MOBILE_QUERY).matches;
      const portrait = window.matchMedia(PORTRAIT_CLIP_QUERY).matches; // which world clip is showing
      const vw = window.innerWidth;
      const cx = t.left + t.width / 2;
      const stageTop = Math.min(0, r.bottom - vh);
      const worldVideo = world.querySelector('video');
      const inWorld = portrait ? page.inWorldMobile : page.inWorldDesktop;
      let x0: number;
      let y0: number;
      let w: number;
      let h: number;

      if (inWorld) {
        // the world clip itself tears the page out; at its last frame (page painted out) the sprite takes over in place
        canvas.style.display = 'none';
        // the sprite lies exactly on the clip's held page, and only leaves it once the clip shows the page painted out
        const now = worldVideo && worldVideo.duration > 0 ? worldVideo.currentTime : -1; // clip not downloaded yet: nothing to take over from
        if (now < inWorld.holdAt + 0.02 && over < 0.3 * vh) { sprite.style.display = 'none'; landed = false; driftTravel = 0; return; }
        const allowed = now >= inWorld.cleanAt + 0.045 || over > 0.3 * vh ? Math.max(0, over) : 0;
        driftTravel += (allowed - driftTravel) * (allowed > driftTravel ? 0.22 : 1);
        setSprite(inWorld.sprite);
        const cover = Math.max(vw / inWorld.size[0], vh / inWorld.size[1]);
        const ox = (vw - inWorld.size[0] * cover) / 2;
        const oy = (vh - inWorld.size[1] * cover) / 2 + stageTop;
        const [sx, sy, sw, sh] = inWorld.rect;
        w = sw * cover;
        h = sh * cover;
        x0 = ox + (sx + sw / 2) * cover;
        y0 = oy + (sy + sh / 2) * cover;
      } else {
        // the filmed page tearing loose, pinned under the world clip's floating book (moves up with the stage)
        const fw = page.width[mobile ? 1 : 0];
        const k = fw / page.size[0]; // footage px → screen px
        const fh = page.size[1] * k;
        const a = portrait ? page.anchorMobile : page.anchor;
        const cover = Math.max(window.innerWidth / a.size[0], vh / a.size[1]);
        // follow the world book frame by frame: where the world clip's playhead is right now
        const [dx, dy] = along(a.track, worldVideo && worldVideo.duration ? worldVideo.currentTime : Infinity);
        const ax = (window.innerWidth - a.size[0] * cover) / 2 + (a.at[0] + dx) * cover;
        const ay = (vh - a.size[1] * cover) / 2 + (a.at[1] + dy) * cover + stageTop;

        const p = clamp01((over - FORM_FROM * vh) / ((FORM_TO - FORM_FROM) * vh));
        const q = clamp01((over - FORM_TO * vh) / (SETTLE * vh));
        const loose = over >= FORM_TO * vh;
        const want = loose ? page.detachAt + q * (page.endAt - page.detachAt - 0.05) : page.showFrom + p * (page.detachAt - page.showFrom);
        const tr = page.track;
        const tt = Math.min(want, tr[tr.length - 1][0]);
        let i = 0;
        while (i < tr.length - 2 && tr[i + 1][0] < tt) i++;
        const u = clamp01((tt - tr[i][0]) / (tr[i + 1][0] - tr[i][0]));
        const hx = tr[i][1] + (tr[i + 1][1] - tr[i][1]) * u;
        const hy = tr[i][2] + (tr[i + 1][2] - tr[i][2]) * u;
        const left = ax - hx * k;
        const top = ay - hy * k;
        keyOpts = {
          topFade: 0,
          cutBelow: loose ? page.cutAfter : 1.06,
          cutAbove: loose ? 0.001 + tr[tr.length - 1][2] / page.size[1] + 0.01 : hy / page.size[1] + 0.012,
          opacity: loose ? 1 - clamp01((q - 0.1) / 0.5) : clamp01(p * 3.5),
        };

        // once the page is loose the sprite is the only page: drop the footage at once (a pending seek could still show it)
        if (!loose && keyOpts.opacity > 0.001) {
          canvas.style.display = 'block';
          canvas.style.width = `${fw}px`;
          canvas.style.height = `${fh}px`;
          canvas.style.transform = `translate3d(${left}px, ${top}px, 0)`;
          if (Math.abs(want - shown) > 0.02 && !video.seeking && video.readyState >= 1) {
            video.currentTime = want;
            shown = want;
          } else {
            paint();
          }
        } else {
          canvas.style.display = 'none';
        }

        // the loose page, drifting down like a leaf
        if (!loose) { sprite.style.display = 'none'; return; }
        setSprite(page.sprite);
        const [sx, sy, sw, sh] = page.spriteRect;
        w = sw * k;
        h = sh * k;
        x0 = left + (sx + sw / 2) * k; // centre of the page where it tore loose
        y0 = top + (sy + sh / 2) * k;
      }

      const landX = cx;
      const landY = t.top + t.height * 0.5;
      const dist = Math.max(vh * 0.2, landY - y0); // constant while scrolling: both move with the page
      const travel = inWorld ? driftTravel : over - FORM_TO * vh;
      const f = clamp01(travel / (dist * 1.1));
      const g = clamp01((travel - dist * 1.1) / (SINK * vh));

      if (g < 1) {
        const e = smooth(f);
        const sway = Math.sin(f * Math.PI * 3) * (1 - e) * w * (mobile ? 0.32 : 0.55); // side to side, calming as it settles
        const x = Math.max(w * 0.42, Math.min(vw - w * 0.42, x0 + (landX - x0) * e + sway)); // never drifts off screen
        const y = y0 + dist * (0.35 * f + 0.65 * e);
        const flutter = Math.sin(f * Math.PI * 6) * 38 * (1 - e); // edge-on flips, like paper catching the air
        const tilt = Math.sin(f * Math.PI * 3) * 22 * (1 - e) - 45 * e; // ends square on the screen
        const lie = 18 * e; // tips back to lie flat on the glass
        const s = (1 - 0.18 * e) * (1 - 0.12 * g);
        sprite.style.display = 'block';
        sprite.style.width = `${w}px`;
        sprite.style.height = `${h}px`;
        sprite.style.opacity = String(1 - smooth(clamp01(g / 0.85)));
        sprite.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) perspective(900px) rotateX(${flutter + lie}deg) rotateY(${flutter * 0.4}deg) rotateZ(${tilt}deg) scale(${s})`;
      } else {
        sprite.style.display = 'none';
      }

      if (f >= 1 && !landed) {
        landed = true;
        sink(el, landX, landY, w);
      } else if (f < 0.85 && landed) {
        landed = false; // scrolled back up: it can drift again
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      video.removeEventListener('seeked', paint);
      video.removeEventListener('loadeddata', paint);
      hide();
    };
  }, [page, worldRef, panelRef]);

  return (
    <>
      <video ref={videoRef} className={styles.source} src={page.inWorldDesktop && page.inWorldMobile ? undefined : page.src} muted playsInline preload="auto" aria-hidden="true" />
      <canvas ref={formRef} className={styles.form} aria-hidden="true" />
      <img ref={pageRef} className={styles.page} src={page.sprite} alt="" aria-hidden="true" />
      <span ref={flashRef} className={styles.flash} aria-hidden="true" />
    </>
  );
};

export default PageDrift;

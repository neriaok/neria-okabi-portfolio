import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { BallBounce as BallBounceConfig, InWorldTear, PORTRAIT_CLIP_QUERY } from '../../config/scenes';
import styles from './BallBounce.module.css';

interface BallBounceProps {
  ball: BallBounceConfig;
  /** The scrubbed world: its clip ends with the thrown ball held still in the grass, then painted out. */
  worldRef: RefObject<HTMLElement>;
  /** Where the ball comes to rest: on top of the first visible [data-drop-target] (the phone). */
  panelRef: RefObject<HTMLElement>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Scroll (share of vh) from the grass to resting on the phone. */
const TRAVEL = 0.85;
/** How the stage fades its clip (Chapter.module.css: transparent 0%, #000 14%, #000 58%, transparent 100%). */
const stageMask = (y: number) => (y < 0.14 ? clamp01(y / 0.14) : y <= 0.58 ? 1 : clamp01((1 - y) / 0.42));

/**
 * The hand-off between the dog world and its panel: the owner throws the ball in the clip; it lands in the grass and
 * is held still there, where the sprite (cut from that very frame, faded exactly like the clip at that height) takes
 * over. It then bounces down out of the world onto the top edge of the app's phone and rests there.
 */
const BallBounce: FC<BallBounceProps> = ({ ball, worldRef, panelRef }) => {
  const spriteRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    const panel = panelRef.current;
    const sprite = spriteRef.current;
    const img = imgRef.current;
    if (!world || !panel || !sprite || !img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let travel = 0;
    let lastF = 0;
    [ball.mobile, ball.desktop].forEach((tear) => { if (tear) new Image().src = tear.sprite; });

    const target = () => {
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>('[data-drop-target]'))) {
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    };

    const bounce = (el: HTMLElement, x: number, y: number, size: number) => {
      const flash = flashRef.current;
      if (flash) {
        const s = size * 2;
        Object.assign(flash.style, { width: `${s}px`, height: `${s * 0.6}px`, left: `${x - s / 2}px`, top: `${y - s * 0.3}px` });
        flash.animate(
          [
            { opacity: 0, transform: 'scale(.5)' },
            { opacity: 0.8, transform: 'scale(1)', offset: 0.2 },
            { opacity: 0, transform: 'scale(1.4)' },
          ],
          { duration: 800, easing: 'cubic-bezier(.22,.9,.24,1)' },
        );
      }
      el.classList.remove(styles.hit);
      void el.offsetWidth;
      el.classList.add(styles.hit);
    };

    const hide = () => { sprite.style.display = 'none'; };

    const tick = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const r = world.getBoundingClientRect();
      const over = vh - r.bottom;
      const tear: InWorldTear | undefined = window.matchMedia(PORTRAIT_CLIP_QUERY).matches ? ball.mobile : ball.desktop;
      const video = world.querySelector('video');
      const now = video && video.duration > 0 ? video.currentTime : Infinity;
      const el = target();
      if (!tear || !el || (now < tear.holdAt + 0.02 && over < 0.3 * vh)) {
        hide();
        travel = 0;
        lastF = 0;
        return;
      }
      const t = el.getBoundingClientRect();
      if (t.bottom < -vh * 0.3) { hide(); return; }

      // where the clip holds the ball (it moves up with the stage until the ball leaves)
      const stageTop = Math.min(0, r.bottom - vh);
      const cover = Math.max(vw / tear.size[0], vh / tear.size[1]);
      const ox = (vw - tear.size[0] * cover) / 2;
      const oy = (vh - tear.size[1] * cover) / 2 + stageTop;
      const [sx, sy, sw, sh] = tear.rect;
      const w = sw * cover;
      const h = sh * cover;
      const x0 = ox + (sx + sw / 2) * cover;
      const y0 = oy + (sy + sh / 2) * cover;

      // it only leaves once the clip shows it painted out, easing after a lagging clip
      const allowed = now >= tear.cleanAt + 0.045 || over > 0.3 * vh ? Math.max(0, over) : 0;
      travel += (allowed - travel) * (allowed > travel ? 0.22 : 1);
      const f = clamp01(travel / (vh * TRAVEL));

      // rests on the phone's top edge, about a third of the phone wide
      const size = Math.min(w, t.width * ball.restSize);
      const s1 = size / w;
      const restX = t.left + t.width / 2;
      const restY = t.top - ball.edge - (h * s1) / 2;
      const x = x0 + (restX - x0) * smooth(clamp01(f / 0.7));
      // falls (gravity) to the edge, then two shrinking bounces
      const D = Math.max(1, restY - y0);
      let y: number;
      let squash = 0;
      if (f < 0.6) {
        const u = f / 0.6;
        y = y0 + (restY - y0) * u * u;
      } else if (f < 0.85) {
        const u = (f - 0.6) / 0.25;
        y = restY - Math.min(D, vh) * 0.16 * 4 * u * (1 - u);
        squash = Math.max(0, 1 - u * 6) * 0.18;
      } else {
        const u = (f - 0.85) / 0.15;
        y = restY - Math.min(D, vh) * 0.05 * 4 * u * (1 - u);
        squash = Math.max(0, 1 - u * 6) * 0.1;
      }
      const s = 1 + (s1 - 1) * smooth(clamp01(f / 0.6));
      const free = smooth(clamp01(f / 0.3)); // how far it has left the clip's look behind
      // at the hand-off it is faded exactly like the clip at that height; that fade lifts as it falls out of the world
      const top = stageMask((y - (h * s) / 2 - stageTop) / vh);
      const bottom = stageMask((y + (h * s) / 2 - stageTop) / vh);
      const a1 = top + (1 - top) * free;
      const a2 = bottom + (1 - bottom) * free;
      sprite.style.display = 'block';
      if (img.getAttribute('src') !== tear.sprite) img.setAttribute('src', tear.sprite);
      sprite.style.width = `${w}px`;
      sprite.style.height = `${h}px`;
      // the fade sits on the image and the glow on its wrapper, so the glow is never clipped to a square
      const mask = `linear-gradient(to bottom, rgba(0,0,0,${a1.toFixed(3)}), rgba(0,0,0,${a2.toFixed(3)}))`;
      img.style.maskImage = mask;
      img.style.webkitMaskImage = mask;
      sprite.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${f * 420 * free}deg) scale(${s * (1 + squash)}, ${s * (1 - squash)})`;

      for (const at of [0.6, 0.85]) {
        if (lastF < at && f >= at) bounce(el, restX, t.top - ball.edge, size);
      }
      lastF = f;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      hide();
    };
  }, [ball, worldRef, panelRef]);

  return (
    <>
      <div ref={spriteRef} className={styles.ball} aria-hidden="true">
        <img ref={imgRef} alt="" />
      </div>
      <span ref={flashRef} className={styles.flash} aria-hidden="true" />
    </>
  );
};

export default BallBounce;

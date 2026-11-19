import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { BubbleFall as BubbleFallConfig, InWorldTear, PORTRAIT_CLIP_QUERY } from '../../config/scenes';
import styles from './BubbleFall.module.css';

interface BubbleFallProps {
  bubble: BubbleFallConfig;
  /** The scrubbed world: its clip ends with the bubble held still, then painted out. */
  worldRef: RefObject<HTMLElement>;
  /** Where the bubble lands: the first visible element marked [data-drop-target] (the DM phone). */
  panelRef: RefObject<HTMLElement>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Scroll (share of vh) the fall takes, and the squash-and-pop on the phone. */
const FALL = 0.8;
const POP = 0.12;
/** Fired when the bubble pops on the phone: the DM flow plays from the start, as if this message just arrived. */
export const MESSAGE_EVENT = 'bot:message';

/**
 * The hand-off between the bot's city and its panel: the world clip lifts a glowing jelly chat bubble out of the tallest
 * tower; at the clip's end the sprite takes over exactly where the bubble is held, falls wobbling like jelly onto the
 * phone, squashes, pops into hearts, and the DM arrives.
 */
const BubbleFall: FC<BubbleFallProps> = ({ bubble, worldRef, panelRef }) => {
  const spriteRef = useRef<HTMLImageElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    const panel = panelRef.current;
    const sprite = spriteRef.current;
    if (!world || !panel || !sprite) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let popped = false;
    let travel = 0;
    [bubble.mobile, bubble.desktop].forEach((tear) => { if (tear) new Image().src = tear.sprite; });

    const target = () => {
      for (const el of Array.from(panel.querySelectorAll<HTMLElement>('[data-drop-target]'))) {
        if (el.getBoundingClientRect().width) return el;
      }
      return null;
    };

    const pop = (el: HTMLElement, x: number, y: number, size: number) => {
      const flash = flashRef.current;
      if (flash) {
        const s = size * 1.8;
        Object.assign(flash.style, { width: `${s}px`, height: `${s}px`, left: `${x - s / 2}px`, top: `${y - s / 2}px` });
        flash.animate(
          [
            { opacity: 0, transform: 'scale(.4)' },
            { opacity: 0.9, transform: 'scale(1)', offset: 0.2 },
            { opacity: 0, transform: 'scale(1.5)' },
          ],
          { duration: 900, easing: 'cubic-bezier(.22,.9,.24,1)' },
        );
      }
      const box = heartsRef.current;
      if (box) {
        for (let i = 0; i < 12; i++) {
          const h = document.createElement('span');
          h.className = styles.heart;
          h.textContent = '♥';
          h.style.left = `${x}px`;
          h.style.top = `${y}px`;
          box.appendChild(h);
          const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
          const d = size * (0.45 + Math.random() * 0.6);
          h.animate(
            [
              { opacity: 1, transform: 'translate(0,0) scale(.4)' },
              { opacity: 1, transform: `translate(${Math.cos(a) * d * 0.6}px, ${Math.sin(a) * d * 0.6}px) scale(${0.9 + Math.random() * 0.6})`, offset: 0.35 },
              { opacity: 0, transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - size * 0.3}px) scale(.6)` },
            ],
            { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.22,.9,.24,1)' },
          ).onfinish = () => h.remove();
        }
      }
      el.classList.remove(styles.hit);
      void el.offsetWidth;
      el.classList.add(styles.hit);
      window.dispatchEvent(new CustomEvent(MESSAGE_EVENT));
    };

    const hide = () => { sprite.style.display = 'none'; };

    const tick = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const r = world.getBoundingClientRect();
      const over = vh - r.bottom;
      const tear: InWorldTear | undefined = window.matchMedia(PORTRAIT_CLIP_QUERY).matches ? bubble.mobile : bubble.desktop;
      const video = world.querySelector('video');
      const now = video && video.duration > 0 ? video.currentTime : -1; // clip not downloaded yet: nothing to take over from
      if (!tear || r.bottom < -vh || (now < tear.holdAt + 0.02 && over < 0.3 * vh)) {
        hide();
        travel = 0;
        if (over < 0.05 * vh) popped = false;
        return;
      }
      const el = target();
      if (!el) { hide(); return; }
      const t = el.getBoundingClientRect();

      // where the clip holds the bubble (it moves up with the stage until the bubble lets go)
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
      const f = clamp01(travel / (vh * FALL));
      const g = clamp01((travel - vh * FALL) / (vh * POP));

      const landX = t.left + t.width / 2;
      const landY = t.top + t.height * 0.42;
      const e = f * f; // gravity
      const x = x0 + (landX - x0) * smooth(f) + Math.sin(f * Math.PI * 2) * w * 0.12 * (1 - f);
      const y = y0 + (landY - y0) * e;
      const wob = Math.sin(f * Math.PI * 7) * 0.07 * (1 - f * 0.5); // jelly wobble on the way down
      const shrink = 1 - 0.35 * smooth(f); // it lands about phone-sized
      const squash = Math.sin(clamp01(g / 0.45) * Math.PI) * 0.28; // flattens on the glass, then pops
      const sxk = shrink * (1 + wob + squash) * (1 + 0.25 * clamp01((g - 0.45) / 0.55));
      const syk = shrink * (1 - wob - squash) * (1 + 0.25 * clamp01((g - 0.45) / 0.55));
      if (g < 1) {
        sprite.style.display = 'block';
        if (sprite.getAttribute('src') !== tear.sprite) sprite.setAttribute('src', tear.sprite);
        sprite.style.width = `${w}px`;
        sprite.style.height = `${h}px`;
        sprite.style.opacity = String(1 - smooth(clamp01((g - 0.5) / 0.4)));
        sprite.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${Math.sin(f * Math.PI * 3) * 8 * (1 - f)}deg) scale(${sxk}, ${syk})`;
      } else {
        hide();
      }
      if (g > 0.45 && !popped) {
        popped = true;
        pop(el, landX, landY, w * shrink);
      } else if (f < 0.85 && popped) {
        popped = false;
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      hide();
    };
  }, [bubble, worldRef, panelRef]);

  return (
    <>
      <img ref={spriteRef} className={styles.bubble} alt="" aria-hidden="true" />
      <span ref={flashRef} className={styles.flash} aria-hidden="true" />
      <div ref={heartsRef} aria-hidden="true" />
    </>
  );
};

export default BubbleFall;

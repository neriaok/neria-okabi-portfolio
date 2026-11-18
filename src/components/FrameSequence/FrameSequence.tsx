import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap';
import { SceneSource } from '../../config/scenes';
import { getSequence, nearestLoaded } from '../../utils/framePreloader';
import styles from './FrameSequence.module.css';

interface FrameSequenceProps {
  source: Extract<SceneSource, { type: 'frames' }>;
  /** Element whose scroll range scrubs the sequence. */
  triggerRef: RefObject<HTMLElement>;
  start?: string;
  end?: string;
  /** Auto-play the first N frames once `play` turns true, so the camera is already moving before any scroll. */
  introFrames?: number;
  play?: boolean;
  /**
   * Optional canvas placed right below the stage (top of the next section). It receives the bottom edge of
   * every frame, stretched downward and faded out, so the picture flows into the next section instead of
   * ending on a straight line.
   */
  tailRef?: RefObject<HTMLCanvasElement>;
}

/** Apple-style scroll-scrubbed image sequence drawn to canvas with "cover" fit. */
const FrameSequence: FC<FrameSequenceProps> = ({ source, triggerRef, start = 'top top', end = 'bottom bottom', introFrames = 0, play = true, tailRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ intro: 0, scroll: 0, drawn: -1, draw: (_: number) => {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !trigger || !ctx) return;
    const seq = getSequence(source);
    const s = state.current;

    s.draw = (target: number) => {
      const index = nearestLoaded(seq, Math.round(target));
      if (index < 0 || index === s.drawn) return;
      const frame = seq.frames[index];
      if (!frame) return;
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / frame.sw, ch / frame.sh);
      const w = frame.sw * scale;
      const h = frame.sh * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const dx = (cw - w) / 2;
      const dy = (ch - h) / 2;
      ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, dx, dy, w, h);
      s.drawn = index;

      const tail = tailRef?.current;
      const tctx = tail?.getContext('2d');
      if (tail && tctx && tail.width && tail.height) {
        // Source rows that sit on the main canvas' bottom edge (the frame may be cropped by "cover").
        const BAND = 3;
        const bottom = frame.sy + Math.min(frame.sh, (ch - dy) / scale);
        const k = tail.width / cw;
        tctx.globalCompositeOperation = 'source-over';
        tctx.clearRect(0, 0, tail.width, tail.height);
        tctx.drawImage(frame.img, frame.sx, bottom - BAND, frame.sw, BAND, dx * k, 0, w * k, tail.height);
        // Background tone of the bottom edge (ignoring bright drips/highlights) → the veil under the tail,
        // so the clip's backdrop melts into the next section without a seam.
        const row = tctx.getImageData(0, 0, tail.width, 1).data;
        const lum: number[][] = [];
        for (let i = 0; i < row.length; i += 16) lum.push([row[i] + row[i + 1] + row[i + 2], row[i], row[i + 1], row[i + 2]]);
        lum.sort((a, b) => a[0] - b[0]);
        const dark = lum.slice(0, Math.max(1, Math.floor(lum.length * 0.4)));
        const avg = [1, 2, 3].map((c) => Math.round(dark.reduce((t, p) => t + p[c], 0) / dark.length));
        (tail.closest('section') ?? tail.parentElement)?.style.setProperty('--tail-rgb', avg.join(','));
        // Keep only what is brighter than that backdrop: the tail is screen-blended over the veil,
        // so leaving the backdrop in would count it twice and show a lighter band.
        tctx.globalCompositeOperation = 'difference';
        tctx.fillStyle = `rgb(${avg.join(',')})`;
        tctx.fillRect(0, 0, tail.width, tail.height);
        const fade = tctx.createLinearGradient(0, 0, 0, tail.height);
        fade.addColorStop(0, 'rgba(0,0,0,1)');
        fade.addColorStop(0.35, 'rgba(0,0,0,0.55)');
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        tctx.globalCompositeOperation = 'destination-in';
        tctx.fillStyle = fade;
        tctx.fillRect(0, 0, tail.width, tail.height);
        tctx.globalCompositeOperation = 'source-over';
      }
    };
    const render = () => s.draw(s.intro + s.scroll * (source.count - 1 - s.intro));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const tail = tailRef?.current;
      if (tail) {
        tail.width = tail.clientWidth * dpr;
        tail.height = tail.clientHeight * dpr;
      }
      s.drawn = -1;
      render();
    };
    resize();
    const handleProgress = () => { if (s.drawn < 0) render(); };
    seq.onProgress.add(handleProgress);
    window.addEventListener('resize', resize);

    const st = ScrollTrigger.create({
      trigger,
      start,
      end,
      onUpdate: (self) => {
        s.scroll = self.progress;
        render();
      },
    });

    return () => {
      st.kill();
      seq.onProgress.delete(handleProgress);
      window.removeEventListener('resize', resize);
    };
  }, [source, triggerRef, start, end, tailRef]);

  // intro fly-in
  useEffect(() => {
    if (!play || !introFrames) return;
    const s = state.current;
    const tween = gsap.to(s, {
      intro: introFrames,
      duration: 3.2,
      ease: 'power2.out',
      onUpdate: () => s.draw(s.intro + s.scroll * (source.count - 1 - s.intro)),
    });
    return () => { tween.kill(); };
  }, [play, introFrames, source.count]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
};

export default FrameSequence;

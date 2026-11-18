import { FC, RefObject, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../utils/gsap';
import { createKeyer } from '../../utils/keyer';
import styles from './VideoScrub.module.css';
import { PORTRAIT_CLIP_QUERY } from '../../config/scenes';

interface VideoScrubProps {
  src: string;
  mobileSrc?: string;
  /** Element whose scroll range scrubs the clip. */
  triggerRef: RefObject<HTMLElement>;
  /**
   * Optional canvas right below the stage (top of the next section). It receives the clip's bottom edge,
   * stretched downward and faded, so the picture flows into the next section instead of ending on a line.
   */
  tailRef?: RefObject<HTMLCanvasElement>;
  /** Clip shot on black: render through WebGL with the black keyed to transparency. */
  keyed?: boolean;
}


/** Share of the gap to the scroll target covered per tick: smooths wheel steps into continuous motion. */
const EASE = 0.14;

/**
 * Scroll-scrubbed clip. The video is encoded with a keyframe on every frame, so any time can be shown
 * instantly; the playhead eases toward the scroll position on every tick for fluid, liquid motion.
 */
const VideoScrub: FC<VideoScrubProps> = ({ src, mobileSrc, triggerRef, tailRef, keyed = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const keyRef = useRef<HTMLCanvasElement>(null);
  const url = mobileSrc && window.matchMedia(PORTRAIT_CLIP_QUERY).matches ? mobileSrc : src;

  useEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    if (!video || !trigger) return;

    let target = 0;
    let current = 0;
    let tailVisible = false;
    let tailTone = '';
    const keyer = keyed && keyRef.current ? createKeyer(keyRef.current) : null;
    const paint = () => keyer?.(video);

    // iOS only paints a muted inline video after it has started once.
    const prime = () => {
      video.play().then(() => video.pause()).catch(() => {});
    };
    video.addEventListener('loadedmetadata', prime, { once: true });

    const drawTail = () => {
      const tail = tailRef?.current;
      const ctx = tail?.getContext('2d', { willReadFrequently: true });
      if (!tail || !ctx || !video.videoWidth || video.readyState < 2) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const tw = Math.round(tail.clientWidth * dpr);
      const th = Math.round(tail.clientHeight * dpr);
      if (tail.width !== tw || tail.height !== th) { tail.width = tw; tail.height = th; }

      // Map the video's "cover" crop: which source rows sit on the stage's bottom edge.
      const cw = video.clientWidth;
      const ch = video.clientHeight;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(cw / vw, ch / vh);
      const dx = (cw - vw * scale) / 2;
      const dy = (ch - vh * scale) / 2;
      const bottom = Math.min(vh, (ch - dy) / scale);
      const BAND = 3;
      const k = tw / cw;

      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, tw, th);
      ctx.drawImage(video, 0, bottom - BAND, vw, BAND, dx * k, 0, vw * scale * k, th);

      // Backdrop tone of that edge (ignoring bright drips): read once, it paints the veil under the tail.
      if (!tailTone) {
        const row = ctx.getImageData(0, 0, tw, 1).data;
        const px: number[][] = [];
        for (let i = 0; i < row.length; i += 16) px.push([row[i] + row[i + 1] + row[i + 2], row[i], row[i + 1], row[i + 2]]);
        px.sort((a, b) => a[0] - b[0]);
        const dark = px.slice(0, Math.max(1, Math.floor(px.length * 0.4)));
        tailTone = [1, 2, 3].map((c) => Math.round(dark.reduce((t, p) => t + p[c], 0) / dark.length)).join(',');
        (tail.closest('section') ?? tail.parentElement)?.style.setProperty('--tail-rgb', tailTone);
      }
      // Keep only what is brighter than the backdrop (the tail is screen-blended over the veil), then fade.
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = `rgb(${tailTone})`;
      ctx.fillRect(0, 0, tw, th);
      const fade = ctx.createLinearGradient(0, 0, 0, th);
      fade.addColorStop(0, 'rgba(0,0,0,1)');
      fade.addColorStop(0.35, 'rgba(0,0,0,0.55)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, tw, th);
      ctx.globalCompositeOperation = 'source-over';
    };

    const tick = () => {
      if (!video.duration) return;
      const goal = target * (video.duration - 0.04);
      const gap = goal - current;
      if (Math.abs(gap) < 0.002) return;
      current += gap * EASE;
      if (!video.seeking) video.currentTime = current;
    };
    gsap.ticker.add(tick);

    const onSeeked = () => {
      paint();
      if (tailVisible) drawTail();
    };
    const onData = () => {
      paint();
      drawTail();
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('loadeddata', onData);

    const tail = tailRef?.current;
    const io = tail
      ? new IntersectionObserver(([entry]) => {
          tailVisible = entry.isIntersecting;
          if (tailVisible) drawTail();
        })
      : null;
    if (tail && io) io.observe(tail);

    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { target = self.progress; },
    });
    const onResize = () => {
      paint();
      drawTail();
    };
    window.addEventListener('resize', onResize);

    return () => {
      st.kill();
      gsap.ticker.remove(tick);
      io?.disconnect();
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadeddata', onData);
      window.removeEventListener('resize', onResize);
    };
  }, [url, triggerRef, tailRef, keyed]);

  return (
    <>
      <video ref={videoRef} className={keyed ? styles.source : styles.video} src={url} muted playsInline preload="auto" aria-hidden="true" />
      {keyed && <canvas ref={keyRef} className={styles.video} aria-hidden="true" />}
    </>
  );
};

export default VideoScrub;

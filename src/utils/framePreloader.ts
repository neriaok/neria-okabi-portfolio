import { SceneSource, fileCount, fileUrl } from '../config/scenes';

type FramesSource = Extract<SceneSource, { type: 'frames' }>;

/** One drawable frame: its image file and the rectangle inside it (the whole image, or one cell of a sheet). */
export interface Frame {
  img: HTMLImageElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

interface Sequence {
  frames: (Frame | undefined)[];
  loaded: boolean[];
  ready: Promise<void>;
  onProgress: Set<(p: number) => void>;
}

const cache = new Map<string, Sequence>();

/** Order: first file, then a coarse pass (every 8th), then fill the gaps — so scrubbing works early. */
const loadOrder = (count: number): number[] => {
  const seen = new Set<number>([0]);
  const order = [0];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  }
  return order;
};

export const isMobileViewport = (): boolean => window.innerWidth < 768;

export const getSequence = (source: FramesSource): Sequence => {
  const mobile = isMobileViewport();
  const key = `${mobile && source.mobileDir ? source.mobileDir : source.dir}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const per = source.perSheet ?? 1;
  const cols = source.perSheet ? source.cols ?? 1 : 1;
  const rows = Math.ceil(per / cols);
  const files = fileCount(source);
  const frames: (Frame | undefined)[] = new Array(source.count);
  const loaded: boolean[] = new Array(source.count).fill(false);
  const onProgress = new Set<(p: number) => void>();
  let done = 0;

  const ready = new Promise<void>((resolve) => {
    const order = loadOrder(files);
    let cursor = 0;
    const PARALLEL = 4;
    const next = () => {
      if (cursor >= order.length) return;
      const f = order[cursor++];
      const img = new Image();
      img.decoding = 'async';
      const finish = () => {
        const ok = img.complete && img.naturalWidth > 0;
        const sw = img.naturalWidth / cols;
        const sh = img.naturalHeight / rows;
        for (let k = 0; k < per; k++) {
          const i = f * per + k;
          if (i >= source.count) break;
          frames[i] = { img, sx: (k % cols) * sw, sy: Math.floor(k / cols) * sh, sw, sh };
          loaded[i] = ok;
        }
        done++;
        onProgress.forEach((cb) => cb(done / files));
        if (done === files) resolve();
        next();
      };
      img.onload = finish;
      img.onerror = finish;
      img.src = fileUrl(source, f, mobile);
    };
    for (let k = 0; k < PARALLEL; k++) next();
  });

  const seq = { frames, loaded, ready, onProgress };
  cache.set(key, seq);
  return seq;
};

/** Nearest frame that is already decoded — never show a blank while scrubbing. */
export const nearestLoaded = (seq: Sequence, index: number): number => {
  for (let d = 0; d < seq.loaded.length; d++) {
    if (seq.loaded[index - d]) return index - d;
    if (seq.loaded[index + d]) return index + d;
  }
  return -1;
};

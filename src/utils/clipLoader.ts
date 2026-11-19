/**
 * Downloads the scroll-scrubbed clips whole, in chapter order, one at a time, and hands each video a blob URL.
 *
 * A scrubbed clip seeks on every scroll tick. Streamed from the network, every seek into a part that has not
 * arrived yet waits for a range request, so the first pass through a chapter stutters or stalls. From memory,
 * every frame is there at once. The chapter the visitor is approaching jumps the queue.
 */

interface Entry {
  url: string;
  order: number;
  urgent: boolean;
  started: boolean;
  promise: Promise<string>;
  resolve: (src: string) => void;
}

const MAX_PARALLEL = 1; // one at a time: the next chapter arrives as early as possible
const entries = new Map<string, Entry>();
let active = 0;
let counter = 0;

const pump = () => {
  while (active < MAX_PARALLEL) {
    const next = [...entries.values()]
      .filter((e) => !e.started)
      .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.order - b.order)[0];
    if (!next) return;
    next.started = true;
    active++;
    fetch(next.url)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((blob) => next.resolve(URL.createObjectURL(blob)))
      .catch(() => next.resolve(next.url)) // fall back to streaming it
      .finally(() => {
        active--;
        pump();
      });
  }
};

/** Queue a clip (first call wins its place in line) and get a promise of a src to play it from. */
export const requestClip = (url: string): Promise<string> => {
  let entry = entries.get(url);
  if (!entry) {
    let resolve!: (src: string) => void;
    const promise = new Promise<string>((r) => { resolve = r; });
    entry = { url, order: counter++, urgent: false, started: false, promise, resolve };
    entries.set(url, entry);
    queueMicrotask(pump);
  }
  return entry.promise;
};

/** Move a clip to the front of the line (its chapter is coming up). */
export const hurryClip = (url: string) => {
  const entry = entries.get(url);
  if (entry && !entry.started) {
    entry.urgent = true;
    pump();
  }
};

/** Give a video its clip once downloaded; returns a cleanup. `near` (optional) hurries it when that element approaches. */
export const loadClipInto = (video: HTMLVideoElement, url: string, near?: Element | null) => {
  let alive = true;
  requestClip(url).then((src) => {
    if (alive && video.getAttribute('src') !== src) video.src = src;
  });
  const io = near
    ? new IntersectionObserver(([e]) => e.isIntersecting && hurryClip(url), { rootMargin: '150% 0px' })
    : null;
  if (near && io) io.observe(near);
  return () => {
    alive = false;
    io?.disconnect();
  };
};

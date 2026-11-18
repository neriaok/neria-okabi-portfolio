/**
 * World visuals. Every world renders the live WebGL shader in its own palette by default.
 * When a Flow clip is ready: `./scripts/encode-scrub.sh clip.mp4 <id>` (and again with the 9:16 clip
 * for `<id>-m`), then set the entry to { type: 'video', src: './scenes/<id>.mp4', mobileSrc: ... }.
 */
/** Which clip a viewport shows: the 9:16 one on phones and on any tall screen (a phone in "desktop site" mode,
 * a tablet held upright), where a 16:9 clip would be cropped down to its middle. */
export const PORTRAIT_CLIP_QUERY = '(max-width: 767px), (max-aspect-ratio: 4/5)';

export type SceneId = 'intro' | 'dog' | 'hub' | 'bot' | 'dvora' | 'library' | 'outro';

export type SceneSource =
  | { type: 'shader' }
  /** A scroll-scrubbed clip encoded with a keyframe on every frame (see scripts/encode-scrub.sh). */
  | {
      type: 'video';
      /** Desktop clip. Leave it out while only the 9:16 clip exists: desktop then keeps the shader. */
      src?: string;
      mobileSrc?: string;
      /** The clip was shot on black: key the black out so only the subject floats in the world sky. */
      keyed?: boolean;
      /** A drop that detaches from the clip and falls into the project panel. */
      fall?: DropFall;
      /** A filmed object (on black) whose loose page drifts down into the project panel. */
      page?: PageDrift;
      /** A filmed sheet (on black) that folds into a paper plane and glides into the project panel. */
      glide?: PlaneGlide;
      /** The world clip lifts a jelly chat bubble out; it falls onto the DM phone and pops. */
      bubble?: BubbleFall;
      /** The world clip throws a ball into the grass; it bounces out onto the project's phone. */
      throwBall?: BallBounce;
    }
  | {
      type: 'frames';
      dir: string;
      mobileDir?: string;
      count: number;
      ext: 'webp' | 'jpg';
      /** Frames packed into sprite sheets (scripts/make-sheets.py): sheet-01.webp holds frames 1..perSheet. */
      perSheet?: number;
      cols?: number;
    };

export interface DropFall {
  /** A filmed close-up (on black) of the drop forming and letting go, scrubbed at the hand-off. */
  form: {
    src: string;
    /** Size of the source footage the numbers below refer to. */
    size: [number, number];
    /** When the drop lets go, and when the footage ends. */
    detachAt: number;
    endAt: number;
    /** Bottom of the hanging drop at the moment it lets go (source px). */
    dropBottom: number;
    /** Below this share of the height, hide the footage once the drop has let go (it carries its own copy). */
    cutAfter: number;
  };
  /** Alpha sprite of the free drop, cut from the same footage. */
  sprite: string;
  /** Sprite size in source px of the footage. */
  spriteSize: [number, number];
  /** Clip size and the x of every drip column, in clip pixels: desktop clip, then mobile clip. */
  clip: { size: [number, number]; columns: number[] };
  clipMobile?: { size: [number, number]; columns: number[] };
}

/** A point in the world clip: where it is at the end, and how far it was from there earlier ([time, dx, dy], clip px). */
export interface WorldAnchor {
  size: [number, number];
  at: [number, number];
  track: [number, number, number][];
}

export interface BallBounce {
  mobile?: InWorldTear;
  desktop?: InWorldTear;
  /** Resting size as a share of the phone's width, and how far above the screen the phone's edge is. */
  restSize: number;
  edge: number;
}

export interface BubbleFall {
  mobile?: InWorldTear;
  desktop?: InWorldTear;
}

export interface PlaneGlide {
  /** Close-up on black of the sheet folding into a plane, scrubbed at the hand-off. Numbers below are in `size` px. */
  src: string;
  size: [number, number];
  /** When the plane is finished (the footage stops here and the sprite flies on). */
  detachAt: number;
  /** Alpha sprite of the finished plane and where it sits in the footage at `detachAt`: [x, y, w, h]. */
  sprite: string;
  spriteRect: [number, number, number, number];
  /** Direction the sprite's nose points, in degrees (0 = right, 90 = down). */
  noseAngle: number;
  /** On-screen width of the footage (desktop / phones), where the sheet floats (share of vh) and its top in the footage. */
  width: [number, number];
  floatAt: number;
  objectTop: number;
}

export interface InWorldTear {
  holdAt: number;
  cleanAt: number;
  sprite: string;
  rect: [number, number, number, number];
  size: [number, number];
}

export interface PageDrift {
  /** Close-up on black of the object, scrubbed at the hand-off. Numbers below are in `size` px. */
  src: string;
  size: [number, number];
  /** When the page is clear of the object, and when the footage ends. */
  detachAt: number;
  endAt: number;
  /** After detaching, hide the footage below this share of the height (the sprite carries the page). */
  cutAfter: number;
  /** Alpha sprite of the loose page, and where it sits in the footage at `detachAt`: [x, y, w, h]. */
  sprite: string;
  spriteRect: [number, number, number, number];
  /** On-screen width of the footage (desktop / phones). */
  width: [number, number];
  /** The footage is only shown from here on, and only below the object (the world clip's own book stands in for it). */
  showFrom: number;
  /** Where the page hangs from the object over time: [time, x, y] in footage px. Pinned to `anchor`. */
  track: [number, number, number][];
  /** The point in the world clip (its last frame) the page tears from, desktop and phone clip. */
  anchor: WorldAnchor;
  anchorMobile: WorldAnchor;
  /** Phones: the world clip itself tears the page out, then holds it still (from `holdAt`, exactly where the sprite
   * sits: `rect` [x, y, w, h] in the clip's `size` px) and ends with the page painted out (from `cleanAt`).
   * The sprite covers the held page, so a lagging video frame never shows a second page. */
  inWorldMobile?: InWorldTear;
  /** The same for the desktop clip. */
  inWorldDesktop?: InWorldTear;
}

export const SCENES: Record<SceneId, SceneSource> = {
  intro: { type: 'shader' },
  dog: {
    type: 'video',
    src: './scenes/dog.mp4',
    mobileSrc: './scenes/dog-m.mp4',
    throwBall: {
      mobile: { holdAt: 292 / 24, cleanAt: 303 / 24, sprite: './fx/ball-m.png', rect: [258, 832, 180, 192], size: [688, 1280] },
      desktop: { holdAt: 341 / 24, cleanAt: 352 / 24, sprite: './fx/ball-d.png', rect: [545, 341, 105, 112], size: [1280, 720] },
      restSize: 0.34,
      edge: 8,
    },
  },
  hub: {
    type: 'video',
    src: './scenes/hub.mp4',
    mobileSrc: './scenes/hub-m.mp4',
    glide: {
      src: './fx/plane-fold.mp4',
      size: [720, 1280],
      detachAt: 95 / 24,
      sprite: './fx/plane.png',
      spriteRect: [254, 542, 460, 433],
      noseAngle: 131,
      width: [380, 250],
      floatAt: 0.3,
      objectTop: 0.26,
    },
  },
  bot: {
    type: 'video',
    src: './scenes/bot.mp4',
    mobileSrc: './scenes/bot-m.mp4',
    bubble: {
      mobile: { holdAt: 296 / 24, cleanAt: 307 / 24, sprite: './fx/bubble-m.png', rect: [240, 405, 370, 385], size: [720, 1280] },
      desktop: { holdAt: 284 / 24, cleanAt: 295 / 24, sprite: './fx/bubble-d.png', rect: [425, 126, 366, 320], size: [1280, 720] },
    },
  },
  dvora: {
    type: 'video',
    src: './scenes/dvora.mp4',
    mobileSrc: './scenes/dvora-m.mp4',
    keyed: true,
    fall: {
      form: { src: './fx/oil-drop.mp4', size: [720, 1280], detachAt: 6.05, endAt: 7.55, dropBottom: 1172, cutAfter: 0.3 },
      sprite: './fx/oil-drop.png',
      spriteSize: [300, 336],
      clip: { size: [1280, 720], columns: [514, 637, 712, 800, 897] },
      clipMobile: { size: [720, 1280], columns: [139, 278, 362, 461, 570] },
    },
  },
  library: {
    type: 'video',
    src: './scenes/library.mp4',
    mobileSrc: './scenes/library-m.mp4',
    page: {
      src: './fx/book-page.mp4',
      size: [720, 1280],
      detachAt: 5.75,
      endAt: 7.9,
      cutAfter: 0.505,
      sprite: './fx/page.png',
      spriteRect: [99, 645, 522, 574],
      width: [430, 220],
      showFrom: 4.25,
      track: [[4.25, 360, 804], [4.5, 345, 773], [4.75, 330, 735], [5.0, 345, 713], [5.25, 330, 675], [5.5, 390, 639], [5.75, 380, 612]],
      anchor: {
        size: [1280, 720],
        at: [700, 355],
        track: [[6.4, -14, 17], [6.65, -13, 21], [6.9, -10, 20], [7.15, -7, 16], [7.4, -4, 10], [7.65, -2, 4], [7.93, 0, 0]],
      },
      anchorMobile: {
        size: [720, 1280],
        at: [510, 665],
        track: [[6.4, 7, -30], [6.9, 4, -24], [7.4, 4, -18], [7.57, 2, -15], [7.73, 0, -6], [7.93, 0, 0]],
      },
      inWorldDesktop: { holdAt: 248 / 24, cleanAt: 259 / 24, sprite: './fx/page-d.png', rect: [706, 238, 220, 214], size: [1280, 720] },
      inWorldMobile: { holdAt: 278 / 24, cleanAt: 289 / 24, sprite: './fx/page-m.png', rect: [350, 475, 335, 370], size: [720, 1280] },
    },
  },
  outro: { type: 'shader' },
};

/** The source this viewport actually shows: a clip without a version for this screen falls back to the shader. */
export const activeScene = (scene: SceneSource): SceneSource => {
  if (scene.type !== 'video') return scene;
  const mobile = typeof window !== 'undefined' && window.matchMedia(PORTRAIT_CLIP_QUERY).matches;
  return (mobile ? scene.mobileSrc ?? scene.src : scene.src) ? scene : { type: 'shader' };
};

type FramesSource = Extract<SceneSource, { type: 'frames' }>;

const dirOf = (src: FramesSource, mobile: boolean): string => (mobile && src.mobileDir ? src.mobileDir : src.dir);

/** Number of image files the sequence is stored in (one per frame, or one per sheet). */
export const fileCount = (src: FramesSource): number => (src.perSheet ? Math.ceil(src.count / src.perSheet) : src.count);

/** URL of file `i` (a frame, or a sheet when the sequence is packed). */
export const fileUrl = (src: FramesSource, i: number, mobile = false): string =>
  src.perSheet
    ? `${dirOf(src, mobile)}/sheet-${String(i + 1).padStart(2, '0')}.${src.ext}`
    : `${dirOf(src, mobile)}/${String(i + 1).padStart(4, '0')}.${src.ext}`;

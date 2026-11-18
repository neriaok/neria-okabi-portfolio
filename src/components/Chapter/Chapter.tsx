import { CSSProperties, FC, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { gsap, ScrollTrigger } from '../../utils/gsap';
import { Chapter as ChapterData } from '../../config/content';
import { useCopy } from '../../hooks/useAppStore';
import { SCENES, SceneId, activeScene } from '../../config/scenes';
import FrameSequence from '../FrameSequence';
import VideoScrub from '../VideoScrub';
import OilFall from '../OilFall';
import PageDrift from '../PageDrift';
import PlaneGlide from '../PlaneGlide';
import BubbleFall from '../BubbleFall';
import BallBounce from '../BallBounce';
import Device from '../Device';
import HubAutomation from '../HubAutomation';
import BotCombo from '../BotCombo';
import styles from './Chapter.module.css';

interface ChapterProps {
  chapter: ChapterData;
  total: number;
  flip?: boolean;
  onUnlock: (id: string, unlocked: boolean) => void;
}

const Chapter: FC<ChapterProps> = ({ chapter, total, flip = false, onUnlock }) => {
  const rootRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scene = activeScene(SCENES[chapter.id as SceneId]);
  const t = useCopy();
  const c = t.chapters[chapter.id];
  const [b1, b2, b3] = c.beats;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    const ctx = gsap.context(() => {
      // --- the world: beats slam in on scroll ---
      const tl = gsap.timeline({ scrollTrigger: { trigger: worldRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
      tl.fromTo('[data-tag]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
        .fromTo('[data-beat="1"]', { yPercent: 120, scale: 1.25, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }, 0.4)
        .fromTo('[data-beat="2"]', { yPercent: 120, scale: 1.25, opacity: 0 }, { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: 'expo.out' }, 1.6)
        .fromTo('[data-beat="3"]', { y: 40, opacity: 0, filter: 'blur(12px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, 2.8)
        .to(`.${styles.beats}`, { scale: 1.08, duration: 4.4, ease: 'none' }, 0)
        .to(`.${styles.beats}, [data-tag]`, { opacity: 0, filter: 'blur(14px)', y: -60, duration: 0.9, ease: 'power2.in' }, 4.4)
        .to({}, { duration: 0 }, 5.3);

      // --- the project panel ---
      gsap.from(panel.querySelectorAll('[data-rise]'), {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.07,
        ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 72%' },
      });
      gsap.fromTo(panel.querySelector('[data-media]'), { rotateX: 18, rotateY: -14, y: 120, scale: 0.9 }, {
        rotateX: 0, rotateY: 0, y: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'center center', scrub: 0.8 },
      });
      gsap.from(panel.querySelectorAll('[data-world]'), {
        scale: 0.4,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'back.out(2.5)',
        scrollTrigger: { trigger: panel.querySelector('[data-worlds]'), start: 'top 80%' },
      });
      ScrollTrigger.create({
        trigger: panel.querySelector('[data-worlds]'),
        start: 'top 80%',
        onEnter: () => onUnlock(chapter.id, true),
        onLeaveBack: () => onUnlock(chapter.id, false),
      });
    }, root);
    return () => ctx.revert();
  }, [chapter.id, onUnlock]);

  const palette = chapter.palette.join(',');
  const media = chapter.media;

  return (
    <section ref={rootRef} className={clsx(styles.chapter, flip && styles.flip)} style={{ '--accent': chapter.accent } as CSSProperties} aria-labelledby={`${chapter.id}-title`}>
      <div ref={worldRef} className={styles.world} data-palette={palette} data-push>
        <div className={clsx(styles.stage, scene.type !== 'shader' && styles.framed)}>
          {scene.type !== 'shader' && (
            <div className={styles.frames}>
              {scene.type === 'video' ? (
                <VideoScrub src={scene.src ?? scene.mobileSrc ?? ''} mobileSrc={scene.mobileSrc} keyed={scene.keyed} triggerRef={worldRef} />
              ) : (
                <FrameSequence source={scene} triggerRef={worldRef} />
              )}
              <div className={styles.shade} />
            </div>
          )}
          <div className={styles.tag} data-tag>
            <span dir="ltr">{chapter.index} / {String(total).padStart(2, '0')}</span>
            <span className={styles.worldName}>{c.world}</span>
          </div>
          <div className={styles.beats} aria-hidden="true">
            <span className={styles.mask}><span className={styles.beat} data-beat="1">{b1}</span></span>
            <span className={styles.mask}><span className={styles.beat} data-beat="2">{b2}</span></span>
            {b3 && <span className={styles.beat3} data-beat="3">{b3}</span>}
          </div>
        </div>
      </div>

      {scene.type === 'video' && scene.fall && <OilFall fall={scene.fall} worldRef={worldRef} panelRef={panelRef} />}
      {scene.type === 'video' && scene.page && <PageDrift page={scene.page} worldRef={worldRef} panelRef={panelRef} />}
      {scene.type === 'video' && scene.glide && <PlaneGlide glide={scene.glide} worldRef={worldRef} panelRef={panelRef} />}
      {scene.type === 'video' && scene.bubble && <BubbleFall bubble={scene.bubble} worldRef={worldRef} panelRef={panelRef} />}
      {scene.type === 'video' && scene.throwBall && <BallBounce ball={scene.throwBall} worldRef={worldRef} panelRef={panelRef} />}
      <div ref={panelRef} className={styles.panel} data-palette={palette} data-dim="0.42">
        <div className={styles.media} data-media>
          {media.kind === 'bot-combo' ? (
            <BotCombo />
          ) : media.kind === 'hub-automation' ? (
            <HubAutomation image={media.image} />
          ) : (
            <Device kind={media.kind} image={media.image} video={media.video} iframe={media.iframe} label={chapter.title} url={chapter.links[0]?.href.replace(/^https?:\/\//, '')} />
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.kicker} data-rise>
            <span>{chapter.index}</span>
            <span>{c.world}</span>
            <span>{chapter.year}</span>
          </div>
          <h2 id={`${chapter.id}-title`} className={styles.title} data-rise data-drop-target>{chapter.title}</h2>
          <p className={styles.tagline} data-rise>{c.tagline}</p>
          <p className={styles.story} data-rise>{c.story}</p>
          <ul className={styles.highlights} data-rise>
            {c.highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>

          <div className={styles.block} data-worlds>
            <span className={styles.label} data-rise>{t.chapter.worldsLabel}</span>
            <ul className={styles.worlds}>
              {chapter.worlds.map((w) => <li key={w} data-world>{t.worlds[w]}</li>)}
            </ul>
          </div>

          <div className={styles.block} data-rise>
            <span className={styles.label}>{t.chapter.stackLabel}</span>
            <ul className={styles.stack} dir="ltr">
              {chapter.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>

          <div className={styles.links} data-rise>
            {chapter.links.length ? (
              chapter.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={styles.link} data-cursor="hover">
                  {t.links[l.kind]} <span>↗</span>
                </a>
              ))
            ) : (
              <span className={styles.private}>{t.chapter.privateRepo}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chapter;

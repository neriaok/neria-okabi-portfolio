import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { INTRO_PALETTE } from '../../config/content';
import { useCopy } from '../../hooks/useAppStore';
import { SCENES } from '../../config/scenes';
import FrameSequence from '../FrameSequence';
import styles from './Intro.module.css';

interface IntroProps {
  ready: boolean;
}

const Intro: FC<IntroProps> = ({ ready }) => {
  const rootRef = useRef<HTMLElement>(null);
  const scene = SCENES.intro;
  const t = useCopy();
  const NAME = t.name.toUpperCase().split(' ');

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.25 })
        .from('[data-letter]', { yPercent: 110, duration: 1.5, stagger: 0.035, ease: 'expo.out' })
        .from('[data-fade]', { y: 24, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out' }, 0.6);
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
      tl.to('[data-word="0"]', { xPercent: -18, ease: 'none' }, 0)
        .to('[data-word="1"]', { xPercent: 18, ease: 'none' }, 0)
        .to(`.${styles.name}`, { scale: 1.25, opacity: 0, filter: 'blur(14px)', ease: 'power1.in' }, 0.15)
        .to('[data-fade]', { opacity: 0, y: -30, ease: 'none' }, 0)
        .fromTo(`.${styles.thesis} [data-line]`, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.12, ease: 'power3.out' }, 0.45)
        .to(`.${styles.thesis}`, { opacity: 0, y: -40, ease: 'none' }, 0.9);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="top" className={styles.intro} data-palette={INTRO_PALETTE.join(',')} data-push>
      <div className={styles.stage}>
        {scene.type === 'frames' && <FrameSequence source={scene} triggerRef={rootRef} introFrames={24} play={ready} />}
        <div className={styles.meta} data-fade>
          <span>{t.intro.meta[0]} · {new Date().getFullYear()}</span>
          <span>{t.intro.meta[1]}</span>
        </div>
        <h1 className={styles.name} aria-label={t.name}>
          {NAME.map((word, w) => (
            <span key={word} className={styles.word} data-word={w} aria-hidden="true">
              {[...word].map((ch, i) => (
                <span key={i} className={styles.mask}><span data-letter>{ch}</span></span>
              ))}
            </span>
          ))}
        </h1>
        <p className={styles.role} data-fade>
          <em>{t.role}</em> {t.intro.roleLine}
        </p>
        <div className={styles.cue} data-fade><i />{t.intro.cue}</div>
        <div className={styles.thesis} aria-label={t.intro.thesis.join(' ')}>
          <span className={styles.mask}><span data-line>{t.intro.thesis[0]}</span></span>
          <span className={styles.mask}><span data-line>{t.intro.thesis[1]}</span></span>
          <span className={styles.mask}><span data-line className={styles.serif}>{t.intro.thesis[2]}</span></span>
        </div>
      </div>
    </section>
  );
};

export default Intro;

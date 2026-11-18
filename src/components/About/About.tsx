import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { OUTRO_PALETTE, SKILLS } from '../../config/content';
import { useCopy } from '../../hooks/useAppStore';
import styles from './About.module.css';

const About: FC = () => {
  const rootRef = useRef<HTMLElement>(null);
  const t = useCopy();
  const a = t.about;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-line]', { yPercent: 110, duration: 1.3, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: rootRef.current, start: 'top 65%' } });
      gsap.from('[data-row]', { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.timeline}`, start: 'top 80%' } });
      gsap.from('[data-skill]', { y: 30, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: `.${styles.skills}`, start: 'top 85%' } });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" className={styles.about} data-palette={OUTRO_PALETTE.join(',')} data-dim="0.35" aria-labelledby="about-title">
      <span className={styles.eyebrow}>{a.eyebrow}</span>
      <h2 id="about-title" className={styles.title}>
        <span className={styles.mask}><span data-line>{a.title[0]}</span></span>
        <span className={styles.mask}><span data-line>{a.title[1]} <em>{a.title[2]}</em></span></span>
      </h2>
      <p className={styles.lead}>{a.lead}</p>

      <ol className={styles.timeline}>
        {a.timeline.map((row) => (
          <li key={row.what} data-row>
            <span className={styles.when}>{row.when}</span>
            <strong>{row.what}</strong>
            <span className={styles.note}>{row.note}</span>
          </li>
        ))}
      </ol>

      <div className={styles.skills}>
        {(Object.keys(SKILLS) as (keyof typeof SKILLS)[]).map((group) => (
          <div key={group} className={styles.group} data-skill>
            <span className={styles.groupName}>{a.skills[group]}</span>
            <ul dir="ltr">{SKILLS[group].map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;

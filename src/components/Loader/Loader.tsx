import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { SCENES } from '../../config/scenes';
import { getSequence } from '../../utils/framePreloader';
import { useCopy } from '../../hooks/useAppStore';
import styles from './Loader.module.css';

interface LoaderProps {
  onDone: () => void;
}

/** Counter that follows real loading (fonts + first world), then splits open like a curtain. */
const Loader: FC<LoaderProps> = ({ onDone }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const t = useCopy();

  useEffect(() => {
    const intro = SCENES.intro;
    const seq = intro.type === 'frames' ? getSequence(intro) : null;
    const counter = { v: 0 };
    const target = { v: seq ? 0 : 100 };
    const setTarget = (p: number) => { target.v = Math.max(target.v, p * 100); };
    seq?.onProgress.add(setTarget);

    const render = () => {
      if (numRef.current) numRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
    };
    const chase = () => {
      counter.v += (Math.min(target.v, 99) - counter.v) * 0.07;
      render();
    };
    gsap.ticker.add(chase);

    let ctx: gsap.Context | undefined;
    const assets = Promise.race([
      Promise.all([document.fonts.ready, seq?.ready ?? Promise.resolve()]),
      new Promise<void>((r) => window.setTimeout(r, 9000)),
    ]);
    const minTime = new Promise<void>((r) => window.setTimeout(r, 1500));
    Promise.all([assets, minTime]).then(() => {
      gsap.ticker.remove(chase);
      ctx = gsap.context(() => {
        gsap.timeline()
          .to(counter, { v: 100, duration: 0.45, ease: 'power2.out', onUpdate: render })
          .to(`.${styles.row}`, { yPercent: -120, duration: 0.7, ease: 'power3.in', stagger: 0.05 }, '+=0.1')
          .to(`.${styles.top}`, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onStart: onDone }, '-=0.2')
          .to(`.${styles.bottom}`, { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
          .set(rootRef.current, { display: 'none' });
      }, rootRef);
    });
    return () => {
      gsap.ticker.remove(chase);
      seq?.onProgress.delete(setTarget);
      ctx?.revert();
    };
  }, [onDone]);

  return (
    <div ref={rootRef} className={styles.loader} aria-hidden="true">
      <div className={styles.top} />
      <div className={styles.bottom} />
      <div className={styles.inner}>
        <div className={styles.mask}><span className={styles.row}>{t.loader.top}</span></div>
        <div className={styles.mask}><span ref={numRef} className={`${styles.row} ${styles.num}`}>000</span></div>
        <div className={styles.mask}><span className={styles.row}>{t.loader.bottom}</span></div>
      </div>
    </div>
  );
};

export default Loader;

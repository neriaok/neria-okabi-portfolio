import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ScrollTrigger } from '../../utils/gsap';
import styles from './ScrollCue.module.css';

interface ScrollCueProps {
  ready: boolean;
}

/**
 * Minimal "keep scrolling" hint: a hairline progress rail on the edge, plus a small
 * mouse/swipe glyph that appears only when the visitor stops scrolling mid-page.
 */
const ScrollCue: FC<ScrollCueProps> = ({ ready }) => {
  const fillRef = useRef<HTMLSpanElement>(null);
  const [idle, setIdle] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2200);
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${self.progress})`;
        setAtEnd(self.progress > 0.97);
        setIdle(false);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setIdle(true), 1800);
      },
    });
    return () => {
      st.kill();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={clsx(styles.cue, ready && styles.ready)} aria-hidden="true">
      <span className={styles.rail}><span ref={fillRef} className={styles.fill} /></span>
      <span className={clsx(styles.hint, idle && !atEnd && styles.show)}>
        <span className={styles.mouse}><i /></span>
        <span className={styles.chev} />
      </span>
    </div>
  );
};

export default ScrollCue;

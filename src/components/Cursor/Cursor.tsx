import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import styles from './Cursor.module.css';

/** Desktop-only cursor: a dot + a lagging ring that reacts to [data-cursor] targets. */
const Cursor: FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' });

    const handleMove = (e: PointerEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
      ring.dataset.state = target?.dataset.cursor ?? '';
    };
    const handleDown = () => gsap.to(ring, { scale: 0.8, duration: 0.15 });
    const handleUp = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' });
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className={styles.ring} aria-hidden="true"><span>View</span></div>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
    </>
  );
};

export default Cursor;

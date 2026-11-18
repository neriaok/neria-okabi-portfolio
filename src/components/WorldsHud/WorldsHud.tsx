import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { gsap, ScrollTrigger } from '../../utils/gsap';
import { ALL_WORLD_IDS, CHAPTERS, WorldId } from '../../config/content';
import { useCopy } from '../../hooks/useAppStore';
import styles from './WorldsHud.module.css';

interface WorldsHudProps {
  unlocked: string[]; // chapter ids, in unlock order
}

// first chapter that opens each world decides its color
const OWNER = new Map<WorldId, string>();
CHAPTERS.forEach((c) => c.worlds.forEach((w) => { if (!OWNER.has(w)) OWNER.set(w, c.accent); }));

/** "Worlds unlocked" HUD: fills up as the visitor travels through the projects. */
const WorldsHud: FC<WorldsHudProps> = ({ unlocked }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const shown = useRef(0);
  const t = useCopy();

  const unlockedWorlds = useMemo(() => {
    const set = new Set<WorldId>();
    CHAPTERS.filter((c) => unlocked.includes(c.id)).forEach((c) => c.worlds.forEach((w) => set.add(w)));
    return set;
  }, [unlocked]);
  const latest = CHAPTERS.find((c) => c.id === unlocked[unlocked.length - 1]);
  const fresh = useMemo(() => {
    if (!latest) return [];
    const before = new Set<WorldId>();
    CHAPTERS.filter((c) => unlocked.slice(0, -1).includes(c.id)).forEach((c) => c.worlds.forEach((w) => before.add(w)));
    return latest.worlds.filter((w) => !before.has(w));
  }, [latest, unlocked]);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#work',
      start: 'top 40%',
      end: 'bottom 60%',
      onToggle: (self) => setVisible(self.isActive),
    });
    return () => st.kill();
  }, []);

  // count up + pulse
  useEffect(() => {
    const target = unlockedWorlds.size;
    const o = { v: shown.current };
    gsap.to(o, {
      v: target,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(o.v)).padStart(2, '0');
      },
    });
    if (target > shown.current && rootRef.current) {
      gsap.fromTo(rootRef.current.querySelector(`.${styles.count}`), { scale: 1.35 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      const fresh = rootRef.current.querySelectorAll('[data-fresh]');
      gsap.timeline()
        .fromTo(fresh, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' })
        .to(fresh, { x: -10, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, '+=2.4');
    }
    shown.current = target;
  }, [unlockedWorlds]);

  return (
    <aside ref={rootRef} className={clsx(styles.hud, visible && styles.visible)} aria-live="polite" aria-label={`${t.hud}: ${unlockedWorlds.size} / ${ALL_WORLD_IDS.length}`}>
      <div className={styles.head}>
        <span className={styles.num} dir="ltr"><span ref={countRef} className={styles.count}>00</span><small>/{ALL_WORLD_IDS.length}</small></span>
        <span className={styles.label}>{t.hud}</span>
      </div>
      <div className={styles.bar}><i style={{ transform: `scaleX(${unlockedWorlds.size / ALL_WORLD_IDS.length})` }} /></div>
      <div className={styles.grid}>
        {ALL_WORLD_IDS.map((w) => (
          <i
            key={w}
            title={t.worlds[w]}
            className={clsx(styles.cell, unlockedWorlds.has(w) && styles.on)}
            style={{ '--c': OWNER.get(w) } as CSSProperties}
          />
        ))}
      </div>
      <ul className={styles.fresh} style={{ '--c': latest?.accent } as CSSProperties}>
        {fresh.map((w) => <li key={`${latest?.id}-${w}`} data-fresh>+ {t.worlds[w]}</li>)}
      </ul>
    </aside>
  );
};

export default WorldsHud;

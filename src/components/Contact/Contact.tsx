import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { isTouch } from '../../hooks/useIsTouch';
import { OUTRO_PALETTE, PROFILE } from '../../config/content';
import { useCopy } from '../../hooks/useAppStore';
import { SCENES } from '../../config/scenes';
import FrameSequence from '../FrameSequence';
import styles from './Contact.module.css';

interface ContactProps {
  onOpenTerminal: () => void;
}

const Contact: FC<ContactProps> = ({ onOpenTerminal }) => {
  const rootRef = useRef<HTMLElement>(null);
  const scene = SCENES.outro;
  const t = useCopy();

  const links = [
    PROFILE.email && { label: t.contact.email, href: `mailto:${PROFILE.email}`, primary: true },
    PROFILE.linkedin && { label: 'LinkedIn', href: PROFILE.linkedin },
    { label: 'GitHub', href: PROFILE.github },
    { label: t.contact.whatsapp, href: `https://wa.me/${PROFILE.phoneIntl}` },
    PROFILE.cv && { label: t.contact.cv, href: PROFILE.cv },
  ].filter(Boolean) as { label: string; href: string; primary?: boolean }[];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-line]', { yPercent: 115, duration: 1.4, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 55%' } });
      gsap.from('[data-btn]', { y: 30, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 45%' } });
    }, root);

    if (isTouch()) return () => ctx.revert();
    const btns = Array.from(root.querySelectorAll<HTMLElement>('[data-btn]'));
    const movers = btns.map((b) => ({ b, x: gsap.quickTo(b, 'x', { duration: 0.7, ease: 'elastic.out(1,0.45)' }), y: gsap.quickTo(b, 'y', { duration: 0.7, ease: 'elastic.out(1,0.45)' }) }));
    const handleMove = (e: PointerEvent) => {
      movers.forEach(({ b, x, y }) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < r.width) { x(dx * 0.3); y(dy * 0.3); } else { x(0); y(0); }
      });
    };
    window.addEventListener('pointermove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} id="contact" className={styles.contact} data-palette={OUTRO_PALETTE.join(',')} data-push aria-labelledby="contact-title">
      {scene.type === 'frames' && <div className={styles.frames}><FrameSequence source={scene} triggerRef={rootRef} start="top bottom" end="bottom bottom" /></div>}
      <span className={styles.eyebrow}>{t.contact.eyebrow}</span>
      <h2 id="contact-title" className={styles.title}>
        <span className={styles.mask}><span data-line>{t.contact.title[0]}</span></span>
        <span className={styles.mask}><span data-line>{t.contact.title[1]} <em>{t.contact.title[2]}</em></span></span>
      </h2>
      <p className={styles.sub}>{t.contact.sub}</p>
      <div className={styles.links}>
        {links.map((l, i) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={i === 0 ? styles.primary : styles.btn} data-btn data-cursor="hide">
            {l.label}
          </a>
        ))}
      </div>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} {t.name}</span>
        <span className={styles.made} dir="ltr">{t.contact.made}</span>
        <button type="button" onClick={onOpenTerminal} className={styles.hint} data-cursor="hover">
          {t.contact.devHint} <kbd>`</kbd>
        </button>
      </footer>
    </section>
  );
};

export default Contact;

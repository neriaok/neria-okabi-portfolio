import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import Device from '../Device';
import { REQUEST_EVENT } from '../PlaneGlide/PlaneGlide';
import { useCopy } from '../../hooks/useAppStore';
import styles from './HubAutomation.module.css';

interface HubAutomationProps {
  image: string;
}

/** The dashboard plus an illustration of its Make flow: API event → router → emails to the right people. */
const HubAutomation: FC<HubAutomationProps> = ({ image }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const d = useCopy().hubDemo;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
      tl.set('[data-mail]', { opacity: 0, y: 30, scale: 0.94 })
        .set('[data-node]', { opacity: 0.45 })
        .set('[data-pulse]', { left: '0%', opacity: 0 })
        .to('[data-node="event"]', { opacity: 1, duration: 0.3 }, 0.2)
        .to('[data-event="created"]', { opacity: 1, duration: 0.3 }, 0.2)
        .to('[data-pulse]', { opacity: 1, duration: 0.1 }, 0.4)
        .to('[data-pulse]', { left: '50%', duration: 0.7, ease: 'power1.inOut' }, 0.4)
        .to('[data-node="router"]', { opacity: 1, duration: 0.3 }, 1.0)
        .to('[data-pulse]', { left: '100%', duration: 0.7, ease: 'power1.inOut' }, 1.1)
        .to('[data-node="mail"]', { opacity: 1, duration: 0.3 }, 1.7)
        .to('[data-mail="manager"]', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 1.8)
        .to('[data-mail="manager"]', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 4.6)
        .to('[data-event="created"]', { opacity: 0, duration: 0.2 }, 4.6)
        .set('[data-pulse]', { left: '0%' }, 5.0)
        .to('[data-event="decided"]', { opacity: 1, duration: 0.3 }, 5.0)
        .to('[data-pulse]', { left: '100%', duration: 1.2, ease: 'power1.inOut' }, 5.1)
        .to('[data-mail="employee"]', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 6.3)
        .to('[data-mail="employee"]', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, 9.2)
        .to('[data-event="decided"]', { opacity: 0, duration: 0.2 }, 9.2);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.3 });
      if (rootRef.current) io.observe(rootRef.current);
      // the paper plane landing in the dashboard is a new request: run the flow from the start
      const onRequest = () => tl.restart();
      window.addEventListener(REQUEST_EVENT, onRequest);
      return () => {
        io.disconnect();
        window.removeEventListener(REQUEST_EVENT, onRequest);
      };
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.wrap}>
      <Device kind="desktop" image={image} label="ProjectHub dashboard" url="projecthub-bice.vercel.app" />

      <div className={styles.flow} dir="ltr" aria-label="Automation flow: API event, Make router, email">
        <span className={styles.node} data-node="event">
          API event
          <small data-event="created">request.created</small>
          <small data-event="decided">request.decided</small>
        </span>
        <span className={styles.track}><i data-pulse /></span>
        <span className={styles.node} data-node="router">Make · router</span>
        <span className={styles.track} />
        <span className={styles.node} data-node="mail">Email</span>
      </div>

      <div className={styles.mails}>
        <article className={styles.mail} data-mail="manager">
          <header><span className={styles.dot} />{d.manager.to}<em>{d.now}</em></header>
          <strong>{d.manager.subject}</strong>
          <dl>
            <div><dt>{d.manager.project[0]}</dt><dd>{d.manager.project[1]}</dd></div>
            <div><dt>{d.manager.dept[0]}</dt><dd>{d.manager.dept[1]}</dd></div>
            <div><dt>{d.manager.budget[0]}</dt><dd>{d.manager.budget[1]}</dd></div>
          </dl>
          <span className={styles.cta}>{d.manager.cta}</span>
        </article>
        <article className={styles.mail} data-mail="employee">
          <header><span className={`${styles.dot} ${styles.ok}`} />{d.employee.to}<em>{d.now}</em></header>
          <strong>{d.employee.subject}</strong>
          <p>{d.employee.note}</p>
          <span className={styles.cta}>{d.employee.cta}</span>
        </article>
      </div>
      <span className={styles.caption}>{d.caption}</span>
    </div>
  );
};

export default HubAutomation;

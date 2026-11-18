import { FC, useEffect, useRef } from 'react';
import { gsap } from '../../utils/gsap';
import { useCopy } from '../../hooks/useAppStore';
import { MESSAGE_EVENT } from '../BubbleFall/BubbleFall';
import styles from './DmDemo.module.css';

/** Illustration of the bot's real flow, played in a phone: comment → DM → follow check → content. */
const DmDemo: FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const d = useCopy().botDemo;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true, defaults: { ease: 'back.out(1.6)', duration: 0.5 } });
      tl.set('[data-step]', { opacity: 0, y: 16, scale: 0.96 })
        .to('[data-step="comment"]', { opacity: 1, y: 0, scale: 1 }, 0.3)
        .to('[data-step="typing"]', { opacity: 1, y: 0, scale: 1 }, 1.2)
        .to('[data-step="typing"]', { opacity: 0, duration: 0.2 }, 2.0)
        .to('[data-step="dm"]', { opacity: 1, y: 0, scale: 1 }, 2.1)
        .to('[data-step="tap"]', { opacity: 1, y: 0, scale: 1 }, 3.0)
        .to('[data-step="check"]', { opacity: 1, y: 0, scale: 1 }, 3.7)
        .to('[data-step="content"]', { opacity: 1, y: 0, scale: 1 }, 4.5)
        .to('[data-step]', { opacity: 0, y: -10, duration: 0.4, stagger: 0.03, ease: 'power2.in' }, 7.2);
      const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.3 });
      if (rootRef.current) io.observe(rootRef.current);
      // the jelly bubble popping on the phone is the message arriving: play the flow from the start
      const onMessage = () => tl.restart();
      window.addEventListener(MESSAGE_EVENT, onMessage);
      return () => {
        io.disconnect();
        window.removeEventListener(MESSAGE_EVENT, onMessage);
      };
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.phone} aria-label="Animated example of the comment-to-DM flow">
      <div className={styles.notch} />
      <div className={styles.screen} data-drop-target>
        <div className={styles.header}><span className={styles.avatar} />neria.tech<small>{d.chat}</small></div>
        <div className={styles.feed}>
          <div className={`${styles.card} ${styles.comment}`} data-step="comment">
            <span className={styles.who}>{d.comment[0]}</span> {d.comment[1]} <b>{d.comment[2]}</b>
          </div>
          <div className={`${styles.bubble} ${styles.bot} ${styles.typing}`} data-step="typing"><i /><i /><i /></div>
          <div className={`${styles.bubble} ${styles.bot}`} data-step="dm">
            {d.dm}
            <span className={styles.btn}>{d.tap}</span>
          </div>
          <div className={`${styles.bubble} ${styles.user}`} data-step="tap">{d.tap}</div>
          <div className={`${styles.card} ${styles.check}`} data-step="check"><span className={styles.tick}>✓</span> {d.check}</div>
          <div className={`${styles.bubble} ${styles.bot}`} data-step="content">
            {d.content}
            <span className={styles.btn}>{d.open}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DmDemo;

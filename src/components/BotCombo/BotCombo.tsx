import { FC } from 'react';
import DmDemo from '../DmDemo';
import { useCopy } from '../../hooks/useAppStore';
import styles from './BotCombo.module.css';

const POSTS = [1, 2, 3, 4, 5, 6].map((n) => `./shots/ig/${n}.jpg`);

/** The DM flow next to a glimpse of the real @neria.tech feed it serves. */
const BotCombo: FC = () => {
  const d = useCopy().botDemo;
  return (
  <div className={styles.combo}>
    <div className={styles.feed}>
      <div className={styles.profile}>
        <span className={styles.avatar} />
        <div>
          <strong>neria.tech</strong>
          <small>{d.published}</small>
        </div>
      </div>
      <div className={styles.grid}>
        {POSTS.map((src) => <img key={src} src={src} alt={d.postAlt} loading="lazy" />)}
      </div>
    </div>
    <div className={styles.phone}>
      <DmDemo />
    </div>
  </div>
  );
};

export default BotCombo;

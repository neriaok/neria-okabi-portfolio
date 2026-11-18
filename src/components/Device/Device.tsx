import { FC, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './Device.module.css';

interface DeviceProps {
  kind: 'desktop' | 'phone';
  image?: string;
  video?: string;
  iframe?: string;
  label: string;
  url?: string;
}

/** Browser window or phone frame. Video plays only while on screen; iframes load lazily on demand. */
const Device: FC<DeviceProps> = ({ kind, image, video, iframe, label, url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const screen = iframe ? (
    live ? (
      <iframe src={iframe} title={label} className={styles.media} loading="lazy" allow="clipboard-write" />
    ) : (
      <button type="button" className={styles.launch} onClick={() => setLive(true)} data-cursor="hover">
        <span className={styles.pulse} />
        <strong>Try it live</strong>
        <small>loads the real app inside the phone</small>
      </button>
    )
  ) : video ? (
    <video ref={videoRef} className={styles.media} src={video} poster={image} muted loop playsInline preload="metadata" aria-label={label} />
  ) : image ? (
    <img className={styles.media} src={image} alt={label} loading="lazy" />
  ) : null;

  if (kind === 'phone') {
    return (
      <div className={clsx(styles.phone)}>
        <div className={styles.notch} />
        <div className={styles.phoneScreen} data-drop-target>{screen}</div>
      </div>
    );
  }
  return (
    <div className={styles.browser}>
      <div className={styles.bar}>
        <span className={styles.dots}><i /><i /><i /></span>
        <span className={styles.url}>{url ?? label}</span>
      </div>
      <div className={styles.browserScreen} data-drop-target>{screen}</div>
    </div>
  );
};

export default Device;

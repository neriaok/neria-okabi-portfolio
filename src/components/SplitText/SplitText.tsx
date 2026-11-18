import { FC, ElementType } from 'react';
import clsx from 'clsx';
import styles from './SplitText.module.css';

interface SplitTextProps {
  /** Each entry renders as its own masked line. */
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** Also split each line into masked words (for staggered reveals). */
  words?: boolean;
}

/** Accessible split text: screen readers get the plain text, visuals get masked units. */
const SplitText: FC<SplitTextProps> = ({ lines, as: Tag = 'div', className, lineClassName, words = false }) => (
  <Tag className={clsx(styles.split, className)} aria-label={lines.join(' ')}>
    {lines.map((line, i) => (
      <span key={i} className={clsx(styles.line, lineClassName)} aria-hidden="true">
        {words
          ? line.split(' ').map((w, j) => (
              <span key={j} className={styles.mask}>
                <span className={styles.unit} data-unit>
                  {w}
                </span>
                {j < line.split(' ').length - 1 && ' '}
              </span>
            ))
          : (
            <span className={styles.mask}>
              <span className={styles.unit} data-unit>
                {line}
              </span>
            </span>
          )}
      </span>
    ))}
  </Tag>
);

export default SplitText;

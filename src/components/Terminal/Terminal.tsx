import { FC, FormEvent, KeyboardEvent, useEffect, useReducer, useRef, useState } from 'react';
import { gsap } from '../../utils/gsap';
import { getLenis } from '../../hooks/useSmoothScroll';
import { runCommand } from './commands';
import styles from './Terminal.module.css';

interface TerminalProps {
  open: boolean;
  onClose: () => void;
}

interface Entry {
  id: number;
  kind: 'in' | 'out';
  text: string;
}

type Action = { type: 'push'; entries: Omit<Entry, 'id'>[] } | { type: 'clear' };

let nextId = 0;
const reducer = (state: Entry[], action: Action): Entry[] => {
  if (action.type === 'clear') return [];
  return [...state, ...action.entries.map((e) => ({ ...e, id: nextId++ }))];
};

const WELCOME: Omit<Entry, 'id'>[] = [
  { kind: 'out', text: 'neria-os v2.0 · you are inside the portfolio' },
  { kind: 'out', text: 'type "help" to see what you can do.' },
];

const Terminal: FC<TerminalProps> = ({ open, onClose }) => {
  const [entries, dispatch] = useReducer(reducer, [], () => reducer([], { type: 'push', entries: WELCOME }));
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      gsap.fromTo(panelRef.current, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6 });
      window.setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      lenis?.start();
    }
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [entries]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = runCommand(value);
    if (value.trim()) setHistory((h) => [value, ...h]);
    setCursor(-1);
    setValue('');
    if (result.action === 'clear') return dispatch({ type: 'clear' });
    dispatch({ type: 'push', entries: [{ kind: 'in', text: value }, ...result.output.map((text) => ({ kind: 'out' as const, text }))] });
    if (result.action === 'close') onClose();
    else if (result.action && typeof result.action === 'object') {
      if ('open' in result.action) window.open(result.action.open, '_blank', 'noopener');
      else {
        const target = document.getElementById(result.action.scroll);
        onClose();
        window.setTimeout(() => {
          const lenis = getLenis();
          if (target && lenis) lenis.scrollTo(target, { offset: -120, duration: 2 });
          else target?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setValue(history[next]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(cursor - 1, -1);
      setCursor(next);
      setValue(next === -1 ? '' : history[next]);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div ref={panelRef} className={styles.panel} dir="ltr" role="dialog" aria-modal="true" aria-label="Terminal" onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}>
        <div className={styles.bar}>
          <span className={styles.dots}>
            <button type="button" aria-label="close" onClick={onClose} />
            <i /><i />
          </span>
          <span>neria@dev: ~</span>
          <span className={styles.esc}>esc</span>
        </div>
        <div ref={bodyRef} className={styles.body} data-lenis-prevent>
          {entries.map((e) => (
            <div key={e.id} className={e.kind === 'in' ? styles.in : styles.out}>
              {e.kind === 'in' && <span className={styles.prompt}>neria@dev:~$ </span>}
              {e.text}
            </div>
          ))}
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="term-input" className={styles.prompt}>neria@dev:~$&nbsp;</label>
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className={styles.input}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Terminal;

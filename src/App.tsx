import { FC, useCallback, useEffect, useState } from 'react';
import WorldSky from './components/WorldSky';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Intro from './components/Intro';
import Chapter from './components/Chapter';
import WorldsHud from './components/WorldsHud';
import About from './components/About';
import Contact from './components/Contact';
import Terminal from './components/Terminal';
import Cursor from './components/Cursor';
import ScrollCue from './components/ScrollCue';
import { CHAPTERS } from './config/content';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useReducedMotion } from './hooks/useReducedMotion';
import { isTouch } from './hooks/useIsTouch';
import { ScrollTrigger } from './utils/gsap';
import { useAppSelector, useCopy } from './hooks/useAppStore';

const App: FC = () => {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const lang = useAppSelector((s) => s.lang.lang);
  const t = useCopy();
  useSmoothScroll(!reducedMotion);

  const handleLoaded = useCallback(() => setReady(true), []);
  const openTerminal = useCallback(() => setTerminalOpen(true), []);
  const closeTerminal = useCallback(() => setTerminalOpen(false), []);
  const handleUnlock = useCallback((id: string, on: boolean) => {
    setUnlocked((list) => (on ? (list.includes(id) ? list : [...list, id]) : list.filter((x) => x !== id)));
  }, []);

  // language: document attributes + a clean remount of every scroll-driven section
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
    document.title = t.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
    setUnlocked([]);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [lang, t]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea');
      if (e.key === '`' && !typing) {
        e.preventDefault();
        setTerminalOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <WorldSky key={`sky-${lang}`} reducedMotion={reducedMotion} />
      <Loader onDone={handleLoaded} />
      {!isTouch() && <Cursor />}
      <Nav onOpenTerminal={openTerminal} />
      <WorldsHud unlocked={unlocked} />
      <ScrollCue ready={ready} />
      <main key={lang}>
        <Intro ready={ready} />
        <div id="work">
          {CHAPTERS.map((c, i) => (
            <Chapter key={c.id} chapter={c} total={CHAPTERS.length} flip={i % 2 === 1} onUnlock={handleUnlock} />
          ))}
        </div>
        <About />
        <Contact onOpenTerminal={openTerminal} />
      </main>
      <Terminal open={terminalOpen} onClose={closeTerminal} />
    </>
  );
};

export default App;

import { FC } from 'react';
import { useAppDispatch, useAppSelector, useCopy } from '../../hooks/useAppStore';
import { setLang } from '../../features/lang/langSlice';
import styles from './Nav.module.css';

interface NavProps {
  onOpenTerminal: () => void;
}

const Nav: FC<NavProps> = ({ onOpenTerminal }) => {
  const t = useCopy();
  const lang = useAppSelector((s) => s.lang.lang);
  const dispatch = useAppDispatch();

  const handleToggleLang = () => dispatch(setLang(lang === 'en' ? 'he' : 'en'));

  return (
    <header className={styles.nav}>
      <a href="#top" className={styles.brand} data-cursor="hover">
        <b>NO</b>
        <span>{t.name}</span>
      </a>
      <nav className={styles.links}>
        <a href="#work" data-cursor="hover">{t.nav.work}</a>
        <a href="#about" data-cursor="hover">{t.nav.about}</a>
        <a href="#contact" data-cursor="hover">{t.nav.contact}</a>
        <button type="button" onClick={handleToggleLang} className={styles.lang} data-cursor="hover" aria-label={lang === 'en' ? 'עברית' : 'English'} lang={lang === 'en' ? 'he' : 'en'}>
          {t.langSwitch}
        </button>
        <button type="button" onClick={onOpenTerminal} className={styles.term} data-cursor="hover" aria-label={t.nav.terminal}>
          <kbd>`</kbd>
        </button>
      </nav>
    </header>
  );
};

export default Nav;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Lang } from '../../i18n/copy';

const STORAGE_KEY = 'portfolio-lang';

const isLang = (v: string | null): v is Lang => v === 'en' || v === 'he';

/** ?lang= in the URL wins, then the visitor's last choice, then the browser language. */
const detectLang = (): Lang => {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('he') ? 'he' : 'en';
};

interface LangState {
  lang: Lang;
}

const initialState: LangState = { lang: detectLang() };

const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    setLang: (state, action: PayloadAction<Lang>) => {
      state.lang = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY, action.payload);
      } catch {
        /* storage unavailable */
      }
    },
  },
});

export const { setLang } = langSlice.actions;
export default langSlice.reducer;

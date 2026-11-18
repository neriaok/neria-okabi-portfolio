import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { COPY, type Copy } from '../i18n/copy';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** All visible text for the current language. */
export const useCopy = (): Copy => COPY[useAppSelector((s) => s.lang.lang)];

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return reduced;
};

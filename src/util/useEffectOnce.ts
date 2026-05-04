import { useEffect, useRef } from 'react';

/**
 * Run an effect once on mount (StrictMode-safe). React 19 fires effects
 * twice in development; we use a ref guard to keep our state-machine
 * `start()` calls idempotent.
 */
export function useEffectOnce(effect: () => void): void {
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

import { useCallback, useEffect, useState } from 'react';

interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  refetch: () => void;
}

/**
 * Calls `loader` on mount, on window focus, and whenever the tab becomes
 * visible. Lets the UI reflect host-side markdown edits without manual reload.
 *
 * Pass `keys` to re-run the loader when something the loader closes over
 * changes (e.g., a route param).
 */
export function useApi<T>(loader: () => Promise<T>, keys: ReadonlyArray<unknown> = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    loader()
      .then((value) => {
        setData(value);
        setError(null);
      })
      .catch((err) => setError(String(err)));
  }, keys);

  useEffect(() => {
    // Reset on key change so callers see loading state, not stale data.
    setData(null);
    setError(null);
    run();
  }, [run]);

  useEffect(() => {
    const onFocus = (): void => run();
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') run();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [run]);

  return { data, error, refetch: run };
}

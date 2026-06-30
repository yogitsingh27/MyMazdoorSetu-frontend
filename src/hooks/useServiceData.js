import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Runs an async service call and exposes {data, loading, error, reload}.
 * `deps` works like useEffect deps — pass [activeRole] etc. to refetch.
 * fetcher must be stable-ish (wrap in useCallback at the call site if it
 * closes over changing values you don't want in deps).
 */
export function useServiceData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const aliveRef = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => { if (aliveRef.current) setData(result); })
      .catch((err) => { if (aliveRef.current) setError(err); })
      .finally(() => { if (aliveRef.current) setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => { aliveRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload: load };
}

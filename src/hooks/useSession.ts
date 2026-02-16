import { useState, useEffect } from 'react';
import type { Session } from '../types/session.ts';

export function useSession(dateKey: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dateKey) {
      setSession(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/sessions/${dateKey}.json`)
      .then(res => {
        if (!res.ok) throw new Error('not_found');
        return res.json();
      })
      .then((data: Session) => {
        if (!cancelled) {
          setSession(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setError('not_found');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [dateKey]);

  return { session, loading, error };
}

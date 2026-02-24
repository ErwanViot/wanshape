import { useEffect, useState } from 'react';
import type { Session, SessionSource } from '../types/session.ts';

const DEFAULT_SOURCE: SessionSource = { type: 'static' };

/**
 * Fetches a session by date key.
 * Currently reads static JSON; will be extended for Supabase in a future phase.
 */
async function fetchSession(dateKey: string, source: SessionSource = DEFAULT_SOURCE): Promise<Session> {
  if (source.type === 'static') {
    const res = await fetch(`/sessions/${dateKey}.json`);
    if (!res.ok) throw new Error('not_found');
    return res.json();
  }
  // API source will be implemented in Phase 2
  throw new Error(`Unsupported session source: ${source.type}`);
}

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

    fetchSession(dateKey)
      .then((data) => {
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

    return () => {
      cancelled = true;
    };
  }, [dateKey]);

  return { session, loading, error };
}

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { CustomSessionRecord } from '../types/custom-session.ts';

export function useCustomSessions(userId: string | undefined) {
  const { dataGeneration } = useAuth();
  const [sessions, setSessions] = useState<CustomSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setSessions([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const {
        data,
        error: fetchError,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!
          .from('custom_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false })
          .limit(20),
      );

      if (sessionExpired) {
        notifySessionExpired();
        setError('Session expirée. Rafraîchis la page.');
      } else if (fetchError) {
        setError('Impossible de charger l\u2019historique.');
      } else {
        setSessions(data as CustomSessionRecord[]);
        setError(null);
      }
    } catch (err) {
      console.error('Custom sessions fetch error:', err);
      setError('Impossible de charger l\u2019historique.');
    } finally {
      setLoading(false);
    }
  }, [userId, dataGeneration]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}

export function useCustomSession(id: string | undefined, userId: string | undefined) {
  const { dataGeneration } = useAuth();
  const [session, setSession] = useState<CustomSessionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !userId || !supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const { data, sessionExpired } = await supabaseQuery(() =>
          supabase!.from('custom_sessions').select('*').eq('id', id).eq('user_id', userId).single(),
        );

        if (sessionExpired) {
          notifySessionExpired();
        }
        if (!cancelled && data) {
          setSession(data as CustomSessionRecord);
        }
      } catch (err) {
        console.error('Custom session fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, userId, dataGeneration]);

  return { session, loading };
}

export async function confirmCustomSession(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('custom_sessions')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('user_id', user.id);
    return !error;
  } catch (err) {
    console.error('Confirm custom session error:', err);
    return false;
  }
}

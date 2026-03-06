import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { CustomSessionRecord } from '../types/custom-session.ts';

export function useCustomSessions() {
  const [sessions, setSessions] = useState<CustomSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('custom_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) {
        setError('Impossible de charger l\u2019historique.');
      } else {
        setSessions(data as unknown as CustomSessionRecord[]);
        setError(null);
      }
    } catch {
      setError('Impossible de charger l\u2019historique.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}

export function useCustomSession(id: string | undefined) {
  const [session, setSession] = useState<CustomSessionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const { data: { user } } = await supabase!.auth.getUser();
        if (!user) { if (!cancelled) setLoading(false); return; }
        const { data, error } = await supabase!
          .from('custom_sessions')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (!cancelled && !error && data) {
          setSession(data as unknown as CustomSessionRecord);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { session, loading };
}

export async function confirmCustomSession(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('custom_sessions')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('user_id', user.id);
    return !error;
  } catch {
    return false;
  }
}

import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

interface SaveParams {
  sessionDate?: string;
  programSessionId?: string;
  customSessionId?: string;
  durationSeconds: number;
  amrapRounds: number;
  sessionTitle?: string;
}

export function useSaveCompletion() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const inflightRef = useRef(false);

  const save = useCallback(async (params: SaveParams) => {
    if (!supabase || inflightRef.current || saved) return;
    inflightRef.current = true;
    setError(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase.from('session_completions').insert({
        user_id: user.id,
        session_date: params.sessionDate ?? null,
        program_session_id: params.programSessionId ?? null,
        custom_session_id: params.customSessionId ?? null,
        duration_seconds: params.durationSeconds,
        amrap_rounds: params.amrapRounds > 0 ? params.amrapRounds : null,
        metadata: params.sessionTitle ? { session_title: params.sessionTitle } : {},
      });

      if (insertError) {
        console.error('Save completion error:', insertError);
        setError(true);
      } else {
        setSaved(true);
      }
    } catch {
      setError(true);
    } finally {
      inflightRef.current = false;
    }
  }, [saved]);

  return { save, saved, error };
}

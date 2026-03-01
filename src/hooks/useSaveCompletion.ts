import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

interface SaveParams {
  sessionDate?: string;
  programSessionId?: string;
  durationSeconds: number;
  amrapRounds: number;
  sessionTitle?: string;
}

export function useSaveCompletion() {
  const [saved, setSaved] = useState(false);
  const attempted = useRef(false);

  const save = useCallback(async (params: SaveParams) => {
    if (!supabase || attempted.current) return;
    attempted.current = true;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('session_completions').insert({
      user_id: user.id,
      session_date: params.sessionDate ?? null,
      program_session_id: params.programSessionId ?? null,
      duration_seconds: params.durationSeconds,
      amrap_rounds: params.amrapRounds > 0 ? params.amrapRounds : null,
      metadata: params.sessionTitle ? { session_title: params.sessionTitle } : {},
    });

    if (!error) setSaved(true);
  }, []);

  return { save, saved };
}

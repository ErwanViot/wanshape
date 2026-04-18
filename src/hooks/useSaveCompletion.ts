import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

interface SaveParams {
  sessionDate?: string;
  programSessionId?: string;
  customSessionId?: string;
  durationSeconds: number;
  amrapRounds: number;
  sessionTitle?: string;
  sessionDescription?: string;
  sessionFocus?: string[];
  blockTypes?: string[];
}

export function useSaveCompletion() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const inflightRef = useRef(false);

  const save = useCallback(
    async (params: SaveParams) => {
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
          metadata: {
            ...(params.sessionTitle && { session_title: params.sessionTitle }),
            ...(params.sessionDescription && { session_description: params.sessionDescription }),
            ...(params.sessionFocus?.length && { session_focus: params.sessionFocus }),
            ...(params.blockTypes?.length && { block_types: params.blockTypes }),
          },
        });

        if (insertError) {
          console.error('Save completion error:', insertError);
          setError(true);
        } else {
          setSaved(true);
          // Every query whose cache is affected by a new completion row must
          // be invalidated here — TanStack has no way to infer which lists a
          // mutation touches. Keep this list in sync with the migrated read
          // hooks:
          //  - useActiveProgram: progress + nextSession
          //  - useHistory: prepends the new row
          //  - useProgram(slug): completedSessionIds for the matching program.
          //    We invalidate the whole `['program']` prefix rather than a
          //    specific slug because the save call does not know which slug
          //    the ProgramPlayer was playing (no slug on the payload). The
          //    cost is small (rarely more than 1-2 cached programs at a time).
          queryClient.invalidateQueries({ queryKey: ['activeProgram', user.id] });
          queryClient.invalidateQueries({ queryKey: ['history', user.id] });
          queryClient.invalidateQueries({ queryKey: ['program'] });
        }
      } catch {
        setError(true);
      } finally {
        inflightRef.current = false;
      }
    },
    [saved, queryClient],
  );

  return { save, saved, error };
}

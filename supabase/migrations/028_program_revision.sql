-- Program revision: while a program has NOT been started (no session
-- completions reference any of its sessions), the user can request an
-- adjustment via a free-text comment. The program is regenerated in place
-- (async, same placeholder → finalize flow) with the comment fed to the model.
--
-- The eligibility gate MUST be atomic with flipping the row back to
-- 'generating': otherwise a session completed between a separate check and the
-- regeneration would have its program_session_id SET NULL when finalize_program
-- replaces the sessions. This single guarded UPDATE closes that window.

CREATE OR REPLACE FUNCTION public.begin_program_revision(
  p_program_id uuid,
  p_user_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
BEGIN
  UPDATE public.programs p
     SET status = 'generating', error_reason = NULL
   WHERE p.id = p_program_id
     AND p.user_id = p_user_id
     AND p.is_fixed = false
     AND p.status IN ('ready', 'failed')
     AND NOT EXISTS (
       SELECT 1
         FROM public.session_completions sc
         JOIN public.program_sessions ps ON ps.id = sc.program_session_id
        WHERE ps.program_id = p.id
     )
  RETURNING p.id INTO v_id;

  -- NULL when: not owned, wrong status, or already started. The edge maps this
  -- to a clear 4xx ("programme déjà commencé ou introuvable").
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.begin_program_revision(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.begin_program_revision(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.begin_program_revision IS
  'Atomically gates a program as revisable (owned, not fixed, ready|failed, no completions) and flips it to generating. Returns the id on success, NULL if ineligible.';

-- Review follow-up on 029: reap_stale_programs stamped error_reason = 'stale'
-- even on the branch that restores an intact program to `ready` (a revision
-- whose background task died). The client renders any non-null error_reason
-- as a "last adjustment failed" banner, so a perfectly usable program showed a
-- permanent, self-contradictory warning telling the user to delete it.
-- A stale placeholder (no sessions) still becomes `failed` + 'stale'; a stale
-- revision goes back to `ready` with a clean error_reason.

CREATE OR REPLACE FUNCTION public.reap_stale_programs(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH stale AS (
    SELECT p.id,
           EXISTS (SELECT 1 FROM public.program_sessions ps WHERE ps.program_id = p.id) AS has_sessions
      FROM public.programs p
     WHERE p.user_id = p_user_id
       AND p.is_fixed = false
       AND public.program_generation_is_stale(p.status, p.generation_started_at)
  ),
  upd AS (
    UPDATE public.programs p
       SET status = CASE WHEN s.has_sessions THEN 'ready'::public.program_status ELSE 'failed'::public.program_status END,
           error_reason = CASE WHEN s.has_sessions THEN NULL ELSE 'stale' END,
           generation_started_at = NULL
      FROM stale s
     WHERE p.id = s.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM upd;
  RETURN v_count;
END;
$$;

-- Repair rows already reaped with the old behaviour.
UPDATE public.programs p
   SET error_reason = NULL
 WHERE p.status = 'ready'
   AND p.error_reason = 'stale'
   AND EXISTS (SELECT 1 FROM public.program_sessions ps WHERE ps.program_id = p.id);

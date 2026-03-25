-- RPC: get_active_program
-- Returns the user's most recently active program with progress info,
-- replacing 5 sequential client queries with a single round-trip.

CREATE OR REPLACE FUNCTION get_active_program(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_last_ps_id uuid;
  v_program_id uuid;
  result jsonb;
BEGIN
  -- Authorization: only allow users to query their own data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  -- 1. Find the most recent completion linked to a program session
  SELECT sc.program_session_id
  INTO v_last_ps_id
  FROM public.session_completions sc
  WHERE sc.user_id = p_user_id
    AND sc.program_session_id IS NOT NULL
  ORDER BY sc.completed_at DESC
  LIMIT 1;

  IF v_last_ps_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. Resolve program_id from that program_session
  SELECT ps.program_id
  INTO v_program_id
  FROM public.program_sessions ps
  WHERE ps.id = v_last_ps_id;

  IF v_program_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 3. Build the full response in one query using CTEs
  WITH completed AS (
    SELECT DISTINCT sc.program_session_id
    FROM public.session_completions sc
    JOIN public.program_sessions ps ON ps.id = sc.program_session_id
    WHERE sc.user_id = p_user_id
      AND ps.program_id = v_program_id
  ),
  all_sessions AS (
    SELECT ps.id, ps.session_order, ps.session_data
    FROM public.program_sessions ps
    WHERE ps.program_id = v_program_id
    ORDER BY ps.session_order
  ),
  next_session AS (
    SELECT a.session_order, a.session_data
    FROM all_sessions a
    LEFT JOIN completed c ON c.program_session_id = a.id
    WHERE c.program_session_id IS NULL
    ORDER BY a.session_order
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'slug', p.slug,
    'title', p.title,
    'totalSessions', (SELECT count(*) FROM all_sessions),
    'completedCount', (SELECT count(*) FROM completed),
    'nextSessionOrder', (SELECT session_order FROM next_session),
    'nextSessionTitle', (SELECT session_data->>'title' FROM next_session),
    'nextSessionData', (SELECT session_data FROM next_session)
  )
  INTO result
  FROM public.programs p
  WHERE p.id = v_program_id;

  RETURN result;
END;
$$;

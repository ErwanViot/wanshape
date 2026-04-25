-- Atomic creation of a custom program + its sessions in a single transaction.
-- The previous edge-function flow (INSERT programs → INSERT program_sessions
-- → manual DELETE on failure) leaves an orphaned program row if the rollback
-- DELETE itself fails (network blip, RLS edge case, etc.). This RPC wraps
-- both inserts in a single PL/pgSQL transaction: if the sessions insert
-- raises, the program insert is rolled back automatically.

CREATE OR REPLACE FUNCTION public.create_program_with_sessions(
  p_user_id uuid,
  p_program jsonb,
  p_sessions jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_program_id uuid;
  v_session jsonb;
BEGIN
  INSERT INTO public.programs (
    slug,
    title,
    description,
    goals,
    duration_weeks,
    frequency_per_week,
    fitness_level,
    is_fixed,
    user_id,
    note_coach,
    progression,
    consignes_semaine,
    onboarding_data,
    generation_metadata,
    input_tokens,
    output_tokens,
    model,
    locale
  )
  VALUES (
    p_program->>'slug',
    p_program->>'title',
    p_program->>'description',
    ARRAY(SELECT jsonb_array_elements_text(p_program->'goals')),
    (p_program->>'duration_weeks')::int,
    (p_program->>'frequency_per_week')::int,
    p_program->>'fitness_level',
    false,
    p_user_id,
    p_program->>'note_coach',
    p_program->'progression',
    p_program->'consignes_semaine',
    p_program->'onboarding_data',
    p_program->'generation_metadata',
    (p_program->>'input_tokens')::int,
    (p_program->>'output_tokens')::int,
    p_program->>'model',
    p_program->>'locale'
  )
  RETURNING id INTO v_program_id;

  FOR v_session IN SELECT * FROM jsonb_array_elements(p_sessions)
  LOOP
    INSERT INTO public.program_sessions (
      program_id,
      week_number,
      session_order,
      session_data
    )
    VALUES (
      v_program_id,
      (v_session->>'week_number')::int,
      (v_session->>'session_order')::int,
      v_session->'session_data'
    );
  END LOOP;

  RETURN v_program_id;
END;
$$;

-- The edge function calls this via the service role, which bypasses RLS.
-- No grant to authenticated/anon: regular clients should never call this.
REVOKE ALL ON FUNCTION public.create_program_with_sessions(uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_program_with_sessions(uuid, jsonb, jsonb) TO service_role;

COMMENT ON FUNCTION public.create_program_with_sessions IS
  'Atomic INSERT into programs + program_sessions. If the sessions insert fails, the program insert is rolled back automatically by the surrounding transaction.';

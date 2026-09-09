-- Hardening of the async program generation flow (review of PR #239).
--
-- 1) A row stuck in `generating` (isolate killed past the 400s wall-clock,
--    redeploy, OOM) was undeletable from the UI, occupied one of the 3 active
--    slots forever and could never be revised. We now record when a generation
--    started and treat anything older than STALE_AFTER as failed: lazily reaped
--    by the edge function before any new generation, tolerated by the revision
--    gate, and excluded from the active-programs cap.
-- 2) A failed REVISION left a fully valid program in `failed`, hiding its
--    intact sessions behind a delete-only screen. fail_program now keeps
--    `ready` when the program still has sessions and only stores the reason.
-- 3) A session completed during a revision's `generating` window was silently
--    orphaned by finalize_program's DELETE (FK ON DELETE SET NULL). The
--    finalize step now refuses to replace sessions that have completions.
-- 4) error_reason now carries a machine code (see programErrors.ts) so the
--    client can localise it; legacy French prose is still rendered verbatim.
-- 5) Dead code: create_program_with_sessions (migration 021) was replaced by
--    the placeholder/finalize pair in 027; programs_user_status_idx is dropped
--    because the per-user cardinality (≤ a handful of rows) makes an index on
--    (user_id, status) useless for the cap count / reaper filters.

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS generation_started_at timestamptz;

COMMENT ON COLUMN public.programs.generation_started_at IS
  'Set when a generation/revision flips the row to generating; NULL once settled. A generating row older than 8 minutes is considered stale (failed).';

-- Backfill: any row currently generating without a start marker gets its
-- created_at so the staleness rule can evaluate it.
UPDATE public.programs
   SET generation_started_at = created_at
 WHERE status = 'generating' AND generation_started_at IS NULL;

-- ── Staleness rule (single source of truth for SQL callers) ─────────────
CREATE OR REPLACE FUNCTION public.program_generation_is_stale(
  p_status public.program_status,
  p_started_at timestamptz
) RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT p_status = 'generating'
     AND p_started_at IS NOT NULL
     AND p_started_at < now() - interval '8 minutes';
$$;

-- ── Active-cap trigger: ignore failed AND stale rows ────────────────────
CREATE OR REPLACE FUNCTION public.enforce_user_active_programs_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  IF NEW.is_fixed THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)
    INTO v_active_count
    FROM public.programs
   WHERE user_id = NEW.user_id
     AND is_fixed = false
     AND status <> 'failed'
     AND NOT public.program_generation_is_stale(status, generation_started_at);

  IF v_active_count >= 3 THEN
    RAISE EXCEPTION 'active_programs_cap_reached'
      USING HINT = 'Maximum 3 active user programs per account.';
  END IF;

  RETURN NEW;
END;
$$;

-- ── reap_stale_programs ──────────────────────────────────────────────────
-- Lazily settles a user's stale `generating` rows. A placeholder with no
-- sessions becomes `failed`; a program that still has sessions (a revision
-- whose background task died) goes back to `ready` — its content is intact.
-- Called by the edge function before the cap check on every generation.
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
           error_reason = 'stale',
           generation_started_at = NULL
      FROM stale s
     WHERE p.id = s.id
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM upd;
  RETURN v_count;
END;
$$;

-- ── create_program_placeholder: stamp the start ─────────────────────────
CREATE OR REPLACE FUNCTION public.create_program_placeholder(
  p_user_id uuid,
  p_slug text,
  p_title text,
  p_goals text[],
  p_duration_weeks int,
  p_frequency_per_week int,
  p_onboarding_data jsonb,
  p_locale text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_program_id uuid;
BEGIN
  INSERT INTO public.programs (
    slug, title, goals, duration_weeks, frequency_per_week,
    is_fixed, user_id, onboarding_data, locale, status, fitness_level,
    generation_started_at
  )
  VALUES (
    p_slug, p_title, p_goals, p_duration_weeks, p_frequency_per_week,
    false, p_user_id, p_onboarding_data, p_locale, 'generating', 'intermediate',
    now()
  )
  RETURNING id INTO v_program_id;

  RETURN v_program_id;
END;
$$;

-- ── begin_program_revision: stamp the start, tolerate a stale generating ─
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
     SET status = 'generating',
         error_reason = NULL,
         generation_started_at = now()
   WHERE p.id = p_program_id
     AND p.user_id = p_user_id
     AND p.is_fixed = false
     AND (
       p.status IN ('ready', 'failed')
       OR public.program_generation_is_stale(p.status, p.generation_started_at)
     )
     AND NOT EXISTS (
       SELECT 1
         FROM public.session_completions sc
         JOIN public.program_sessions ps ON ps.id = sc.program_session_id
        WHERE ps.program_id = p.id
     )
  RETURNING p.id INTO v_id;

  RETURN v_id;
END;
$$;

-- ── finalize_program: never orphan a completion ─────────────────────────
CREATE OR REPLACE FUNCTION public.finalize_program(
  p_program_id uuid,
  p_user_id uuid,
  p_program jsonb,
  p_sessions jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Guard first: if a session of this program was completed while the
  -- revision was generating, replacing the sessions would SET NULL the
  -- completion's FK. Abort; the edge function records the reason and the
  -- program stays `ready` with its current sessions (see fail_program).
  IF EXISTS (
    SELECT 1
      FROM public.session_completions sc
      JOIN public.program_sessions ps ON ps.id = sc.program_session_id
     WHERE ps.program_id = p_program_id
  ) THEN
    RAISE EXCEPTION 'program_started_during_revision';
  END IF;

  UPDATE public.programs SET
    title              = p_program->>'title',
    description        = p_program->>'description',
    goals              = ARRAY(SELECT jsonb_array_elements_text(p_program->'goals')),
    duration_weeks     = (p_program->>'duration_weeks')::int,
    frequency_per_week = (p_program->>'frequency_per_week')::int,
    fitness_level      = p_program->>'fitness_level',
    note_coach         = p_program->>'note_coach',
    progression        = p_program->'progression',
    consignes_semaine  = p_program->'consignes_semaine',
    generation_metadata = p_program->'generation_metadata',
    input_tokens       = (p_program->>'input_tokens')::int,
    output_tokens      = (p_program->>'output_tokens')::int,
    model              = p_program->>'model',
    error_reason       = NULL,
    status             = 'ready',
    generation_started_at = NULL
  WHERE id = p_program_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'program_not_found_or_forbidden';
  END IF;

  DELETE FROM public.program_sessions WHERE program_id = p_program_id;

  INSERT INTO public.program_sessions (program_id, week_number, session_order, session_data)
  SELECT
    p_program_id,
    (s->>'week_number')::int,
    (s->>'session_order')::int,
    s->'session_data'
  FROM jsonb_array_elements(p_sessions) AS s;
END;
$$;

-- ── fail_program: keep a revised program usable ─────────────────────────
CREATE OR REPLACE FUNCTION public.fail_program(
  p_program_id uuid,
  p_user_id uuid,
  p_error text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.programs p
     SET status = CASE
                    WHEN EXISTS (SELECT 1 FROM public.program_sessions ps WHERE ps.program_id = p.id)
                      THEN 'ready'::public.program_status
                    ELSE 'failed'::public.program_status
                  END,
         error_reason = left(p_error, 500),
         generation_started_at = NULL
   WHERE p.id = p_program_id AND p.user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE LOG 'fail_program: program % not found for user %', p_program_id, p_user_id;
  END IF;
END;
$$;

-- ── Grants ───────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.reap_stale_programs(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reap_stale_programs(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.program_generation_is_stale(public.program_status, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.program_generation_is_stale(public.program_status, timestamptz) TO service_role;

-- ── Dead code removal ───────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.create_program_with_sessions(uuid, jsonb, jsonb);
DROP INDEX IF EXISTS public.programs_user_status_idx;

COMMENT ON COLUMN public.programs.error_reason IS
  'Machine code of the last generation failure (timeout, parse, truncation, network, api_*, invalid_program, sessions_invalid, save_failed, started_during_revision, stale, unexpected). Pre-029 rows may hold French prose.';

-- Async program generation: a program row now exists as a `generating`
-- placeholder from the moment the user submits, is filled in when the
-- background generation (EdgeRuntime.waitUntil in generate-program) completes,
-- and flips to `failed` if it errors. This escapes the 150s gateway idle
-- timeout that made large periodised programs impossible to generate in a
-- single blocking request.

-- ── 1) status enum + columns ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'program_status') THEN
    CREATE TYPE public.program_status AS ENUM ('generating', 'ready', 'failed');
  END IF;
END $$;

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS status public.program_status NOT NULL DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS error_reason text;

-- Existing rows keep the default 'ready' — they were all generated
-- synchronously and are complete. Only new async placeholders start as
-- 'generating'.

-- List queries fetch a user's finished programs; index the common path.
CREATE INDEX IF NOT EXISTS programs_user_status_idx
  ON public.programs (user_id, status);

-- ── 2) Active-cap trigger: exclude `failed` placeholders ─────────────────
-- A failed generation must not permanently consume one of the 3 active slots.
-- `generating` still counts (anti-spam: a user can't fire off unlimited
-- concurrent generations).
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
     AND status <> 'failed';

  IF v_active_count >= 3 THEN
    RAISE EXCEPTION 'active_programs_cap_reached'
      USING HINT = 'Maximum 3 active user programs per account.';
  END IF;

  RETURN NEW;
END;
$$;

-- ── 3) create_program_placeholder ────────────────────────────────────────
-- Inserts a minimal `generating` row (enough for the list card) and returns
-- its id. The cap trigger fires here, so an over-quota user is rejected before
-- any Anthropic call. Content columns are filled by finalize_program.
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
  -- fitness_level is NOT NULL (migration 002) with no default. The real value
  -- (from the model's niveau) is written by finalize_program; seed a valid
  -- placeholder so the INSERT satisfies the constraint.
  INSERT INTO public.programs (
    slug, title, goals, duration_weeks, frequency_per_week,
    is_fixed, user_id, onboarding_data, locale, status, fitness_level
  )
  VALUES (
    p_slug, p_title, p_goals, p_duration_weeks, p_frequency_per_week,
    false, p_user_id, p_onboarding_data, p_locale, 'generating', 'intermediate'
  )
  RETURNING id INTO v_program_id;

  RETURN v_program_id;
END;
$$;

-- ── 4) finalize_program ──────────────────────────────────────────────────
-- Fills the placeholder with generated content, inserts its sessions, and
-- flips status to 'ready' — all atomic. Re-usable for revisions: it first
-- clears any existing sessions so a regenerated program replaces cleanly.
-- Guarded on user_id so a caller can only finalize its own placeholder.
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
    status             = 'ready'
  WHERE id = p_program_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'program_not_found_or_forbidden';
  END IF;

  -- Replace sessions (revisions regenerate them from scratch).
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

-- ── 5) fail_program ──────────────────────────────────────────────────────
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
  UPDATE public.programs
     SET status = 'failed', error_reason = left(p_error, 500)
   WHERE id = p_program_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    -- Row was deleted mid-generation (user cancelled) — nothing to fail.
    RAISE LOG 'fail_program: program % not found for user %', p_program_id, p_user_id;
  END IF;
END;
$$;

-- Service-role only: the edge function orchestrates the async flow. Regular
-- clients read program rows via RLS but never call these directly.
REVOKE ALL ON FUNCTION public.create_program_placeholder(uuid, text, text, text[], int, int, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_program_placeholder(uuid, text, text, text[], int, int, jsonb, text) TO service_role;
REVOKE ALL ON FUNCTION public.finalize_program(uuid, uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_program(uuid, uuid, jsonb, jsonb) TO service_role;
REVOKE ALL ON FUNCTION public.fail_program(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fail_program(uuid, uuid, text) TO service_role;

COMMENT ON COLUMN public.programs.status IS
  'generating = async generation in flight (placeholder), ready = usable, failed = generation errored (excluded from the active-programs cap).';

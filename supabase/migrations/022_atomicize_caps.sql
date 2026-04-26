-- Two atomicity gaps surfaced during the PR-A5 review:
--
-- 1) generate-program/index.ts active-program cap (MAX_ACTIVE_PROGRAMS = 3)
--    used SELECT COUNT → INSERT, leaving a race window where parallel
--    requests could each observe count=2 and all insert, ending up with
--    4-5 active programs. Adding a row-level trigger on `programs` makes
--    the cap a hard DB invariant — the edge function's pre-flight count
--    stays in place for fail-fast UX (saves the Anthropic call), but the
--    trigger is the guarantee.
--
-- 2) estimate-nutrition overflow mode (OVERFLOW_DAILY_LIMIT = 1) used the
--    same SELECT COUNT → INSERT pattern. Solution: extend the
--    ai_generation_calls.kind CHECK to include 'overflow' so the existing
--    insert-first/count/delete-if-over pattern (PR-A5) covers it.

-- ── 1) Active-program cap trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_user_active_programs_cap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  -- Only count user-created (is_fixed = false) programs against the cap.
  -- The is_fixed seed programs are unlimited.
  IF NEW.is_fixed THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)
    INTO v_active_count
    FROM public.programs
   WHERE user_id = NEW.user_id
     AND is_fixed = false;

  IF v_active_count >= 3 THEN
    RAISE EXCEPTION 'active_programs_cap_reached'
      USING HINT = 'Maximum 3 active user programs per account.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS programs_enforce_active_cap ON public.programs;
CREATE TRIGGER programs_enforce_active_cap
  BEFORE INSERT ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_active_programs_cap();

COMMENT ON FUNCTION public.enforce_user_active_programs_cap IS
  'Hard DB invariant for the 3-active-programs-per-user cap. Protects against race conditions in the edge function''s pre-flight count. Note: this trigger fires for ALL inserts including service_role, so manual admin inserts of user programs (is_fixed=false) are also capped — by design, the cap is a data invariant, not a UI concern.';

-- ── 2) Extend ai_generation_calls.kind to cover 'overflow' ───────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'ai_generation_calls_kind_check'
      AND n.nspname = 'public'
      AND t.relname = 'ai_generation_calls'
  ) THEN
    ALTER TABLE public.ai_generation_calls
      DROP CONSTRAINT ai_generation_calls_kind_check;
  END IF;

  ALTER TABLE public.ai_generation_calls
    ADD CONSTRAINT ai_generation_calls_kind_check
      CHECK (kind IN ('session', 'program', 'overflow'));
END $$;

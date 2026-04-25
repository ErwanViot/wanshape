-- Atomic rate-limit tracking for generate-session and generate-program edge
-- functions. The previous SELECT COUNT → INSERT pattern leaves a race window
-- when several requests arrive in parallel: each can observe a pre-increment
-- count and slip past the limit. With this table the edge function inserts
-- first, counts including its own row, and deletes if it ends up over quota
-- — same pattern as estimate-nutrition / ai_text_calls.

CREATE TABLE IF NOT EXISTS public.ai_generation_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'ai_generation_calls_kind_check'
      AND n.nspname = 'public'
      AND t.relname = 'ai_generation_calls'
  ) THEN
    ALTER TABLE public.ai_generation_calls
      ADD CONSTRAINT ai_generation_calls_kind_check CHECK (kind IN ('session', 'program'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ai_generation_calls_user_kind_created_idx
  ON public.ai_generation_calls (user_id, kind, created_at DESC);

ALTER TABLE public.ai_generation_calls ENABLE ROW LEVEL SECURITY;

-- No user-facing policies; only the service role (used by edge functions)
-- inserts/reads/deletes. RLS without policies blocks anon + authenticated.

COMMENT ON TABLE public.ai_generation_calls IS
  'Tracks AI generation calls (custom session, custom program) for atomic rate limiting in edge functions.';

-- Enable RLS on stripe_webhook_events (service-role only, no user-facing policies)
ALTER TABLE IF EXISTS stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop unused organizations table to reduce attack surface
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Add display_name length constraint
ALTER TABLE public.profiles ADD CONSTRAINT display_name_length CHECK (length(display_name) <= 100);

-- Add custom_session_id FK on session_completions
ALTER TABLE public.session_completions
  ADD COLUMN IF NOT EXISTS custom_session_id uuid REFERENCES public.custom_sessions(id) ON DELETE SET NULL;

-- Index for completion lookups by program_session_id
CREATE INDEX IF NOT EXISTS idx_completions_program_session
  ON public.session_completions(program_session_id)
  WHERE program_session_id IS NOT NULL;

-- Index for completion lookups by custom_session_id
CREATE INDEX IF NOT EXISTS idx_completions_custom_session
  ON public.session_completions(custom_session_id)
  WHERE custom_session_id IS NOT NULL;

-- Prevent multiple active subscriptions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_sub_per_user
  ON public.subscriptions(user_id)
  WHERE status IN ('active', 'trialing');

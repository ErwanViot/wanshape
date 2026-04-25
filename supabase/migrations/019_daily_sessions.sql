-- Migrate daily session content from static `public/sessions/*.json` files
-- to Supabase. The PWA used to fetch /sessions/<YYYYMMDD>.json from the bundle;
-- after this migration, useSession queries this table by (date_key, locale).
--
-- Schema:
--   date_key   YYYYMMDD string, matches session_completions.session_date
--   locale     'fr' | 'en' — bilingual content from PR 5b
--   session_data  the same JSON shape as the static files
--
-- RLS:
--   SELECT is public (no auth required) — daily sessions are free, accessible
--     to anonymous visitors landing on Home.
--   INSERT / UPDATE / DELETE are restricted to the service role
--     (admin scripts and the generate-session skill).

CREATE TABLE IF NOT EXISTS public.daily_sessions (
  date_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (date_key, locale)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'daily_sessions_locale_check'
      AND n.nspname = 'public'
      AND t.relname = 'daily_sessions'
  ) THEN
    ALTER TABLE public.daily_sessions
      ADD CONSTRAINT daily_sessions_locale_check CHECK (locale IN ('fr', 'en'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'daily_sessions_date_key_check'
      AND n.nspname = 'public'
      AND t.relname = 'daily_sessions'
  ) THEN
    ALTER TABLE public.daily_sessions
      ADD CONSTRAINT daily_sessions_date_key_check CHECK (date_key ~ '^\d{8}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS daily_sessions_date_key_idx
  ON public.daily_sessions (date_key);

CREATE OR REPLACE TRIGGER daily_sessions_updated_at
  BEFORE UPDATE ON public.daily_sessions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous + authenticated users can read every daily session.
DROP POLICY IF EXISTS "daily_sessions_public_read" ON public.daily_sessions;
CREATE POLICY "daily_sessions_public_read"
  ON public.daily_sessions
  FOR SELECT
  USING (true);

-- Writes happen only via the service role (migration script + generate-session
-- skill); regular auth keys cannot insert/update/delete. No RLS policy means
-- those operations are blocked under RLS for non-service roles, which is what
-- we want.

COMMENT ON TABLE public.daily_sessions IS
  'Daily workout content shown on Home and /seance/play. Replaces /public/sessions/*.json.';

COMMENT ON COLUMN public.daily_sessions.session_data IS
  'Same JSON shape as the legacy static files: title, description, focus, blocks.';

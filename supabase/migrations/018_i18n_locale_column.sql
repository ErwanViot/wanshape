-- Add `locale` column to custom_sessions and programs so AI-generated content
-- knows which language it was produced in. Existing rows are backfilled to 'fr'
-- (the app's historical default) and stay frozen in that language — no server
-- retranslation pass is performed.
--
-- The column is referenced at render time by the client but is purely
-- informational; queries / RLS / RPC behaviour are unchanged.

ALTER TABLE public.custom_sessions
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'fr';

ALTER TABLE public.custom_sessions
  ADD CONSTRAINT custom_sessions_locale_check
  CHECK (locale IN ('fr', 'en'));

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'fr';

ALTER TABLE public.programs
  ADD CONSTRAINT programs_locale_check
  CHECK (locale IN ('fr', 'en'));

COMMENT ON COLUMN public.custom_sessions.locale IS
  'Language the session_data was generated in. Pre-i18n rows are ''fr''.';

COMMENT ON COLUMN public.programs.locale IS
  'Language the program content was generated in. Fixed programs and pre-i18n rows are ''fr''.';

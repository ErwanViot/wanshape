-- Phase 6: CGU re-validation tracking
--
-- Adds a column to profiles to record which CGU version the user has accepted.
-- When the current version constant in the app is bumped (src/config/legal.ts),
-- existing users see a blocking modal at login until they accept the new
-- version. This handles the RGPD obligation to re-inform users when the
-- processing finalities change substantially (nutrition tracking triggers it).

alter table public.profiles
  add column if not exists cgu_version_accepted text;

-- All existing rows get NULL → the client will treat them as needing re-validation.
-- No backfill: forcing the prompt is the desired behaviour for this release.

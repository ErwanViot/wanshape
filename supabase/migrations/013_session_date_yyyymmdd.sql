-- Migrate session_date from DDMMYYYY to YYYYMMDD format
-- Old format: 17032026 (DD=17, MM=03, YYYY=2026)
-- New format: 20260317 (YYYY=2026, MM=03, DD=17)
UPDATE session_completions
SET session_date = substring(session_date from 5 for 4)
                || substring(session_date from 3 for 2)
                || substring(session_date from 1 for 2)
WHERE session_date IS NOT NULL
  AND length(session_date) = 8
  AND substring(session_date from 5 for 4)::int > 2000;

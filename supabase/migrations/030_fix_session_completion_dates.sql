-- Data fix: daily sessions generated from 2026-06-06 onwards carried
-- session_data.date in DDMMYYYY (the generate-session skill reference was
-- wrong), and EndScreen copies that field verbatim into
-- session_completions.session_date, which the app reads as YYYYMMDD
-- (history, week dots, nutrition day). Rewrite the affected rows.
--
-- Safe/idempotent: only touches 8-digit values that cannot be a YYYYMMDD date
-- of this century (they don't start with '20'), and only when the swapped
-- value is a valid calendar date.
UPDATE public.session_completions
   SET session_date = substr(session_date, 5, 4) || substr(session_date, 3, 2) || substr(session_date, 1, 2)
 WHERE session_date ~ '^\d{8}$'
   AND session_date NOT LIKE '20%'
   AND substr(session_date, 5, 4) LIKE '20%'
   AND substr(session_date, 3, 2)::int BETWEEN 1 AND 12
   AND substr(session_date, 1, 2)::int BETWEEN 1 AND 31;

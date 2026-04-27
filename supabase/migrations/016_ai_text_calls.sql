-- Phase 5: server-side rate-limit table for the estimate-nutrition text mode.
--
-- The original approach counted `meal_logs.source='ai_text'` rows to enforce
-- the 30/24h cap, but that count happens before the client confirms the meal,
-- opening a concurrent-request race where 30 parallel calls all observe 0 and
-- consume Anthropic tokens without ever persisting a meal. We therefore insert
-- an atomic tracking row from the edge function *before* calling Anthropic.

create table if not exists public.ai_text_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.ai_text_calls enable row level security;

-- No client policies: writes + reads restricted to service_role.

create index if not exists idx_ai_text_calls_user_created
  on public.ai_text_calls (user_id, created_at desc);

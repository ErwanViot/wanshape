-- Phase 5: overflow insights (premium AI daily analysis)
--
-- Stores the "débordement intelligent" — an AI-generated paragraph + bullet list
-- analyzing the user's day against their target and suggesting remaining intake.
-- Separate from meal_logs because an insight is not a meal (calories=0) and we
-- don't want it to pollute the meal feed.

create table if not exists public.nutrition_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date text not null check (logged_date ~ '^[0-9]{8}$'),
  summary text not null check (char_length(summary) between 1 and 2000),
  suggestions jsonb not null default '[]'::jsonb,
  ai_metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.nutrition_insights enable row level security;

create policy "Users can manage their own nutrition insights"
  on public.nutrition_insights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- One insight per user/date (keep the most recent via upsert on conflict)
create unique index if not exists idx_nutrition_insights_user_date_unique
  on public.nutrition_insights (user_id, logged_date);

-- Rate-limit scans (most recent 24h)
create index if not exists idx_nutrition_insights_user_created
  on public.nutrition_insights (user_id, created_at desc);

-- Phase 5: Nutrition tracking (calorie logging + CIQUAL reference food database)
--
-- Privacy-by-design note:
--   We deliberately do NOT store morphological data (age, height, weight, sex).
--   The ephemeral onboarding form computes a target calorie number client-side
--   (Mifflin-St Jeor) and only that integer is persisted in nutrition_profiles.

-- Required extension for fuzzy French food search (food_reference.name_fr)
create extension if not exists pg_trgm;

-- =====================================================================
-- nutrition_profiles — 1-1 with auth.users, OPTIONAL
-- =====================================================================
create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_calories integer check (target_calories is null or target_calories between 800 and 6000),
  target_protein_g integer check (target_protein_g is null or target_protein_g between 0 and 600),
  target_carbs_g integer check (target_carbs_g is null or target_carbs_g between 0 and 1000),
  target_fat_g integer check (target_fat_g is null or target_fat_g between 0 and 400),
  goal text check (goal is null or goal in ('loss', 'maintenance', 'gain')),
  activity_level text check (activity_level is null or activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;

create policy "Users can manage their own nutrition profile"
  on public.nutrition_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace function public.nutrition_profiles_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_nutrition_profiles_updated_at
  before update on public.nutrition_profiles
  for each row execute function public.nutrition_profiles_set_updated_at();

-- =====================================================================
-- meal_logs — journal of meals per user
-- =====================================================================
-- Convention logged_date: text YYYYMMDD (aligned with session_completions.session_date,
-- cf. migration 013). Client is responsible for computing the user's LOCAL date
-- (never toISOString which is UTC). This avoids timezone drift for users outside
-- UTC±1h (e.g. a 23h dinner in Paris would otherwise land on the next day).
--
-- Idempotency: duplicate submissions (double-click / network retry) are prevented
-- client-side via inflightRef pattern (see hooks/useGenerateSession.ts). Same
-- approach as session_completions and custom_sessions; no DB-level constraint.
--
-- source enum: 'ai_text' and 'overflow_insight' are declared upfront to avoid an
-- ALTER TABLE in the PR that introduces the estimate-nutrition edge function.
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_date text not null check (logged_date ~ '^[0-9]{8}$'),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snack', 'dinner', 'extra')),
  source text not null check (source in ('manual', 'ciqual', 'barcode', 'ai_text', 'overflow_insight')),
  name text not null check (char_length(name) between 1 and 200),
  calories numeric(7, 2) not null check (calories >= 0 and calories <= 10000),
  protein_g numeric(6, 2) check (protein_g is null or (protein_g >= 0 and protein_g <= 1000)),
  carbs_g numeric(6, 2) check (carbs_g is null or (carbs_g >= 0 and carbs_g <= 1000)),
  fat_g numeric(6, 2) check (fat_g is null or (fat_g >= 0 and fat_g <= 1000)),
  quantity_grams numeric(7, 2) check (quantity_grams is null or (quantity_grams > 0 and quantity_grams <= 10000)),
  reference_id text,
  ai_metadata jsonb,
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now()
);

alter table public.meal_logs enable row level security;

create policy "Users can manage their own meal logs"
  on public.meal_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Daily aggregation + history
create index if not exists idx_meal_logs_user_date
  on public.meal_logs (user_id, logged_date desc);

-- AI rate-limit scans (ai_metadata is not null AND created_at in last 24h)
create index if not exists idx_meal_logs_user_ai_created
  on public.meal_logs (user_id, created_at desc)
  where ai_metadata is not null;

-- =====================================================================
-- food_reference — CIQUAL (ANSES) public dataset, read-only
-- =====================================================================
-- Writes (insert/update/delete) are restricted to service_role only.
-- The seed is performed out-of-band by scripts/seed-food-reference.ts (PR 2)
-- using SUPABASE_SERVICE_ROLE_KEY. No INSERT/UPDATE/DELETE policy is declared
-- on purpose: RLS enabled + no policy = service_role only can write.
create table if not exists public.food_reference (
  id text primary key,
  name_fr text not null,
  group_fr text,
  calories_100g numeric(6, 2),
  protein_100g numeric(5, 2),
  carbs_100g numeric(5, 2),
  fat_100g numeric(5, 2),
  fiber_100g numeric(5, 2),
  source text not null default 'ciqual'
);

alter table public.food_reference enable row level security;

-- Public dataset, read-only for any authenticated user
create policy "Authenticated users can read food reference"
  on public.food_reference
  for select
  to authenticated
  using (true);

-- Fuzzy search French food names with trigram index
create index if not exists idx_food_reference_name_trgm
  on public.food_reference using gin (name_fr gin_trgm_ops);

-- Exact-match / group filter fallback
create index if not exists idx_food_reference_group
  on public.food_reference (group_fr);

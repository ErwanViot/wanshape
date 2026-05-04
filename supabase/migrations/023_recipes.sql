-- Recipes & favorites — Wan2Fit nutrition library.
--
-- The recipes table is keyed by (recipe_key, locale): one row per recipe per
-- locale. PR 3 ships the FR seed (49 recipes); PR 4 will add the EN translation
-- by inserting parallel rows with the same recipe_key and locale='en'.
--
-- Recipes are public content (no auth required) — RLS allows SELECT to both
-- anon and authenticated roles when is_published = TRUE. Writes are reserved
-- to the service_role used by the seed script.
--
-- recipe_favorites is per-user and references recipe_key only (locale-agnostic):
-- a user favorites a recipe, not its FR or EN translation.

create table if not exists public.recipes (
  recipe_key text not null,
  locale text not null,
  slug text not null,
  category text not null,
  name text not null,
  description text not null,
  prep_time_min integer,
  difficulty text,
  servings integer not null default 1,
  nutrition jsonb not null,
  ingredients jsonb not null,
  steps jsonb not null,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipes_locale_check check (locale in ('fr', 'en')),
  constraint recipes_category_check check (
    category in ('pre', 'post', 'breakfast', 'recovery', 'snack', 'main', 'dessert', 'base')
  ),
  constraint recipes_difficulty_check check (
    difficulty is null or difficulty in ('facile', 'moyen', 'difficile')
  ),
  constraint recipes_servings_positive check (servings >= 1),
  constraint recipes_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  primary key (recipe_key, locale),
  unique (locale, slug)
);

-- Listings filter on (locale, is_published); partial index keeps it tight.
create index if not exists idx_recipes_published_locale
  on public.recipes (locale, is_published)
  where is_published = true;

create index if not exists idx_recipes_category_locale
  on public.recipes (locale, category);

-- Tag filter UI uses array-contains; GIN keeps it cheap on 50+ recipes.
create index if not exists idx_recipes_tags_gin
  on public.recipes using gin (tags);

alter table public.recipes enable row level security;

-- Public dataset, read-only for any visitor (anon) or member.
-- Reuses the same "anon + authenticated" RLS shape as our SEO contract.
create policy "Anyone can read published recipes"
  on public.recipes
  for select
  to anon, authenticated
  using (is_published = true);

-- No insert/update/delete policy → service_role only (used by seed-recipes.ts).

create trigger recipes_updated_at
  before update on public.recipes
  for each row execute procedure public.update_updated_at();

-- Recipe favorites — per-user bookmarks. recipe_key is the locale-agnostic
-- identifier so favoriting persists across locale toggles.
--
-- We deliberately DO NOT declare a FK on recipe_key. The natural target would
-- be recipes(recipe_key) but recipes has a composite PK (recipe_key, locale)
-- so a plain FK isn't possible without locale leakage. Since the catalogue is
-- service_role-only and recipes are never deleted in this schema (is_published
-- toggles instead), the integrity risk is bounded; favourites pointing at an
-- unpublished recipe are silently filtered by the SELECT-side join in PR 4.
create table if not exists public.recipe_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_key)
);

create index if not exists idx_recipe_favorites_user_created
  on public.recipe_favorites (user_id, created_at desc);

alter table public.recipe_favorites enable row level security;

create policy "Users manage their own recipe favorites"
  on public.recipe_favorites
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

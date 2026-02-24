-- Phase 2: session completions, programs & program sessions

-- Table: session_completions (historique de complétion)
create table public.session_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date text,
  program_session_id uuid,
  completed_at timestamptz default now() not null,
  duration_seconds integer,
  amrap_rounds integer,
  metadata jsonb default '{}'
);
alter table public.session_completions enable row level security;
create policy "own completions" on session_completions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index idx_completions_user on session_completions(user_id, completed_at desc);

-- Table: programs (programmes fixes)
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  goals text[],
  duration_weeks integer not null,
  frequency_per_week integer not null,
  fitness_level text not null check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  is_fixed boolean default false,
  created_at timestamptz default now() not null
);
alter table public.programs enable row level security;
create policy "read fixed programs" on programs
  for select using (is_fixed = true);

-- Table: program_sessions (séances d'un programme)
create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  session_order integer not null,
  week_number integer not null,
  session_data jsonb not null,
  created_at timestamptz default now() not null,
  unique(program_id, session_order)
);
alter table public.program_sessions enable row level security;
create policy "read fixed program sessions" on program_sessions
  for select using (
    exists (select 1 from programs where id = program_id and is_fixed = true)
  );

-- Add FK on session_completions now that program_sessions exists
alter table public.session_completions
  add constraint fk_completions_program_session
  foreign key (program_session_id) references program_sessions(id);

-- Seed: 3 fixed programs
insert into programs (slug, title, description, goals, duration_weeks, frequency_per_week, fitness_level, is_fixed)
values
  ('debutant-4-semaines', 'Débutant 4 semaines', 'Programme progressif pour démarrer le sport en douceur', array['Découvrir les exercices de base', 'Construire une routine', 'Améliorer la mobilité'], 4, 3, 'beginner', true),
  ('remise-en-forme', 'Remise en forme', 'Programme complet cardio et renforcement musculaire', array['Retrouver la forme', 'Brûler des calories', 'Renforcer tout le corps'], 4, 4, 'intermediate', true),
  ('cardio-express', 'Cardio Express', 'Sessions courtes et intenses HIIT et Tabata', array['Améliorer le cardio', 'Maximiser le temps', 'Repousser ses limites'], 4, 3, 'intermediate', true);

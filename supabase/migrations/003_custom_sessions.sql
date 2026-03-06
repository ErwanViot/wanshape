-- Custom AI-generated sessions
create table if not exists public.custom_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('quick', 'detailed', 'expert')),
  preset text,
  duration_minutes integer not null,
  equipment text[] not null default '{}',
  intensity text,
  body_focus text[] not null default '{}',
  preferences text,
  refinement_note text,
  status text not null default 'draft' check (status in ('draft', 'confirmed')),
  session_data jsonb not null,
  input_tokens integer,
  output_tokens integer,
  model text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.custom_sessions enable row level security;

create policy "Users can manage their own custom sessions"
  on public.custom_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for rate limiting query (user + recent sessions)
create index if not exists idx_custom_sessions_user_created
  on public.custom_sessions (user_id, created_at desc);

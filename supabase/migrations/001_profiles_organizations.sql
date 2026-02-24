-- Phase 1: profiles & organizations schema

create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now() not null
);
alter table public.organizations enable row level security;

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.profiles enable row level security;

-- RLS: users can only access their own profile
create policy "select own" on profiles for select using (auth.uid() = id);
create policy "insert own" on profiles for insert with check (auth.uid() = id);
create policy "update own" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profile changes
create function public.update_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at();

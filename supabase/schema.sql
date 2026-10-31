-- Du Lạc behaviour tracking. Run once in Supabase → SQL Editor.
create table if not exists public.events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  player_id text not null,
  event text not null,
  location_id text,
  props jsonb not null default '{}'::jsonb
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_event_idx on public.events (event);
create index if not exists events_session_idx on public.events (session_id);

-- RLS on with no policies: only the service role key (used by /api) can read or write.
alter table public.events enable row level security;

-- Players who signed in with Google (id = Google account "sub").
create table if not exists public.users (
  id text primary key,
  email text,
  name text,
  picture text,
  email_verified boolean,
  locale text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  login_count integer not null default 1
);

create index if not exists users_created_at_idx on public.users (created_at);

alter table public.users enable row level security;

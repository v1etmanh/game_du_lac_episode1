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

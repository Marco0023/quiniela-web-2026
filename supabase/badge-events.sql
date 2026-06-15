create table if not exists public.badge_events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  badge_id text not null,
  event_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists badge_events_group_created_idx on public.badge_events (group_id, created_at desc);
create index if not exists badge_events_user_created_idx on public.badge_events (user_id, created_at desc);

alter table public.badge_events enable row level security;

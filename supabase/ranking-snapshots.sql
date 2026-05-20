create table if not exists public.ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  rank int not null,
  points int not null default 0,
  total_participants int not null default 0,
  created_at timestamptz not null default now(),
  unique (group_id, user_id, match_id)
);

alter table public.ranking_snapshots enable row level security;

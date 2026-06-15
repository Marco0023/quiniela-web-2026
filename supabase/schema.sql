create extension if not exists "pgcrypto";

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  alias text not null unique,
  email text not null,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  group_id uuid references public.groups(id),
  timezone_country text not null,
  timezone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  api_id text unique,
  name text not null,
  short_name text not null,
  flag_url text,
  tournament_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  api_id text unique,
  phase text not null check (
    phase in ('group_stage', 'round_of_32', 'round_of_16', 'quarter_finals', 'semi_finals', 'third_place', 'final')
  ),
  match_number int not null,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_placeholder text,
  away_placeholder text,
  kickoff_at timestamptz not null,
  tournament_group text,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'locked', 'live', 'finished', 'postponed', 'cancelled')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_results (
  match_id uuid primary key references public.matches(id) on delete cascade,
  home_score_90 int,
  away_score_90 int,
  home_score_final int,
  away_score_final int,
  winner_team_id uuid references public.teams(id),
  went_extra_time boolean,
  went_penalties boolean,
  penalty_winner_team_id uuid references public.teams(id),
  is_manual_override boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.champion_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  created_at timestamptz not null default now()
);

create table if not exists public.group_classification_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_group_id uuid not null references public.groups(id) on delete cascade,
  tournament_group text not null,
  ordered_team_ids uuid[] not null,
  points_awarded int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'scored')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tournament_group)
);

create table if not exists public.match_predictions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.groups(id),
  prediction_type text not null check (prediction_type in ('group_stage', 'knockout', 'final')),
  predicted_outcome text check (predicted_outcome in ('home', 'draw', 'away')),
  predicted_winner_team_id uuid references public.teams(id),
  predicted_home_score int,
  predicted_away_score int,
  predicts_extra_time boolean,
  predicts_penalties boolean,
  points_awarded int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'scored')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create table if not exists public.prediction_score_breakdown (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references public.match_predictions(id) on delete cascade,
  winner_points int not null default 0,
  exact_score_points int not null default 0,
  goal_difference_points int not null default 0,
  extra_time_points int not null default 0,
  penalties_points int not null default 0,
  champion_points int not null default 0,
  champion_bonus_points int not null default 0,
  total_points int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  sync_type text not null check (sync_type in ('teams', 'matches', 'results', 'full')),
  status text not null check (status in ('success', 'error', 'partial')),
  message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

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

insert into public.groups (name, invite_code)
values
  ('Familia Marquez', 'FM26'),
  ('Familia Nuñez Quiñones', 'PANTALONES26'),
  ('Mondaquera Bochinche', 'MANCOS26')
on conflict (invite_code) do nothing;

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.match_results enable row level security;
alter table public.champion_predictions enable row level security;
alter table public.group_classification_predictions enable row level security;
alter table public.match_predictions enable row level security;
alter table public.prediction_score_breakdown enable row level security;
alter table public.sync_logs enable row level security;
alter table public.ranking_snapshots enable row level security;
alter table public.badge_events enable row level security;

create or replace view public.group_rankings
with (security_invoker = true) as
select
  p.group_id,
  p.id as user_id,
  p.alias,
  (
    coalesce(sum(mp.points_awarded), 0) +
    coalesce((
      select sum(gcp.points_awarded)
      from public.group_classification_predictions gcp
      where gcp.user_id = p.id
    ), 0)
  )::int as total_points,
  rank() over (
    partition by p.group_id
    order by (
      coalesce(sum(mp.points_awarded), 0) +
      coalesce((
        select sum(gcp.points_awarded)
        from public.group_classification_predictions gcp
        where gcp.user_id = p.id
      ), 0)
    ) desc
  )::int as rank
from public.profiles p
left join public.match_predictions mp on mp.user_id = p.id
where p.role = 'participant'
group by p.group_id, p.id, p.alias;

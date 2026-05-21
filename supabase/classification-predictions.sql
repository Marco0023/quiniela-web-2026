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

alter table public.group_classification_predictions
add column if not exists points_awarded int not null default 0;

alter table public.group_classification_predictions
add column if not exists status text not null default 'pending';

alter table public.group_classification_predictions
drop constraint if exists group_classification_predictions_status_check;

alter table public.group_classification_predictions
add constraint group_classification_predictions_status_check
check (status in ('pending', 'scored'));

alter table public.group_classification_predictions enable row level security;

create index if not exists group_classification_predictions_user_idx
on public.group_classification_predictions (user_id);

create index if not exists group_classification_predictions_app_group_idx
on public.group_classification_predictions (app_group_id);

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

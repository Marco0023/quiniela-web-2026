create table if not exists public.group_classification_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_group_id uuid not null references public.groups(id) on delete cascade,
  tournament_group text not null,
  ordered_team_ids uuid[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tournament_group)
);

alter table public.group_classification_predictions enable row level security;

create index if not exists group_classification_predictions_user_idx
on public.group_classification_predictions (user_id);

create index if not exists group_classification_predictions_app_group_idx
on public.group_classification_predictions (app_group_id);

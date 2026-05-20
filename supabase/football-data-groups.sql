alter table public.teams
add column if not exists tournament_group text;

alter table public.matches
add column if not exists tournament_group text;

create index if not exists teams_tournament_group_idx
on public.teams (tournament_group);

create index if not exists matches_tournament_group_idx
on public.matches (tournament_group);

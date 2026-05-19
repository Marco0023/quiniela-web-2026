alter table public.profiles
drop constraint if exists profiles_alias_key;

drop index if exists public.profiles_group_alias_unique_idx;

create unique index if not exists profiles_group_alias_unique_idx
on public.profiles (group_id, lower(alias))
where group_id is not null;

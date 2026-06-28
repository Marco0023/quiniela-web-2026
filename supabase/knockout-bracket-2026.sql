create extension if not exists unaccent;

create or replace function pg_temp.knockout_team_id(canonical_name text, canonical_short text, aliases text[] default '{}')
returns uuid
language plpgsql
as $$
declare
  found_id uuid;
begin
  select id
    into found_id
  from public.teams
  where lower(unaccent(name)) = any (
    select lower(unaccent(alias_name))
    from unnest(array_prepend(canonical_name, aliases)) as alias_name
  )
  order by
    case when api_id like 'football-data:%' then 0 else 1 end,
    updated_at desc
  limit 1;

  if found_id is not null then
    return found_id;
  end if;

  insert into public.teams (api_id, name, short_name)
  values (
    'manual:wc2026:team:' || lower(regexp_replace(unaccent(canonical_name), '[^a-zA-Z0-9]+', '-', 'g')),
    canonical_name,
    canonical_short
  )
  on conflict (api_id) do update
    set name = excluded.name,
        short_name = excluded.short_name,
        updated_at = now()
  returning id into found_id;

  return found_id;
end;
$$;

create or replace procedure pg_temp.knockout_upsert_match(
  p_match_number int,
  p_phase text,
  p_kickoff text,
  p_home_team_id uuid,
  p_away_team_id uuid,
  p_home_placeholder text,
  p_away_placeholder text
)
language plpgsql
as $$
declare
  existing_id uuid;
begin
  select id into existing_id
  from public.matches
  where match_number = p_match_number
     or api_id = 'manual:wc2026:P' || p_match_number
  order by case when api_id = 'manual:wc2026:P' || p_match_number then 0 else 1 end
  limit 1;

  if existing_id is null then
    insert into public.matches (
      api_id,
      phase,
      match_number,
      home_team_id,
      away_team_id,
      home_placeholder,
      away_placeholder,
      kickoff_at,
      status,
      updated_at
    )
    values (
      'manual:wc2026:P' || p_match_number,
      p_phase,
      p_match_number,
      p_home_team_id,
      p_away_team_id,
      p_home_placeholder,
      p_away_placeholder,
      (p_kickoff::timestamp at time zone 'America/Bogota'),
      'scheduled',
      now()
    );
  else
    update public.matches
    set api_id = 'manual:wc2026:P' || p_match_number,
        phase = p_phase,
        home_team_id = p_home_team_id,
        away_team_id = p_away_team_id,
        home_placeholder = p_home_placeholder,
        away_placeholder = p_away_placeholder,
        kickoff_at = (p_kickoff::timestamp at time zone 'America/Bogota'),
        status = case when status = 'finished' then status else 'scheduled' end,
        updated_at = now()
    where id = existing_id;
  end if;
end;
$$;

call pg_temp.knockout_upsert_match(73, 'round_of_32', '2026-06-28 14:00:00', pg_temp.knockout_team_id('Sudáfrica', 'RSA', array['Sudafrica', 'South Africa']), pg_temp.knockout_team_id('Canadá', 'CAN', array['Canada']), null, null);
call pg_temp.knockout_upsert_match(74, 'round_of_32', '2026-06-29 15:30:00', pg_temp.knockout_team_id('Alemania', 'GER', array['Germany']), pg_temp.knockout_team_id('Paraguay', 'PAR'), null, null);
call pg_temp.knockout_upsert_match(75, 'round_of_32', '2026-06-29 20:00:00', pg_temp.knockout_team_id('Países Bajos', 'NED', array['Paises Bajos', 'Netherlands']), pg_temp.knockout_team_id('Marruecos', 'MAR', array['Morocco']), null, null);
call pg_temp.knockout_upsert_match(76, 'round_of_32', '2026-06-29 12:00:00', pg_temp.knockout_team_id('Brasil', 'BRA', array['Brazil']), pg_temp.knockout_team_id('Japón', 'JPN', array['Japon', 'Japan']), null, null);
call pg_temp.knockout_upsert_match(77, 'round_of_32', '2026-06-30 16:00:00', pg_temp.knockout_team_id('Francia', 'FRA', array['France']), pg_temp.knockout_team_id('Suecia', 'SWE', array['Sweden']), null, null);
call pg_temp.knockout_upsert_match(78, 'round_of_32', '2026-06-30 12:00:00', pg_temp.knockout_team_id('Costa de Marfil', 'CIV', array['Ivory Coast']), pg_temp.knockout_team_id('Noruega', 'NOR', array['Norway']), null, null);
call pg_temp.knockout_upsert_match(79, 'round_of_32', '2026-06-30 20:00:00', pg_temp.knockout_team_id('México', 'MEX', array['Mexico']), pg_temp.knockout_team_id('Ecuador', 'ECU'), null, null);
call pg_temp.knockout_upsert_match(80, 'round_of_32', '2026-07-01 11:00:00', pg_temp.knockout_team_id('Inglaterra', 'ENG', array['England']), pg_temp.knockout_team_id('RD Congo', 'COD', array['Congo DR', 'DR Congo']), null, null);
call pg_temp.knockout_upsert_match(81, 'round_of_32', '2026-07-01 19:00:00', pg_temp.knockout_team_id('Estados Unidos', 'USA', array['EE. UU.', 'USA', 'United States']), pg_temp.knockout_team_id('Bosnia-Herzegovina', 'BIH', array['Bosnia y Herzegovina', 'Bosnia and Herzegovina']), null, null);
call pg_temp.knockout_upsert_match(82, 'round_of_32', '2026-07-01 15:00:00', pg_temp.knockout_team_id('Bélgica', 'BEL', array['Belgica', 'Belgium']), pg_temp.knockout_team_id('Senegal', 'SEN'), null, null);
call pg_temp.knockout_upsert_match(83, 'round_of_32', '2026-07-02 18:00:00', pg_temp.knockout_team_id('Portugal', 'POR'), pg_temp.knockout_team_id('Croacia', 'CRO', array['Croatia']), null, null);
call pg_temp.knockout_upsert_match(84, 'round_of_32', '2026-07-02 14:00:00', pg_temp.knockout_team_id('España', 'ESP', array['Espana', 'Spain']), pg_temp.knockout_team_id('Austria', 'AUT'), null, null);
call pg_temp.knockout_upsert_match(85, 'round_of_32', '2026-07-02 22:00:00', pg_temp.knockout_team_id('Suiza', 'SUI', array['Switzerland']), pg_temp.knockout_team_id('Argelia', 'ALG', array['Algeria']), null, null);
call pg_temp.knockout_upsert_match(86, 'round_of_32', '2026-07-03 17:00:00', pg_temp.knockout_team_id('Argentina', 'ARG'), pg_temp.knockout_team_id('Cabo Verde', 'CPV', array['Cape Verde Islands', 'Islas de Cabo Verde']), null, null);
call pg_temp.knockout_upsert_match(87, 'round_of_32', '2026-07-03 20:30:00', pg_temp.knockout_team_id('Colombia', 'COL'), pg_temp.knockout_team_id('Ghana', 'GHA'), null, null);
call pg_temp.knockout_upsert_match(88, 'round_of_32', '2026-07-03 13:00:00', pg_temp.knockout_team_id('Australia', 'AUS'), pg_temp.knockout_team_id('Egipto', 'EGY', array['Egypt']), null, null);

call pg_temp.knockout_upsert_match(89, 'round_of_16', '2026-07-04 16:00:00', null, null, 'W74', 'W77');
call pg_temp.knockout_upsert_match(90, 'round_of_16', '2026-07-04 12:00:00', null, null, 'W73', 'W75');
call pg_temp.knockout_upsert_match(91, 'round_of_16', '2026-07-05 15:00:00', null, null, 'W76', 'W78');
call pg_temp.knockout_upsert_match(92, 'round_of_16', '2026-07-05 19:00:00', null, null, 'W79', 'W80');
call pg_temp.knockout_upsert_match(93, 'round_of_16', '2026-07-06 14:00:00', null, null, 'W83', 'W84');
call pg_temp.knockout_upsert_match(94, 'round_of_16', '2026-07-06 19:00:00', null, null, 'W81', 'W82');
call pg_temp.knockout_upsert_match(95, 'round_of_16', '2026-07-07 11:00:00', null, null, 'W86', 'W88');
call pg_temp.knockout_upsert_match(96, 'round_of_16', '2026-07-07 15:00:00', null, null, 'W85', 'W87');
call pg_temp.knockout_upsert_match(97, 'quarter_finals', '2026-07-09 15:00:00', null, null, 'W89', 'W90');
call pg_temp.knockout_upsert_match(98, 'quarter_finals', '2026-07-10 14:00:00', null, null, 'W93', 'W94');
call pg_temp.knockout_upsert_match(99, 'quarter_finals', '2026-07-11 16:00:00', null, null, 'W91', 'W92');
call pg_temp.knockout_upsert_match(100, 'quarter_finals', '2026-07-11 20:00:00', null, null, 'W95', 'W96');
call pg_temp.knockout_upsert_match(101, 'semi_finals', '2026-07-14 14:00:00', null, null, 'W97', 'W98');
call pg_temp.knockout_upsert_match(102, 'semi_finals', '2026-07-15 14:00:00', null, null, 'W99', 'W100');
call pg_temp.knockout_upsert_match(103, 'third_place', '2026-07-18 16:00:00', null, null, 'L101', 'L102');
call pg_temp.knockout_upsert_match(104, 'final', '2026-07-19 14:00:00', null, null, 'W101', 'W102');

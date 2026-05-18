insert into public.teams (id, api_id, name, short_name, flag_url)
values
  ('00000000-0000-0000-0000-000000000001', 'mock_arg', 'Argentina', 'ARG', 'https://flagcdn.com/w80/ar.png'),
  ('00000000-0000-0000-0000-000000000002', 'mock_bra', 'Brasil', 'BRA', 'https://flagcdn.com/w80/br.png'),
  ('00000000-0000-0000-0000-000000000003', 'mock_col', 'Colombia', 'COL', 'https://flagcdn.com/w80/co.png'),
  ('00000000-0000-0000-0000-000000000004', 'mock_mex', 'Mexico', 'MEX', 'https://flagcdn.com/w80/mx.png'),
  ('00000000-0000-0000-0000-000000000005', 'mock_usa', 'Estados Unidos', 'USA', 'https://flagcdn.com/w80/us.png'),
  ('00000000-0000-0000-0000-000000000006', 'mock_esp', 'Espana', 'ESP', 'https://flagcdn.com/w80/es.png'),
  ('00000000-0000-0000-0000-000000000007', 'mock_fra', 'Francia', 'FRA', 'https://flagcdn.com/w80/fr.png'),
  ('00000000-0000-0000-0000-000000000008', 'mock_eng', 'Inglaterra', 'ENG', 'https://flagcdn.com/w80/gb-eng.png')
on conflict (id) do update set
  api_id = excluded.api_id,
  name = excluded.name,
  short_name = excluded.short_name,
  flag_url = excluded.flag_url,
  updated_at = now();

insert into public.matches (
  id,
  api_id,
  phase,
  match_number,
  home_team_id,
  away_team_id,
  kickoff_at,
  status
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'mock_m1',
    'group_stage',
    1,
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '2026-06-11T19:00:00.000Z',
    'scheduled'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'mock_m2',
    'group_stage',
    2,
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    '2026-06-12T00:00:00.000Z',
    'scheduled'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'mock_m3',
    'group_stage',
    3,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006',
    '2026-06-13T22:00:00.000Z',
    'scheduled'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'mock_m73',
    'round_of_32',
    73,
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    '2026-06-28T20:00:00.000Z',
    'scheduled'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'mock_m104',
    'final',
    104,
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000007',
    '2026-07-19T22:00:00.000Z',
    'scheduled'
  )
on conflict (id) do update set
  api_id = excluded.api_id,
  phase = excluded.phase,
  match_number = excluded.match_number,
  home_team_id = excluded.home_team_id,
  away_team_id = excluded.away_team_id,
  kickoff_at = excluded.kickoff_at,
  status = excluded.status,
  updated_at = now();

insert into public.match_results (match_id)
select id from public.matches
where id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
)
on conflict (match_id) do nothing;

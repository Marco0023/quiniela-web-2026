-- Limpia datos importados por API-FOOTBALL/API-SPORTS para poder probar otro proveedor.
-- Conserva usuarios, grupos, equipos demo `mock_*` y futuros registros `football-data:*`.
-- Ojo: al borrar partidos también se borran predicciones asociadas por `on delete cascade`.

delete from public.matches
where api_id is not null
  and api_id not like 'mock_%'
  and api_id not like 'football-data:%';

delete from public.teams
where api_id is not null
  and api_id not like 'mock_%'
  and api_id not like 'football-data:%'
  and id not in (
    select home_team_id from public.matches where home_team_id is not null
    union
    select away_team_id from public.matches where away_team_id is not null
    union
    select team_id from public.champion_predictions
    union
    select predicted_winner_team_id from public.match_predictions where predicted_winner_team_id is not null
    union
    select winner_team_id from public.match_results where winner_team_id is not null
    union
    select penalty_winner_team_id from public.match_results where penalty_winner_team_id is not null
  );

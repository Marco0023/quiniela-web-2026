-- Limpia los partidos demo creados con el seed inicial.
-- Conserva usuarios, grupos, equipos, campeones elegidos y datos importados por football-data.org.
-- Nota: las predicciones hechas sobre estos partidos demo se borran por cascada.

delete from public.matches
where api_id like 'mock_%';

delete from public.teams
where api_id like 'mock_%'
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

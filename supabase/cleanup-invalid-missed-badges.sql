delete from public.badge_events event
where event.badge_id = 'missed_three_predictions'
  and event.match_id is not null
  and exists (
    select 1
    from public.match_predictions prediction
    where prediction.match_id = event.match_id
      and prediction.user_id = event.user_id
  );

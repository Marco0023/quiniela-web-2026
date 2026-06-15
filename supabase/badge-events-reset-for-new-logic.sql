delete from public.badge_events
where badge_id in (
  'five_correct_streak',
  'two_exact_streak',
  'exact_score',
  'three_exact_streak',
  'cold_streak',
  'missed_three_predictions',
  'failed_round',
  'two_unique_exact_round',
  'goal_difference_only',
  'two_goal_difference_hits',
  'underdog_pick'
);

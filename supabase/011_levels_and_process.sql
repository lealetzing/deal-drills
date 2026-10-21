-- 011: Drill levels, Sprint ranked by time, three Deal Process games.
-- Sprint boards (drill_sprint = medium, _easy, _hard): the browser sends the number of wrong answers;
-- score = server time + 20 s per wrong answer, lower is better. Old Sprint scores (count of correct answers) are removed.
delete from public.scores where board = 'drill_sprint';

insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better) values
  ('drill_sprint',       'Drills · Sprint · Medium (10 questions)', 25000, 3600000, 0, 10,    0, false, 10, true, 20000, true),
  ('drill_sprint_easy',  'Drills · Sprint · Easy (10 questions)',   20000, 3600000, 0, 10,    0, false, 11, true, 20000, true),
  ('drill_sprint_hard',  'Drills · Sprint · Hard (10 questions)',   30000, 3600000, 0, 10,    0, false, 12, true, 20000, true),
  ('drill_timed',        'Drills · 3 minutes · Medium',            178000,  240000, 0, 60, 3000, false, 20, false, 0, false),
  ('drill_timed_easy',   'Drills · 3 minutes · Easy',              178000,  240000, 0, 80, 2200, false, 21, false, 0, false),
  ('drill_timed_hard',   'Drills · 3 minutes · Hard',              178000,  240000, 0, 40, 4000, false, 22, false, 0, false),
  ('game_process_sell',  'Deal Process · Sell-side',                 8000, 1800000, 0, 40,    0, false, 55, true, 5000, true),
  ('game_process_buy',   'Deal Process · Buy-side',                  8000, 1800000, 0, 40,    0, false, 56, true, 5000, true),
  ('game_process_wpug',  'Deal Process · WpÜG',                      7000, 1800000, 0, 40,    0, false, 57, true, 5000, true)
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, ms_per_point = excluded.ms_per_point,
  time_tiebreak = excluded.time_tiebreak, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

-- Deal Drills update 008: leaderboards for the Deal Process and Paper LBO Sprint games (stopwatch boards).
insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better) values
  ('game_process', 'Deal Process · 3 rounds',   20000, 1800000, 0, 60, 0, false, 55, true, 5000,  true),
  ('game_lbo',     'Paper LBO Sprint · 5 LBOs', 30000, 1800000, 0, 10, 0, false, 56, true, 10000, true)
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

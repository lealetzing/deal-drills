-- 012: five quick-fire games and Balance the Books tests 11–20 (stopwatch boards: time + penalty per mistake, lower is better).
insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better) values
  ('game_market',    'Market Reaction · 12 cards', 10000, 1800000, 0, 12, 0, false, 60, true, 5000, true),
  ('game_excel',     'Excel Sprint · 12 cards',    10000, 1800000, 0, 12, 0, false, 61, true, 5000, true),
  ('game_updown',    'Up or Down · 15 cards',      10000, 1800000, 0, 15, 0, false, 62, true, 5000, true),
  ('game_multiples', 'Multiple Match · 10 cards',   8000, 1800000, 0, 10, 0, false, 63, true, 5000, true),
  ('game_mental',    'Mental Maths · 15 sums',     15000, 1800000, 0, 15, 0, false, 64, true, 5000, true)
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, ms_per_point = excluded.ms_per_point,
  time_tiebreak = excluded.time_tiebreak, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better)
select 'game_ledger_' || lv || '_' || n, 'Balance the Books · ' || initcap(lv) || ' test ' || n,
       min_ms, 3600000, 0, 5, 0, false, 100 + o * 30 + n, true, 15000, true
  from (values ('easy', 12000, 0), ('medium', 18000, 1), ('hard', 22000, 2)) as v(lv, min_ms, o)
 cross join generate_series(11, 20) as n
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

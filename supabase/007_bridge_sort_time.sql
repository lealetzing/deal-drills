-- Deal Drills update 007: Bridge Sort becomes a stopwatch game (15 items, both directions, +5 s per mistake).
-- Score = server-measured time + 5 s per mistake; lower is better. Old points-based results are removed.
update public.boards
   set name = 'Bridge Sort · 15 items', min_ms = 15000, max_ms = 900000, min_score = 0, max_score = 15,
       ms_per_point = 0, time_tiebreak = false, time_score = true, penalty_ms = 5000, lower_better = true
 where id = 'game_bs';
delete from public.scores where board = 'game_bs';

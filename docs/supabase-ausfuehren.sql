-- In Supabase: SQL Editor → New query → alles einfügen → Run. Enthält 010, 011, 012 und 013. Nur EINMAL ausführen (011 löscht die alten Sprint-Ergebnisse).

-- ===================== 010_accuracy_compare =====================
-- 010: accuracy next to time. For stopwatch boards, mistakes = (score - time_ms) / penalty_ms of each player's best run.
create or replace function public.board_compare(p_board text) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'avg_ms',  (select avg(score) from public.scores where board = p_board and period = 'all'),
    'avg_time_ms', (select avg(time_ms) from public.scores where board = p_board and period = 'all'),
    'avg_mistakes', (select avg((s.score - s.time_ms)::numeric / b.penalty_ms)
                       from public.scores s join public.boards b on b.id = s.board
                      where s.board = p_board and s.period = 'all' and b.time_score and b.penalty_ms > 0 and s.time_ms is not null),
    'players', (select count(*) from public.scores where board = p_board and period = 'all'),
    'friends', coalesce((select jsonb_agg(jsonb_build_object('display_name', p.display_name, 'score', s.score,
                    'mistakes', case when b.time_score and b.penalty_ms > 0 and s.time_ms is not null
                                     then round((s.score - s.time_ms)::numeric / b.penalty_ms) end) order by s.score)
                  from public.friends fr
                  join public.scores s on s.user_id = fr.friend_id and s.board = p_board and s.period = 'all'
                  join public.boards b on b.id = s.board
                  join public.profiles p on p.id = fr.friend_id
                 where fr.user_id = auth.uid()), '[]'::jsonb))
$$;
revoke all on function public.board_compare(text) from public, anon;
grant execute on function public.board_compare(text) to authenticated;

-- ===================== 011_levels_and_process =====================
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

-- ===================== 012_more_games =====================
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


-- ===================== 013_retention =====================
-- 013: automatic deletion (data retention). Runs every night at 03:15 UTC inside Supabase (pg_cron).
-- Feedback after 180 days, password help requests after 30 days, finished/abandoned ranked runs after 90 days
-- (best scores stay on the leaderboards), reports after 365 days.
create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.purge_old_data() returns void
language sql security definer set search_path = '' as $$
  delete from public.feedback          where created_at < now() - interval '180 days';
  delete from public.reset_requests    where created_at < now() - interval '30 days';
  delete from public.runs              where started_at < now() - interval '90 days';
  delete from public.interview_reports where created_at < now() - interval '365 days';
$$;
revoke all on function public.purge_old_data() from public, anon, authenticated;

select cron.schedule('deal-drills-retention', '15 3 * * *', 'select public.purge_old_data()');

-- Check: the job should be listed.
select jobname, schedule, active from cron.job where jobname = 'deal-drills-retention';

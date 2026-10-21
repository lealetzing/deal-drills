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

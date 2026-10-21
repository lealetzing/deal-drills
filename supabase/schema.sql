-- Deal Drills database schema for Supabase (Postgres 15+).
-- Run the whole file once in Supabase → SQL Editor → New query → Run. It is safe to run again after changes:
-- tables use "if not exists", policies are dropped and recreated, seed rows are upserted.

-- =====================================================================================================
-- 1. Profiles: one row per user, created automatically on sign-up. Display name and university are
--    public because they appear on leaderboards.
-- =====================================================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 30),
  university   text check (university is null or char_length(university) <= 80),
  target_role  text check (target_role is null or target_role in ('corporate_ma','ib','pe','pc','ts','other')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles: public read" on public.profiles;
create policy "profiles: public read" on public.profiles for select using (true);
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

alter table public.profiles add column if not exists username text unique
  check (username is null or username ~ '^[a-z0-9_.-]{3,20}$');

-- New users: take the username chosen at sign-up; it is also the starting display name.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_username text := lower(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''));
begin
  if v_username is not null and v_username !~ '^[a-z0-9_.-]{3,20}$' then v_username := null; end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, coalesce(v_username, 'Analyst-' || substr(replace(new.id::text, '-', ''), 1, 5)))
  on conflict (id) do nothing;
  return new;
end $$;

-- Sign-up form: is this username free? Usernames are public anyway (they are the default display name).
create or replace function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = '' as $$
  select lower(btrim(p_username)) ~ '^[a-z0-9_.-]{3,20}$'
     and not exists (select 1 from public.profiles where username = lower(btrim(p_username)))
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Self-service account deletion (GDPR). Cascades to profile, progress, runs, scores and applications.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- =====================================================================================================
-- 2. Progress: the whole practice state (topic accuracy, flash-card boxes, sessions, game bests) as JSON.
--    Private to its owner.
-- =====================================================================================================
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  state      jsonb not null default '{}'::jsonb check (pg_column_size(state) < 262144),
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "progress: own rows" on public.progress;
create policy "progress: own rows" on public.progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- =====================================================================================================
-- 3. Leaderboards.
--    A static site cannot keep secrets, so anti-cheat lives in the database:
--      * scores cannot be written directly; only start_run() / submit_run() below write them;
--      * the server clock times every run (start_run stamps the start, submit_run the end);
--      * each board has a plausible duration window, a score range and a minimum time per point;
--      * one row per user per board per period (all-time and the current ISO week), best result kept;
--      * at most 120 runs per user per hour.
--    A determined cheater can still answer with a calculator; this stops edited requests and bots.
-- =====================================================================================================
create table if not exists public.boards (
  id            text primary key,
  name          text not null,
  min_ms        int  not null,  -- shortest plausible run
  max_ms        int  not null,  -- longest accepted run
  min_score     int  not null,
  max_score     int  not null,
  ms_per_point  int  not null default 0, -- score * ms_per_point must not exceed the run time
  time_tiebreak boolean not null default false, -- equal scores: faster run ranks higher
  sort          int  not null default 0
);
-- Stopwatch boards (time_score): the browser submits only its number of mistakes; the stored score is the
-- server-measured run time plus mistakes × penalty_ms, and lower is better.
alter table public.boards add column if not exists time_score boolean not null default false;
alter table public.boards add column if not exists penalty_ms int not null default 0;
alter table public.boards add column if not exists lower_better boolean not null default false;
alter table public.boards enable row level security;
drop policy if exists "boards: public read" on public.boards;
create policy "boards: public read" on public.boards for select using (true);

insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better) values
  ('drill_sprint',       'Deal Math · Sprint (10 questions)', 25000, 3600000,    0,  10, 2500, true,  10, false, 0, false),
  ('drill_timed',        'Deal Math · 3 minutes',            178000,  240000,    0,  60, 3000, false, 20, false, 0, false),
  ('game_ad',            'Accretive or Dilutive · 60s',       59000,  120000, -200,  90,  600, false, 40, false, 0, false),
  ('game_bs',            'Bridge Sort · 15 items',            15000,  900000,    0,  15,    0, false, 50, true, 5000, true),
  ('game_auction',       'Sealed-bid Auction · 5 rounds',     20000, 3600000, -100000, 1000, 0, false, 60, false, 0, false),
  ('game_process',       'Deal Process · 3 rounds',           20000, 1800000,    0,  60,    0, false, 55, true, 5000, true),
  ('game_lbo',           'Paper LBO Sprint · 5 LBOs',         30000, 1800000,    0,  10,    0, false, 56, true, 10000, true)
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, ms_per_point = excluded.ms_per_point,
  time_tiebreak = excluded.time_tiebreak, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

-- Balance the Books: 10 fixed tests per level, one board each (game_ledger_easy_1 … game_ledger_hard_10).
-- The browser reports only the number of wrong answers; score = server-measured time + 15s per mistake.
insert into public.boards (id, name, min_ms, max_ms, min_score, max_score, ms_per_point, time_tiebreak, sort, time_score, penalty_ms, lower_better)
select 'game_ledger_' || lv || '_' || n, 'Balance the Books · ' || initcap(lv) || ' test ' || n,
       min_ms, 3600000, 0, 5, 0, false, 100 + o * 10 + n, true, 15000, true
  from (values ('easy', 12000, 0), ('medium', 18000, 1), ('hard', 22000, 2)) as v(lv, min_ms, o)
 cross join generate_series(1, 10) as n
on conflict (id) do update set name = excluded.name, min_ms = excluded.min_ms, max_ms = excluded.max_ms,
  min_score = excluded.min_score, max_score = excluded.max_score, sort = excluded.sort, time_score = excluded.time_score,
  penalty_ms = excluded.penalty_ms, lower_better = excluded.lower_better;

create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  board       text not null references public.boards(id),
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  score       int,
  time_ms     int,
  accepted    boolean
);
create index if not exists runs_user_started on public.runs (user_id, started_at desc);
alter table public.runs enable row level security;
drop policy if exists "runs: read own" on public.runs;
create policy "runs: read own" on public.runs for select to authenticated using (user_id = (select auth.uid()));

create table if not exists public.scores (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  board      text not null references public.boards(id),
  period     text not null check (period = 'all' or period ~ '^[0-9]{4}-W[0-9]{2}$'),
  score      int  not null check (score between -100000 and 10000000),
  time_ms    int  check (time_ms is null or time_ms >= 0),
  run_id     uuid references public.runs(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, board, period)
);
create index if not exists scores_board_period on public.scores (board, period, score desc);
alter table public.scores enable row level security;
drop policy if exists "scores: public read" on public.scores;
create policy "scores: public read" on public.scores for select using (true);
-- No insert/update/delete policies: only the security-definer functions below write scores.

create or replace function public.current_week() returns text
language sql stable set search_path = '' as $$
  select to_char(now() at time zone 'Europe/Berlin', 'IYYY-"W"IW')
$$;

create or replace function public.start_run(p_board text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then raise exception 'Sign in to play ranked runs'; end if;
  if not exists (select 1 from public.boards where id = p_board) then raise exception 'Unknown board'; end if;
  if (select count(*) from public.runs where user_id = v_uid and started_at > now() - interval '1 hour') >= 120 then
    raise exception 'Too many runs in the last hour. Try again later.';
  end if;
  -- Users created before this schema existed have no profile yet.
  insert into public.profiles (id, display_name)
  values (v_uid, 'Analyst-' || substr(replace(v_uid::text, '-', ''), 1, 5))
  on conflict (id) do nothing;
  -- Only the latest run per board can be submitted.
  update public.runs set finished_at = now(), accepted = false
   where user_id = v_uid and board = p_board and finished_at is null;
  insert into public.runs (user_id, board) values (v_uid, p_board) returning id into v_id;
  return v_id;
end $$;

create or replace function public.submit_run(p_run uuid, p_score int) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  r     public.runs%rowtype;
  b     public.boards%rowtype;
  v_ms  int;
  v_why text;
  v_score int;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  select * into r from public.runs where id = p_run and user_id = v_uid for update;
  if not found then raise exception 'Run not found'; end if;
  if r.finished_at is not null then raise exception 'Run already submitted'; end if;
  select * into b from public.boards where id = r.board;
  v_ms := floor(extract(epoch from (clock_timestamp() - r.started_at)) * 1000)::int;

  if p_score is null then v_why := 'no score';
  elsif v_ms < b.min_ms then v_why := 'run too short';
  elsif v_ms > b.max_ms then v_why := 'run too long';
  elsif p_score < b.min_score or p_score > b.max_score then v_why := 'score out of range';
  elsif p_score > 0 and p_score::bigint * b.ms_per_point > v_ms then v_why := 'score too fast to be plausible';
  end if;

  -- Stopwatch boards: p_score is the number of mistakes; the score is time plus penalties.
  v_score := case when b.time_score then v_ms + p_score * b.penalty_ms else p_score end;

  update public.runs set finished_at = now(), score = v_score, time_ms = v_ms, accepted = (v_why is null)
   where id = r.id;
  if v_why is not null then
    return jsonb_build_object('ok', false, 'reason', v_why, 'time_ms', v_ms);
  end if;

  insert into public.scores as s (user_id, board, period, score, time_ms, run_id, updated_at)
  select v_uid, r.board, per, v_score, case when b.time_tiebreak or b.time_score then v_ms end, r.id, now()
    from unnest(array['all', public.current_week()]) as per
  on conflict (user_id, board, period) do update
     set score = excluded.score, time_ms = excluded.time_ms, run_id = excluded.run_id, updated_at = now()
   where (b.lower_better and excluded.score < s.score)
      or (not b.lower_better and (excluded.score > s.score
          or (excluded.score = s.score and excluded.time_ms is not null and (s.time_ms is null or excluded.time_ms < s.time_ms))));

  return jsonb_build_object('ok', true, 'time_ms', v_ms, 'score', v_score);
end $$;

revoke all on function public.start_run(text) from public, anon;
revoke all on function public.submit_run(uuid, int) from public, anon;
grant execute on function public.start_run(text) to authenticated;
grant execute on function public.submit_run(uuid, int) to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Leaderboard view: all-time rows plus the current week's rows, with public profile fields.
create or replace view public.leaderboard with (security_invoker = true) as
select s.board,
       case when s.period = 'all' then 'all' else 'week' end as scope,
       s.user_id, p.display_name, p.university, s.score, s.time_ms, s.updated_at
  from public.scores s
  join public.profiles p on p.id = s.user_id
 where s.period = 'all' or s.period = public.current_week();

-- Rank of the signed-in user on one board ('all' or 'week'); null if no score.
create or replace function public.my_rank(p_board text, p_scope text) returns int
language sql stable security invoker set search_path = '' as $$
  with me as (
    select l.score, l.time_ms, b.lower_better from public.leaderboard l
      join public.boards b on b.id = l.board
     where l.board = p_board and l.scope = p_scope and l.user_id = auth.uid()
  )
  select (select count(*)::int + 1 from public.leaderboard l, me
           where l.board = p_board and l.scope = p_scope
             and case when me.lower_better then l.score < me.score
                      else l.score > me.score or (l.score = me.score and l.time_ms < me.time_ms) end)
   where exists (select 1 from me)
$$;

-- =====================================================================================================
-- 3b. Friends. Every profile has a friend code; adding someone's code makes you friends both ways.
--     Friends only see what is public anyway (name, university, leaderboard results), filtered to each other.
-- =====================================================================================================
alter table public.profiles add column if not exists friend_code text unique
  default upper(substr(md5(gen_random_uuid()::text), 1, 8));

create table if not exists public.friends (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  friend_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
alter table public.friends enable row level security;
drop policy if exists "friends: read own" on public.friends;
create policy "friends: read own" on public.friends for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.add_friend(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_friend public.profiles%rowtype;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  select * into v_friend from public.profiles where friend_code = upper(btrim(p_code));
  if not found then raise exception 'No player with that code'; end if;
  if v_friend.id = v_uid then raise exception 'That is your own code'; end if;
  if (select count(*) from public.friends where user_id = v_uid) >= 200 then raise exception 'Friend limit reached'; end if;
  insert into public.friends (user_id, friend_id) values (v_uid, v_friend.id), (v_friend.id, v_uid)
  on conflict do nothing;
  return jsonb_build_object('id', v_friend.id, 'display_name', v_friend.display_name);
end $$;

create or replace function public.remove_friend(p_friend uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.friends
   where (user_id = auth.uid() and friend_id = p_friend) or (user_id = p_friend and friend_id = auth.uid());
end $$;

-- Friend codes are not public (otherwise anyone could befriend everyone); each user reads only their own.
create or replace function public.my_friend_code() returns text
language sql stable security definer set search_path = '' as $$
  select friend_code from public.profiles where id = auth.uid()
$$;

-- After a run: site average of everyone's all-time best on a board, plus each friend's best.
create or replace function public.board_compare(p_board text) returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'avg_ms',  (select avg(score) from public.scores where board = p_board and period = 'all'),
    'players', (select count(*) from public.scores where board = p_board and period = 'all'),
    'friends', coalesce((select jsonb_agg(jsonb_build_object('display_name', p.display_name, 'score', s.score) order by s.score)
                  from public.friends fr
                  join public.scores s on s.user_id = fr.friend_id and s.board = p_board and s.period = 'all'
                  join public.profiles p on p.id = fr.friend_id
                 where fr.user_id = auth.uid()), '[]'::jsonb))
$$;

revoke all on function public.add_friend(text) from public, anon;
revoke all on function public.remove_friend(uuid) from public, anon;
revoke all on function public.board_compare(text) from public, anon;
revoke all on function public.my_friend_code() from public, anon;
grant execute on function public.add_friend(text), public.remove_friend(uuid), public.board_compare(text), public.my_friend_code() to authenticated;

-- =====================================================================================================
-- 4. Firm tracker. Firm descriptions live in js/data/firms.js (versioned with the site); this table holds
--    the slugs so saved applications can reference them. Regenerate the seed block with
--    `python3 tools/firms_to_sql.py` after editing firms.js.
-- =====================================================================================================
create table if not exists public.firms (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  grp  text not null check (grp in ('boutique','bulge','corporate','big4'))
);
alter table public.firms enable row level security;
drop policy if exists "firms: public read" on public.firms;
create policy "firms: public read" on public.firms for select using (true);

create table if not exists public.applications (
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  firm_slug  text not null references public.firms(slug) on delete cascade,
  status     text not null default 'saved'
             check (status in ('saved','preparing','applied','test','interview','offer','rejected','withdrawn')),
  programme  text check (programme is null or programme in ('internship','working_student','graduate','other')),
  applied_on date,
  notes      text check (notes is null or char_length(notes) <= 2000),
  updated_at timestamptz not null default now(),
  primary key (user_id, firm_slug)
);
alter table public.applications enable row level security;
drop policy if exists "applications: own rows" on public.applications;
create policy "applications: own rows" on public.applications for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- BEGIN FIRM SEED (generated by tools/firms_to_sql.py — do not edit by hand)
-- END FIRM SEED

-- =====================================================================================================
-- 4b. Recovery emails, password-reset requests, anonymous tracker averages (also in 003_recovery_and_stats.sql)
-- =====================================================================================================
-- 1. Recovery email: stored separately from the login, visible only to its owner.
--    The login stays username + password, so adding an email never changes how someone signs in.
create table if not exists public.recovery_emails (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  updated_at timestamptz not null default now()
);
alter table public.recovery_emails enable row level security;
drop policy if exists "recovery_emails: own row" on public.recovery_emails;
create policy "recovery_emails: own row" on public.recovery_emails for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.recovery_emails from anon;
grant select, insert, update, delete on public.recovery_emails to authenticated;

-- 2. "Forgot password": the site records a request; the site owner resets it (see README) until an automatic
--    reset email is set up. Requests reveal nothing to the requester; max 3 per username per day.
create table if not exists public.reset_requests (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  handled    boolean not null default false
);
alter table public.reset_requests enable row level security;
revoke all on public.reset_requests from anon, authenticated;

create or replace function public.request_password_reset(p_username text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  select id into v_id from public.profiles where username = lower(btrim(p_username));
  if v_id is null then return; end if;
  if (select count(*) from public.reset_requests where user_id = v_id and created_at > now() - interval '1 day') >= 3 then return; end if;
  insert into public.reset_requests (user_id) values (v_id);
end $$;
revoke all on function public.request_password_reset(text) from public;
grant execute on function public.request_password_reset(text) to anon, authenticated;

-- 3. Anonymous tracker averages for the firm tracker page.
--    Averages over users with at least one application in the last 365 days (Berlin time); returned only when at
--    least 5 such users exist, so no individual can be singled out. Only accounts are counted (guests store
--    their tracker in the browser).
create or replace function public.try_date(p text) returns date
language plpgsql immutable set search_path = '' as $$
begin
  if p !~ '^\d{4}-\d{2}-\d{2}$' then return null; end if;
  return p::date;
exception when others then return null;
end $$;

drop function if exists public.tracker_stats();
create or replace function public.tracker_stats(p_today date default null) returns jsonb
language sql stable security definer set search_path = '' as $$
  with b as (select (now() at time zone 'Europe/Berlin')::date as d),
  today as (select case when p_today between (select d from b) - 1 and (select d from b) + 1 then p_today else (select d from b) end as d),
  ev as (
    select p.user_id, e.value ->> 't' as t, public.try_date(e.value ->> 'd') as d
      from public.progress p
      cross join lateral jsonb_array_elements(case when jsonb_typeof(p.state -> 'apps') = 'array' then p.state -> 'apps' else '[]'::jsonb end) a
      cross join lateral jsonb_array_elements(case when jsonb_typeof(a.value -> 'ev') = 'array' then a.value -> 'ev' else '[]'::jsonb end) e
  ),
  per as (
    select user_id,
      count(*) filter (where t = 'applied'  and d >= (select d from today) - 365) as applied_year,
      count(*) filter (where t = 'applied'  and d =  (select d from today))       as applied_today,
      count(*) filter (where t = 'offer'    and d >= (select d from today) - 365) as offers_year,
      count(*) filter (where t = 'rejected' and d >= (select d from today) - 365) as rejections_year
      from ev group by user_id
  ),
  active as (select * from per where applied_year > 0)
  select case when (select count(*) from active) < 5
    then jsonb_build_object('users', (select count(*) from active), 'enough', false)
    else jsonb_build_object('users', (select count(*) from active), 'enough', true,
      'applied_year',    (select round(avg(applied_year), 1) from active),
      'applied_today',   (select round(avg(applied_today), 2) from active),
      'offers_year',     (select round(avg(offers_year), 1) from active),
      'rejections_year', (select round(avg(rejections_year), 1) from active))
  end
$$;
revoke all on function public.tracker_stats(date) from public;
grant execute on function public.tracker_stats(date) to anon, authenticated;

-- =====================================================================================================
-- 4c. Feedback (also in 005_feedback.sql)
-- =====================================================================================================
create table if not exists public.feedback (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('bug','missing','idea')),
  message    text not null check (char_length(message) between 3 and 2000),
  page       text check (page is null or char_length(page) <= 300),
  lang       text check (lang is null or lang in ('en','de')),
  contact    text check (contact is null or char_length(contact) <= 254),
  user_id    uuid references auth.users(id) on delete set null,
  username   text,
  status     text not null default 'new' check (status in ('new','seen','done'))
);
create index if not exists feedback_created on public.feedback (created_at desc);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

create or replace function public.submit_feedback(p_kind text, p_message text, p_page text, p_lang text, p_contact text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if p_kind not in ('bug','missing','idea') then raise exception 'Invalid feedback type'; end if;
  if char_length(btrim(coalesce(p_message,''))) < 3 then raise exception 'Message too short'; end if;
  -- Spam brakes: 30 messages per minute site-wide, 5 per 10 minutes per signed-in user.
  if (select count(*) from public.feedback where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Too many messages right now. Please try again in a minute.'; end if;
  if v_uid is not null and (select count(*) from public.feedback where user_id = v_uid and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'Too many messages right now. Please try again in a minute.'; end if;
  insert into public.feedback (kind, message, page, lang, contact, user_id, username)
  values (p_kind, left(btrim(p_message), 2000), left(p_page, 300), case when p_lang in ('en','de') then p_lang end,
          nullif(left(btrim(coalesce(p_contact,'')), 254), ''), v_uid,
          (select username from public.profiles where id = v_uid));
end $$;
revoke all on function public.submit_feedback(text, text, text, text, text) from public;
grant execute on function public.submit_feedback(text, text, text, text, text) to anon, authenticated;

-- =====================================================================================================
-- 4d. Community interview questions (also in 006_interview_questions.sql)
-- =====================================================================================================
create table if not exists public.interview_posts (
  id         bigserial primary key,
  firm_slug  text not null check (firm_slug ~ '^[a-z0-9-]{2,60}$'),
  user_id    uuid not null references auth.users(id) on delete cascade,
  anonymous  boolean not null default false,
  question   text not null check (char_length(question) between 5 and 1000),
  round      text check (round is null or round in ('screening','first','second','final','assessment','case','other')),
  programme  text check (programme is null or programme in ('internship','working_student','graduate','other')),
  year       int  check (year is null or year between 2015 and 2100),
  votes      int  not null default 0,
  reports    int  not null default 0,
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists interview_posts_firm on public.interview_posts (firm_slug, hidden, votes desc, created_at desc);
create table if not exists public.interview_votes (
  post_id bigint not null references public.interview_posts(id) on delete cascade,
  user_id uuid   not null references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);
create table if not exists public.interview_reports (
  post_id    bigint not null references public.interview_posts(id) on delete cascade,
  user_id    uuid   not null references auth.users(id) on delete cascade,
  reason     text check (reason is null or char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.interview_posts enable row level security;
alter table public.interview_votes enable row level security;
alter table public.interview_reports enable row level security;
revoke all on public.interview_posts, public.interview_votes, public.interview_reports from anon, authenticated;
revoke all on sequence public.interview_posts_id_seq from anon, authenticated;

-- Number of visible questions per firm (for the firm list).
create or replace function public.interview_counts() returns table (firm_slug text, n bigint)
language sql stable security definer set search_path = '' as $$
  select firm_slug, count(*) from public.interview_posts where not hidden group by firm_slug
$$;

-- Visible questions for one firm, most "asked too" first. author is null for anonymous posts.
create or replace function public.interview_posts_for(p_slug text)
returns table (id bigint, question text, round text, programme text, year int, created_at timestamptz,
               author text, votes int, mine boolean, voted boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.question, p.round, p.programme, p.year, p.created_at,
         case when p.anonymous then null else pr.display_name end,
         p.votes, p.user_id = auth.uid(),
         exists (select 1 from public.interview_votes v where v.post_id = p.id and v.user_id = auth.uid())
    from public.interview_posts p
    left join public.profiles pr on pr.id = p.user_id
   where p.firm_slug = p_slug and not p.hidden
   order by p.votes desc, p.created_at desc
   limit 200
$$;

create or replace function public.submit_interview_question(p_slug text, p_question text, p_round text,
  p_programme text, p_year int, p_anonymous boolean) returns bigint
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_id bigint;
begin
  if v_uid is null then raise exception 'Sign in to post'; end if;
  if p_slug !~ '^[a-z0-9-]{2,60}$' then raise exception 'Unknown firm'; end if;
  if char_length(btrim(coalesce(p_question,''))) < 5 then raise exception 'Question too short'; end if;
  if (select count(*) from public.interview_posts where user_id = v_uid and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many posts. Please try again later.'; end if;
  insert into public.interview_posts (firm_slug, user_id, anonymous, question, round, programme, year)
  values (p_slug, v_uid, coalesce(p_anonymous, false), left(btrim(p_question), 1000),
          nullif(p_round, ''), nullif(p_programme, ''), p_year)
  returning id into v_id;
  return v_id;
end $$;

-- "I was asked this too": toggles the caller's vote and returns the new count.
create or replace function public.toggle_interview_vote(p_id bigint) returns int
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v int;
begin
  if v_uid is null then raise exception 'Sign in to vote'; end if;
  if exists (select 1 from public.interview_votes where post_id = p_id and user_id = v_uid) then
    delete from public.interview_votes where post_id = p_id and user_id = v_uid;
  else
    insert into public.interview_votes (post_id, user_id) values (p_id, v_uid);
  end if;
  update public.interview_posts set votes = (select count(*) from public.interview_votes where post_id = p_id)
   where id = p_id returning votes into v;
  return v;
end $$;

create or replace function public.report_interview_question(p_id bigint, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Sign in to report'; end if;
  insert into public.interview_reports (post_id, user_id, reason) values (p_id, v_uid, left(p_reason, 300))
  on conflict do nothing;
  update public.interview_posts
     set reports = (select count(*) from public.interview_reports where post_id = p_id),
         hidden  = hidden or (select count(*) from public.interview_reports where post_id = p_id) >= 3
   where id = p_id;
end $$;

create or replace function public.delete_interview_question(p_id bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.interview_posts where id = p_id and user_id = auth.uid();
end $$;

revoke all on function public.interview_counts(), public.interview_posts_for(text),
  public.submit_interview_question(text, text, text, text, int, boolean), public.toggle_interview_vote(bigint),
  public.report_interview_question(bigint, text), public.delete_interview_question(bigint) from public;
grant execute on function public.interview_counts(), public.interview_posts_for(text) to anon, authenticated;
grant execute on function public.submit_interview_question(text, text, text, text, int, boolean),
  public.toggle_interview_vote(bigint), public.report_interview_question(bigint, text),
  public.delete_interview_question(bigint) to authenticated;

-- =====================================================================================================
-- 5. Table privileges (RLS above decides which rows; these decide which operations reach RLS at all).
-- =====================================================================================================
grant usage on schema public to anon, authenticated;
grant select on public.boards, public.scores, public.firms, public.leaderboard to anon, authenticated;
-- Profiles: every column except friend_code is public.
revoke select on public.profiles from anon, authenticated;
grant select (id, username, display_name, university, target_role, created_at, updated_at) on public.profiles to anon, authenticated;
revoke insert, update on public.profiles from authenticated;
grant insert (id, display_name, university, target_role), update (display_name, university, target_role, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.progress, public.applications to authenticated;
grant select on public.runs, public.friends to authenticated;
revoke insert, update, delete on public.friends from anon, authenticated;
revoke insert, update, delete on public.scores, public.runs, public.boards, public.firms from anon, authenticated;
revoke insert, update, delete on public.profiles from anon;
revoke all on public.progress, public.applications, public.runs, public.friends from anon;
grant execute on function public.current_week() to anon, authenticated;
grant execute on function public.my_rank(text, text) to authenticated;


-- 009: site host (admin) can delete any interview question.
-- 1) Replace YOUR_USERNAME below with your Deal Drills username (lower case), then run the whole file.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;   -- no policies: only security-definer functions read it
revoke all on public.admins from anon, authenticated;

insert into public.admins (user_id)
select id from auth.users where email = lower('YOUR_USERNAME') || '@users.dealdrills.app'
on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- "mine" now also means "you may delete it" (author or host).
create or replace function public.interview_posts_for(p_slug text)
returns table (id bigint, question text, round text, programme text, year int, created_at timestamptz,
               author text, votes int, mine boolean, voted boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.question, p.round, p.programme, p.year, p.created_at,
         case when p.anonymous then null else pr.display_name end,
         p.votes, (p.user_id = auth.uid() or public.is_admin()),
         exists (select 1 from public.interview_votes v where v.post_id = p.id and v.user_id = auth.uid())
    from public.interview_posts p
    left join public.profiles pr on pr.id = p.user_id
   where p.firm_slug = p_slug and not p.hidden
   order by p.votes desc, p.created_at desc
   limit 200
$$;

create or replace function public.delete_interview_question(p_id bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  delete from public.interview_posts where id = p_id and (user_id = auth.uid() or public.is_admin());
  if not found then raise exception 'Not allowed'; end if;
end $$;

-- Check: should return one row with your user id.
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;


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

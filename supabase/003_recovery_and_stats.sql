-- Deal Drills update 003: private recovery emails, password-reset requests, anonymous tracker averages.
-- Run once in Supabase → SQL Editor (safe to run again). schema.sql contains the same statements for new projects.

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

create or replace function public.tracker_stats() returns jsonb
language sql stable security definer set search_path = '' as $$
  with today as (select (now() at time zone 'Europe/Berlin')::date as d),
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
revoke all on function public.tracker_stats() from public;
grant execute on function public.tracker_stats() to anon, authenticated;

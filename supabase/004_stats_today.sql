-- Deal Drills update 004: "applied today" in the tracker averages uses the visitor's date (within ±1 day of Berlin),
-- so it matches what users see around midnight and in other time zones. Run once; safe to repeat.
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

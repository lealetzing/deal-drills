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

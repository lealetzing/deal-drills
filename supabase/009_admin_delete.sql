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

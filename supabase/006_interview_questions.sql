-- Deal Drills update 006: community interview questions per firm. Run once; safe to repeat.
-- Anyone can read; signed-in users can post (optionally anonymously), mark "I was asked this too", report, and
-- delete their own posts. Posts with 3 reports are hidden automatically; you moderate in Table Editor →
-- interview_posts (set hidden = true/false, or delete). Visitors never see user ids, so anonymous posts stay anonymous.
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

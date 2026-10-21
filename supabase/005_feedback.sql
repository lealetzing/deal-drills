-- Deal Drills update 005: feedback button (bug / something missing / idea). Run once; safe to repeat.
-- Messages are readable only by you (Supabase → Table Editor → feedback). Visitors can only submit, through
-- submit_feedback(), which checks lengths and slows down spam.
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

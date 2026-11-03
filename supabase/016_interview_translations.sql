-- 016: optional English and German versions of interview posts. Safe to run more than once.
alter table public.interview_posts add column if not exists question_en text check (question_en is null or char_length(question_en) <= 1200);
alter table public.interview_posts add column if not exists question_de text check (question_de is null or char_length(question_de) <= 1200);

-- The return type changes, so the function has to be dropped first.
drop function if exists public.interview_posts_for(text);
create function public.interview_posts_for(p_slug text)
returns table (id bigint, question text, question_en text, question_de text, round text, programme text, year int,
               created_at timestamptz, author text, votes int, mine boolean, voted boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.question, p.question_en, p.question_de, p.round, p.programme, p.year, p.created_at,
         case when p.anonymous then null else pr.display_name end,
         p.votes, (p.user_id = auth.uid() or public.is_admin()),
         exists (select 1 from public.interview_votes v where v.post_id = p.id and v.user_id = auth.uid())
    from public.interview_posts p
    left join public.profiles pr on pr.id = p.user_id
   where p.firm_slug = p_slug and not p.hidden
   order by p.votes desc, p.created_at desc
   limit 200
$$;
revoke all on function public.interview_posts_for(text) from public;
grant execute on function public.interview_posts_for(text) to anon, authenticated;

-- Translations of the existing LSJ Advisory questions, matched by their exact text.
update public.interview_posts p set question_en = t.en, question_de = t.de
from (values
  ('Wie hängen die financial Statements zusammen? Was passiert bei einer Abschreibung von 10? Was steht in IFRS 16? Was ist Net Working Capital? Wie würdest du hohes, niedriges und negatives NWC bewerten? Beschreibe den CCC.',
   'How do the financial statements link? What happens with depreciation of 10? What does IFRS 16 say? What is net working capital? How would you assess high, low and negative NWC? Describe the CCC.',
   'Wie hängen die Finanzberichte zusammen? Was passiert bei einer Abschreibung von 10? Was steht in IFRS 16? Was ist Net Working Capital? Wie würdest du hohes, niedriges und negatives NWC bewerten? Beschreibe den CCC.'),
  ('Wie hängen die financial Statements zusammen?','How do the financial statements link?','Wie hängen die Finanzberichte zusammen?'),
  ('Was passiert bei einer Abschreibung von 10?','What happens with depreciation of 10?','Was passiert bei einer Abschreibung von 10?'),
  ('Was steht in IFRS 16?','What does IFRS 16 say?','Was steht in IFRS 16?'),
  ('Was ist NWC?','What is NWC?','Was ist NWC?'),
  ('Wie würdest du hohes, neidriges und negatives NWC bewerten?','How would you assess high, low and negative NWC?','Wie würdest du hohes, niedriges und negatives NWC bewerten?'),
  ('Beschreibe den CCC?','Describe the CCC.','Beschreibe den CCC.')
) as t(orig, en, de)
where p.question = t.orig;

-- Check: every post with its translations.
select firm_slug, question_en, question_de from public.interview_posts order by firm_slug, created_at;

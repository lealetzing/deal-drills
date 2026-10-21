-- LSJ-Advisory-Fragen aus dem alten Projekt übernehmen (anonym, unter dem Konto lea). Im NEUEN Projekt einmal ausführen.
insert into public.interview_posts (firm_slug, user_id, anonymous, question, round, programme, year, created_at) values
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Wie hängen die financial Statements zusammen? Was passiert bei einer Abschreibung von 10? Was steht in IFRS 16? Was ist Net Working Capital? Wie würdest du hohes, niedriges und negatives NWC bewerten? Beschreibe den CCC.', null, null, 2026, '2026-10-17T01:35:54.539829+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Wie hängen die financial Statements zusammen?', null, null, 2026, '2026-10-18T16:30:59.075926+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Was passiert bei einer Abschreibung von 10?', null, null, 2026, '2026-10-18T16:31:12.258398+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Was steht in IFRS 16?', null, null, 2026, '2026-10-18T16:31:19.923593+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Was ist NWC?', null, null, 2026, '2026-10-18T16:31:30.058998+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Wie würdest du hohes, neidriges und negatives NWC bewerten?', null, null, 2026, '2026-10-18T16:31:43.561093+00:00'),
  ('lsj-advisory', (select id from auth.users where email = 'lea@users.dealdrills.app'), true, 'Beschreibe den CCC?', null, null, 2026, '2026-10-18T16:31:50.137562+00:00');

select firm_slug, count(*) from public.interview_posts group by firm_slug;

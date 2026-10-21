-- Delete the five demo accounts (demo_user_1 … demo_user_5) created on 2026-10-16 so the tracker averages show.
-- Run this before launch, otherwise their made-up applications count in the public averages.
-- Their profiles and progress are deleted with them.
delete from auth.users where email in (
  'demo_user_1@users.dealdrills.app','demo_user_2@users.dealdrills.app','demo_user_3@users.dealdrills.app',
  'demo_user_4@users.dealdrills.app','demo_user_5@users.dealdrills.app');
select count(*) as remaining_demo_accounts from auth.users where email like 'demo_user_%';

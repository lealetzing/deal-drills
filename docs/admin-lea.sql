-- Nach dem Anlegen deines Kontos "lea" auf der Seite ausführen: macht dich zur Host (Löschen aller Interview-Beiträge).
insert into public.admins (user_id)
select id from auth.users where email = 'lea@users.dealdrills.app'
on conflict do nothing;
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;

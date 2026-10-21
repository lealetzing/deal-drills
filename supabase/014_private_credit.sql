-- Zielposition "Private Credit" erlauben. Entfernt jede alte Prüfregel auf target_role (egal wie sie heißt) und setzt die neue.
do $$
declare c text;
begin
  for c in select con.conname from pg_constraint con join pg_class t on t.oid = con.conrelid join pg_namespace n on n.oid = t.relnamespace
            where n.nspname = 'public' and t.relname = 'profiles' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%target_role%'
  loop execute format('alter table public.profiles drop constraint %I', c); end loop;
end $$;
alter table public.profiles add constraint profiles_target_role_check
  check (target_role is null or target_role in ('corporate_ma','ib','pe','pc','ts','other'));
select conname, pg_get_constraintdef(oid) from pg_constraint where conname = 'profiles_target_role_check';

-- Deal Drills update 002: usernames (sign-in with username + password).
-- Run once in Supabase → SQL Editor if you ran schema.sql before this file existed. Safe to run again.
-- (schema.sql contains the same statements, so new projects only need schema.sql.)

alter table public.profiles add column if not exists username text unique
  check (username is null or username ~ '^[a-z0-9_.-]{3,20}$');

-- New users: take the username chosen at sign-up; it is also the starting display name.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_username text := lower(nullif(btrim(new.raw_user_meta_data ->> 'username'), ''));
begin
  if v_username is not null and v_username !~ '^[a-z0-9_.-]{3,20}$' then v_username := null; end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, coalesce(v_username, 'Analyst-' || substr(replace(new.id::text, '-', ''), 1, 5)))
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Sign-up form: is this username free? Usernames are public anyway (they are the default display name).
create or replace function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = '' as $$
  select lower(btrim(p_username)) ~ '^[a-z0-9_.-]{3,20}$'
     and not exists (select 1 from public.profiles where username = lower(btrim(p_username)))
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

grant select (id, username, display_name, university, target_role, created_at, updated_at) on public.profiles to anon, authenticated;

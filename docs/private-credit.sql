-- 014: target role "Private Credit".
alter table public.profiles drop constraint if exists profiles_target_role_check;
alter table public.profiles add constraint profiles_target_role_check
  check (target_role is null or target_role in ('corporate_ma','ib','pe','pc','ts','other'));

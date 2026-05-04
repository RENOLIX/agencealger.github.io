create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'employee');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Utilisateur',
  email text,
  password text,
  role public.app_role not null default 'employee',
  avatar text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id set default gen_random_uuid();

alter table public.profiles
  add column if not exists email text,
  add column if not exists password text,
  add column if not exists active boolean default true,
  add column if not exists created_at timestamptz default now();

update public.profiles
set
  full_name = coalesce(nullif(full_name, ''), 'Utilisateur'),
  email = lower(coalesce(nullif(email, ''), concat('user-', left(id::text, 8), '@hamdi.local'))),
  password = coalesce(nullif(password, ''), 'Hamdi2026!00'),
  role = coalesce(role, 'employee'::public.app_role),
  avatar = coalesce(nullif(avatar, ''), upper(left(coalesce(full_name, 'HV'), 2))),
  active = coalesce(active, true),
  created_at = coalesce(created_at, now());

delete from public.profiles a
using public.profiles b
where lower(a.email) = lower(b.email)
  and a.ctid < b.ctid;

create unique index if not exists profiles_email_lower_key
on public.profiles (lower(email));

alter table public.profiles
  alter column full_name set not null,
  alter column email set not null,
  alter column password set not null,
  alter column role set default 'employee',
  alter column role set not null,
  alter column active set default true,
  alter column active set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

delete from public.profiles
where lower(email) = 'admin@hamdi.local'
   or full_name = 'Nora Admin';

insert into public.profiles (id, full_name, email, password, role, avatar, active)
values
  (gen_random_uuid(), 'وكالة البراق', 'elbouraqtravel@gmail.com', 'Hamdi2026!01', 'employee', 'بر', true),
  (gen_random_uuid(), 'وكالة فريحة', 'agencefareha@gmail.com', 'Hamdi2026!02', 'employee', 'فر', true),
  (gen_random_uuid(), 'فرع حمدي البراواقية', 'voyage26.02hamdi@gmail.com', 'Hamdi2026!03', 'employee', 'بر', true),
  (gen_random_uuid(), 'فرع قصر البخاري', 'voyage26hamdi@gmail.com', 'Hamdi2026!04', 'employee', 'قب', true),
  (gen_random_uuid(), 'محي الدين محروق', 'voyage.hamdi35.1@gmail.com', 'Hamdi2026!05', 'employee', 'مح', true),
  (gen_random_uuid(), 'فرع حمدي بجاية', 'hamdivoyagebejaia06@gmail.com', 'Hamdi2026!06', 'employee', 'بج', true),
  (gen_random_uuid(), 'فرع الرغاية -الجزائر-', 'voyage16hamdi@gmail.com', 'Hamdi2026!07', 'employee', 'رغ', true)
on conflict do nothing;

insert into public.profiles (id, full_name, email, password, role, avatar, active)
values
  (gen_random_uuid(), 'إدارة حمـدي', 'admin@hamdi-agency.local', 'Hamdi2026!99', 'admin', 'حم', true)
on conflict do nothing;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_public_read" on public.profiles;
drop policy if exists "profiles_public_insert" on public.profiles;
drop policy if exists "profiles_public_update" on public.profiles;
drop policy if exists "profiles_public_delete" on public.profiles;

create policy "profiles_public_read"
on public.profiles for select
to anon, authenticated
using (true);

create policy "profiles_public_insert"
on public.profiles for insert
to anon, authenticated
with check (true);

create policy "profiles_public_update"
on public.profiles for update
to anon, authenticated
using (true)
with check (true);

create policy "profiles_public_delete"
on public.profiles for delete
to anon, authenticated
using (true);

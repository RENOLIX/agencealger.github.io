-- Agence Alger / Hamdi Voyage - schema Supabase
-- A coller dans Supabase SQL Editor, puis executer.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('admin', 'employee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.travel_category as enum ('Plage', 'Aventure', 'Culture', 'Luxe');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.reservation_status as enum ('Validee', 'En attente', 'Annulee');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.travels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  country text not null,
  image_url text not null,
  image_urls text[] not null default '{}',
  departure_date date not null,
  duration text not null,
  price numeric(12,2) not null check (price >= 0),
  description text not null,
  guides text not null default '',
  category public.travel_category not null,
  benefits text[] not null default '{}',
  tickets_total integer not null check (tickets_total >= 0),
  tickets_left integer not null check (tickets_left >= 0),
  rating numeric(2,1) not null default 4.8,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_left_lte_total check (tickets_left <= tickets_total)
);

alter table public.travels add column if not exists guides text not null default '';
alter table public.travels add column if not exists image_urls text[] not null default '{}';

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete restrict,
  employee_id uuid not null references public.profiles(id) on delete restrict,
  client_name text not null,
  client_phone text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total numeric(12,2) generated always as (quantity * unit_price) stored,
  status public.reservation_status not null default 'Validee',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  destination text,
  message text not null,
  status text not null default 'Nouveau',
  created_at timestamptz not null default now()
);

create index if not exists reservations_employee_id_idx on public.reservations(employee_id);
create index if not exists reservations_travel_id_idx on public.reservations(travel_id);
create index if not exists travels_active_departure_idx on public.travels(active, departure_date);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists travels_touch_updated_at on public.travels;
create trigger travels_touch_updated_at
before update on public.travels
for each row execute function public.touch_updated_at();

create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'employee'),
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.create_reservation(
  p_travel_id uuid,
  p_client_name text,
  p_client_phone text,
  p_quantity integer
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_travel public.travels;
  created_reservation public.reservations;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non connecte';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantite invalide';
  end if;

  select * into selected_travel
  from public.travels
  where id = p_travel_id and active = true
  for update;

  if not found then
    raise exception 'Voyage introuvable';
  end if;

  if selected_travel.tickets_left < p_quantity then
    raise exception 'Billets insuffisants';
  end if;

  update public.travels
  set tickets_left = tickets_left - p_quantity
  where id = p_travel_id;

  insert into public.reservations (travel_id, employee_id, client_name, client_phone, quantity, unit_price, status)
  values (p_travel_id, auth.uid(), p_client_name, p_client_phone, p_quantity, selected_travel.price, 'Validee')
  returning * into created_reservation;

  return created_reservation;
end;
$$;

alter table public.profiles enable row level security;
alter table public.travels enable row level security;
alter table public.reservations enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "travels_public_read_active" on public.travels;
create policy "travels_public_read_active"
on public.travels for select
to anon, authenticated
using (active = true);

drop policy if exists "travels_admin_insert" on public.travels;
create policy "travels_admin_insert"
on public.travels for insert
to authenticated
with check (public.current_user_role() = 'admin');

drop policy if exists "travels_admin_update" on public.travels;
create policy "travels_admin_update"
on public.travels for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "travels_admin_delete" on public.travels;
create policy "travels_admin_delete"
on public.travels for delete
to authenticated
using (public.current_user_role() = 'admin');

drop policy if exists "reservations_select_own_or_admin" on public.reservations;
create policy "reservations_select_own_or_admin"
on public.reservations for select
to authenticated
using (employee_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "reservations_insert_employee" on public.reservations;
create policy "reservations_insert_employee"
on public.reservations for insert
to authenticated
with check (employee_id = auth.uid());

drop policy if exists "reservations_admin_update" on public.reservations;
create policy "reservations_admin_update"
on public.reservations for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
on public.contact_messages for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
on public.contact_messages for select
to authenticated
using (public.current_user_role() = 'admin');

truncate table public.travels restart identity cascade;

insert into public.travels
  (name, destination, country, image_url, image_urls, departure_date, duration, price, description, guides, category, benefits, tickets_total, tickets_left, rating)
values
  ('عمرة شهر يونيو', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-06-01', '30 يوم', 185000, 'برنامج كامل من 1 إلى 30 يونيو يشمل الإقامة قرب الحرم، النقل، والمتابعة اليومية.', 'الشيخ أحمد بن يوسف، الأستاذ سمير بن عمر', 'Culture', array['Vol','Hotel','Repas','Guide','Transfert','Assurance'], 45, 31, 4.9),
  ('عمرة شهر يوليو', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-07-01', '30 يوم', 189000, 'رحلة منظمة من 1 إلى 30 يوليو مع مرشدين مرافقين وخدمة متابعة للحجاج والمعتمرين.', 'الحاج مصطفى قادري، الأستاذة نوال حميدي', 'Culture', array['Vol','Hotel','Repas','Guide','Wifi','Transfert'], 40, 22, 4.8),
  ('عمرة شهر أغسطس', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1564769662533-4f00a87b4056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-08-01', '30 يوم', 192000, 'إقامة مريحة من 1 إلى 30 أغسطس، تنقلات جماعية، ومرافقة إدارية طوال الرحلة.', 'الشيخ عبد الرحمن علي، الأستاذ كريم منصوري', 'Luxe', array['Vol','Hotel','Repas','Guide','Climatisation','Assurance'], 36, 14, 5.0),
  ('عمرة شهر سبتمبر', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1578895101408-1a36b834405b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-09-01', '30 يوم', 179000, 'برنامج اقتصادي من 1 إلى 30 سبتمبر مع خدمات أساسية منظمة وقريبة من احتياجات العائلات.', 'الحاج رابح دحمان، الأستاذ ياسين مرابط', 'Aventure', array['Vol','Hotel','Guide','Transfert','Bagages'], 50, 37, 4.7),
  ('عمرة شهر أكتوبر', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-10-01', '30 يوم', 187000, 'رحلة من 1 إلى 30 أكتوبر تجمع بين التنظيم الهادئ والإرشاد الديني والمتابعة اليومية.', 'الشيخ بلال زروقي، الأستاذة مريم بلقاسم', 'Culture', array['Vol','Hotel','Repas','Guide','Wifi','Assurance'], 42, 26, 4.9),
  ('عمرة شهر نوفمبر', 'مكة المكرمة', 'السعودية', 'https://images.unsplash.com/photo-1519818187420-8e49de7adeef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', array['https://images.unsplash.com/photo-1519818187420-8e49de7adeef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200'], '2026-11-01', '30 يوم', 194000, 'برنامج مميز من 1 إلى 30 نوفمبر مع فنادق مختارة وخدمة إرشاد ومرافقة كاملة.', 'الحاج نور الدين بوعلام، الأستاذة سهام عابد', 'Luxe', array['Vol','Hotel','Repas','Guide','Wifi','Paiement flexible'], 34, 19, 4.8);

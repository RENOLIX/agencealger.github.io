-- Horizons Voyages - schema Supabase
-- A coller dans Supabase SQL Editor, puis executer.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'employee');
create type public.travel_category as enum ('Plage', 'Aventure', 'Culture', 'Luxe');
create type public.benefit_key as enum ('Vol', 'Hotel', 'Repas', 'Guide', 'Spa', 'Wifi', 'Plage', 'Assurance');
create type public.reservation_status as enum ('Validee', 'En attente', 'Annulee');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  avatar text,
  created_at timestamptz not null default now()
);

create table public.travels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  country text not null,
  image_url text not null,
  departure_date date not null,
  duration text not null,
  price numeric(12,2) not null check (price >= 0),
  description text not null,
  category public.travel_category not null,
  benefits public.benefit_key[] not null default '{}',
  tickets_total integer not null check (tickets_total >= 0),
  tickets_left integer not null check (tickets_left >= 0),
  rating numeric(2,1) not null default 4.8,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_left_lte_total check (tickets_left <= tickets_total)
);

create table public.reservations (
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

create index reservations_employee_id_idx on public.reservations(employee_id);
create index reservations_travel_id_idx on public.reservations(travel_id);
create index travels_active_departure_idx on public.travels(active, departure_date);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', new.email), 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

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

  insert into public.reservations (
    travel_id,
    employee_id,
    client_name,
    client_phone,
    quantity,
    unit_price,
    status
  )
  values (
    p_travel_id,
    auth.uid(),
    p_client_name,
    p_client_phone,
    p_quantity,
    selected_travel.price,
    'Validee'
  )
  returning * into created_reservation;

  return created_reservation;
end;
$$;

alter table public.profiles enable row level security;
alter table public.travels enable row level security;
alter table public.reservations enable row level security;

create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "travels_public_read_active"
on public.travels for select
to anon, authenticated
using (active = true);

create policy "travels_admin_insert"
on public.travels for insert
to authenticated
with check (public.current_user_role() = 'admin');

create policy "travels_admin_update"
on public.travels for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "travels_admin_delete"
on public.travels for delete
to authenticated
using (public.current_user_role() = 'admin');

create policy "reservations_select_own_or_admin"
on public.reservations for select
to authenticated
using (employee_id = auth.uid() or public.current_user_role() = 'admin');

create policy "reservations_insert_employee"
on public.reservations for insert
to authenticated
with check (employee_id = auth.uid());

create policy "reservations_admin_update"
on public.reservations for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Donnees demo. Les profils reels se creent via Auth > Users.
insert into public.travels
  (name, destination, country, image_url, departure_date, duration, price, description, category, benefits, tickets_total, tickets_left, rating)
values
  ('Escapade Grecque', 'Santorini & Mykonos', 'Grece', 'https://images.unsplash.com/photo-1651610526505-a46802a4f2a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', '2026-06-15', '8 jours', 2490, 'Couchers de soleil, maisons blanches, criques privees et hotels elegants en bord de mer.', 'Plage', array['Vol','Hotel','Repas','Guide','Plage']::public.benefit_key[], 38, 24, 4.9),
  ('Bali Authentique', 'Ubud & Seminyak', 'Indonesie', 'https://images.unsplash.com/photo-1550232864-45ae019ae566?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', '2026-07-08', '12 jours', 3150, 'Temples, rizieres, villa privee et immersion douce dans la culture balinaise.', 'Culture', array['Vol','Hotel','Repas','Guide','Wifi']::public.benefit_key[], 30, 18, 4.8),
  ('Maldives Prestige', 'Atoll de Male', 'Maldives', 'https://images.unsplash.com/photo-1575231902142-29aaec0bd547?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', '2026-07-01', '7 jours', 4890, 'Bungalow sur l''eau, spa, lagon transparent et service ultra-personnalise.', 'Luxe', array['Vol','Hotel','Repas','Spa','Plage','Assurance']::public.benefit_key[], 16, 9, 5.0);

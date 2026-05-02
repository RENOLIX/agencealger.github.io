-- Agence Alger / Hamdi Voyage
-- Schema Supabase complet pour voyages, equipe, demandes de reservation,
-- voyageurs, pieces jointes et messages contact.

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
  create type public.reservation_status as enum ('Nouvelle', 'En etude', 'Confirmee', 'Annulee');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.passenger_type as enum ('adult', 'child');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'employee',
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.team_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_group_id uuid not null references public.team_groups(id) on delete cascade,
  full_name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.travels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  country text not null,
  image_url text not null,
  image_urls text[] not null default '{}',
  banner_url text not null,
  departure_date date not null,
  duration text not null,
  adult_price numeric(12,2) not null check (adult_price >= 0),
  child_price numeric(12,2) not null check (child_price >= 0),
  short_description text not null,
  long_description text not null,
  guides text[] not null default '{}',
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

create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  travel_id uuid not null references public.travels(id) on delete restrict,
  employee_id uuid references public.profiles(id) on delete set null,
  employee_name text not null default 'Demande site',
  customer_first_name text not null,
  customer_last_name text not null,
  customer_address text not null,
  customer_phone text not null,
  adults_count integer not null check (adults_count >= 0),
  children_count integer not null check (children_count >= 0),
  quantity integer not null check (quantity > 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  notes text,
  status public.reservation_status not null default 'Nouvelle',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservation_passengers (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservation_requests(id) on delete cascade,
  passenger_type public.passenger_type not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  birth_place text not null,
  birth_date date not null,
  passport_number text not null,
  passport_expiry date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_attachments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservation_requests(id) on delete cascade,
  file_name text not null,
  mime_type text not null,
  storage_path text not null unique,
  public_url text,
  created_at timestamptz not null default now()
);

create index if not exists team_members_group_idx on public.team_members(team_group_id, display_order);
create index if not exists travels_departure_idx on public.travels(active, departure_date);
create index if not exists reservation_requests_travel_idx on public.reservation_requests(travel_id);
create index if not exists reservation_requests_status_idx on public.reservation_requests(status);
create index if not exists reservation_passengers_reservation_idx on public.reservation_passengers(reservation_id);
create index if not exists reservation_attachments_reservation_idx on public.reservation_attachments(reservation_id);

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

drop trigger if exists reservation_requests_touch_updated_at on public.reservation_requests;
create trigger reservation_requests_touch_updated_at
before update on public.reservation_requests
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

create or replace function public.sync_confirmed_reservation_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seat_delta integer := 0;
begin
  if tg_op = 'INSERT' then
    if new.status = 'Confirmee' then
      seat_delta := new.quantity;
      update public.travels
      set tickets_left = tickets_left - seat_delta
      where id = new.travel_id and tickets_left >= seat_delta;

      if not found then
        raise exception 'Places insuffisantes pour confirmer cette reservation';
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status <> 'Confirmee' and new.status = 'Confirmee' then
      seat_delta := new.quantity;
      update public.travels
      set tickets_left = tickets_left - seat_delta
      where id = new.travel_id and tickets_left >= seat_delta;

      if not found then
        raise exception 'Places insuffisantes pour confirmer cette reservation';
      end if;
    elsif old.status = 'Confirmee' and new.status <> 'Confirmee' then
      update public.travels
      set tickets_left = tickets_left + old.quantity
      where id = old.travel_id;
    elsif old.status = 'Confirmee' and new.status = 'Confirmee' and old.quantity <> new.quantity then
      update public.travels
      set tickets_left = tickets_left + old.quantity - new.quantity
      where id = new.travel_id and tickets_left + old.quantity >= new.quantity;

      if not found then
        raise exception 'Impossible de modifier la quantite de cette reservation confirmee';
      end if;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    if old.status = 'Confirmee' then
      update public.travels
      set tickets_left = tickets_left + old.quantity
      where id = old.travel_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists reservation_stock_trigger on public.reservation_requests;
create trigger reservation_stock_trigger
after insert or update or delete on public.reservation_requests
for each row execute function public.sync_confirmed_reservation_stock();

alter table public.profiles enable row level security;
alter table public.team_groups enable row level security;
alter table public.team_members enable row level security;
alter table public.travels enable row level security;
alter table public.contact_messages enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.reservation_passengers enable row level security;
alter table public.reservation_attachments enable row level security;

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

drop policy if exists "team_groups_public_read" on public.team_groups;
create policy "team_groups_public_read"
on public.team_groups for select
to anon, authenticated
using (true);

drop policy if exists "team_groups_admin_write" on public.team_groups;
create policy "team_groups_admin_write"
on public.team_groups for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "team_members_public_read" on public.team_members;
create policy "team_members_public_read"
on public.team_members for select
to anon, authenticated
using (true);

drop policy if exists "team_members_admin_write" on public.team_members;
create policy "team_members_admin_write"
on public.team_members for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "travels_public_read_active" on public.travels;
create policy "travels_public_read_active"
on public.travels for select
to anon, authenticated
using (active = true);

drop policy if exists "travels_admin_insert" on public.travels;
create policy "travels_admin_insert"
on public.travels for insert
to anon, authenticated
with check (true);

drop policy if exists "travels_admin_update" on public.travels;
create policy "travels_admin_update"
on public.travels for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "travels_admin_delete" on public.travels;
create policy "travels_admin_delete"
on public.travels for delete
to anon, authenticated
using (true);

drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
on public.contact_messages for insert
to anon, authenticated
with check (true);

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
on public.contact_messages for select
to anon, authenticated
using (true);

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
on public.contact_messages for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "reservation_requests_insert_public" on public.reservation_requests;
create policy "reservation_requests_insert_public"
on public.reservation_requests for insert
to anon, authenticated
with check (true);

drop policy if exists "reservation_requests_admin_read" on public.reservation_requests;
create policy "reservation_requests_admin_read"
on public.reservation_requests for select
to anon, authenticated
using (true);

drop policy if exists "reservation_requests_admin_update" on public.reservation_requests;
create policy "reservation_requests_admin_update"
on public.reservation_requests for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "reservation_passengers_insert_public" on public.reservation_passengers;
create policy "reservation_passengers_insert_public"
on public.reservation_passengers for insert
to anon, authenticated
with check (true);

drop policy if exists "reservation_passengers_admin_read" on public.reservation_passengers;
create policy "reservation_passengers_admin_read"
on public.reservation_passengers for select
to anon, authenticated
using (true);

drop policy if exists "reservation_attachments_insert_public" on public.reservation_attachments;
create policy "reservation_attachments_insert_public"
on public.reservation_attachments for insert
to anon, authenticated
with check (true);

drop policy if exists "reservation_attachments_admin_read" on public.reservation_attachments;
create policy "reservation_attachments_admin_read"
on public.reservation_attachments for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('reservation-documents', 'reservation-documents', true)
on conflict (id) do nothing;

drop policy if exists "reservation_documents_public_upload" on storage.objects;
create policy "reservation_documents_public_upload"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'reservation-documents');

drop policy if exists "reservation_documents_public_read" on storage.objects;
create policy "reservation_documents_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'reservation-documents');

drop policy if exists "reservation_documents_admin_delete" on storage.objects;
create policy "reservation_documents_admin_delete"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'reservation-documents');

truncate table public.team_members restart identity cascade;
truncate table public.team_groups restart identity cascade;
truncate table public.reservation_attachments restart identity cascade;
truncate table public.reservation_passengers restart identity cascade;
truncate table public.reservation_requests restart identity cascade;
truncate table public.contact_messages restart identity cascade;
truncate table public.travels restart identity cascade;

insert into public.team_groups (id, title, display_order) values
  ('00000000-0000-0000-0000-000000000101', 'المدير العام للمجموعة', 1),
  ('00000000-0000-0000-0000-000000000102', 'مدراء الفروع', 2),
  ('00000000-0000-0000-0000-000000000103', 'مدراء الوكالات المناولة', 3),
  ('00000000-0000-0000-0000-000000000104', 'مرشد حج وعمرة', 4),
  ('00000000-0000-0000-0000-000000000105', 'موظف تسويق ومبيعات', 5),
  ('00000000-0000-0000-0000-000000000106', 'مرشد وممرض', 6),
  ('00000000-0000-0000-0000-000000000107', 'مرشد ديني وإمام', 7),
  ('00000000-0000-0000-0000-000000000108', 'مشرف إعاشة وإطعام', 8),
  ('00000000-0000-0000-0000-000000000109', 'مشرف سيستم عمرة', 9),
  ('00000000-0000-0000-0000-000000000110', 'مشرف مطار وتركيب', 10),
  ('00000000-0000-0000-0000-000000000111', 'مساعد مرشد', 11),
  ('00000000-0000-0000-0000-000000000112', 'متربص بالمعهد والوكالة', 12),
  ('00000000-0000-0000-0000-000000000113', 'مشرف عام للسياحة', 13);

insert into public.team_members (team_group_id, full_name, display_order) values
  ('00000000-0000-0000-0000-000000000101', 'حمدي نبيل', 1),
  ('00000000-0000-0000-0000-000000000102', 'شلغوم عبد القادر - قصر البخاري', 1),
  ('00000000-0000-0000-0000-000000000102', 'حماني محمد - الرغاية', 2),
  ('00000000-0000-0000-0000-000000000102', 'العمري كمال - البرواقية', 3),
  ('00000000-0000-0000-0000-000000000102', 'رضا قنان - خميس الخشنة', 4),
  ('00000000-0000-0000-0000-000000000102', 'عبد الحميد قسول - العطاف', 5),
  ('00000000-0000-0000-0000-000000000102', 'عبد الحميد تعوينات - بجاية', 6),
  ('00000000-0000-0000-0000-000000000103', 'امين فريحة - فريحة', 1),
  ('00000000-0000-0000-0000-000000000103', 'كمال قرمي - البراق', 2),
  ('00000000-0000-0000-0000-000000000103', 'عجاج عبد العزيز - عجاج', 3),
  ('00000000-0000-0000-0000-000000000103', 'على لحمر جمال - صفانا', 4),
  ('00000000-0000-0000-0000-000000000103', 'عماد الدين أكليل - أمجد', 5),
  ('00000000-0000-0000-0000-000000000104', 'كمال رايب', 1),
  ('00000000-0000-0000-0000-000000000104', 'مهدي عجرود', 2),
  ('00000000-0000-0000-0000-000000000104', 'حامي إبراهيم', 3),
  ('00000000-0000-0000-0000-000000000104', 'بويعلة إبراهيم', 4),
  ('00000000-0000-0000-0000-000000000104', 'ناصر صغير', 5),
  ('00000000-0000-0000-0000-000000000104', 'تجني إبراهيم', 6),
  ('00000000-0000-0000-0000-000000000104', 'دحون حمزة', 7),
  ('00000000-0000-0000-0000-000000000104', 'طاهر هني', 8),
  ('00000000-0000-0000-0000-000000000104', 'رعاد نوفل', 9),
  ('00000000-0000-0000-0000-000000000104', 'ضيف شرف', 10),
  ('00000000-0000-0000-0000-000000000104', 'عيسى التير', 11),
  ('00000000-0000-0000-0000-000000000104', 'مصعب هني', 12),
  ('00000000-0000-0000-0000-000000000104', 'العربي شلف', 13),
  ('00000000-0000-0000-0000-000000000104', 'خليفة حسين', 14),
  ('00000000-0000-0000-0000-000000000104', 'عبد العزيز حيدة', 15),
  ('00000000-0000-0000-0000-000000000104', 'محند غدو الطيب', 16),
  ('00000000-0000-0000-0000-000000000104', 'بوشملة عبد الله', 17),
  ('00000000-0000-0000-0000-000000000105', 'عيسى العمري', 1),
  ('00000000-0000-0000-0000-000000000105', 'ايوب أحمد ناصر', 2),
  ('00000000-0000-0000-0000-000000000105', 'حسام الدين شلغوم', 3),
  ('00000000-0000-0000-0000-000000000105', 'حسين لعور', 4),
  ('00000000-0000-0000-0000-000000000106', 'عبد المالك بوقادة', 1),
  ('00000000-0000-0000-0000-000000000106', 'قنان عز الدين', 2),
  ('00000000-0000-0000-0000-000000000106', 'خالد عايس', 3),
  ('00000000-0000-0000-0000-000000000106', 'بن عيشة محمد', 4),
  ('00000000-0000-0000-0000-000000000107', 'المحفوظ بن صدقة', 1),
  ('00000000-0000-0000-0000-000000000107', 'السعيد دباح', 2),
  ('00000000-0000-0000-0000-000000000108', 'عمر درموش', 1),
  ('00000000-0000-0000-0000-000000000109', 'بن سرحان مروان', 1),
  ('00000000-0000-0000-0000-000000000110', 'محروق محي الدين', 1),
  ('00000000-0000-0000-0000-000000000111', 'سمير التير', 1),
  ('00000000-0000-0000-0000-000000000111', 'عبد القادر سياح', 2),
  ('00000000-0000-0000-0000-000000000112', 'بركي زكرياء', 1),
  ('00000000-0000-0000-0000-000000000113', 'عبد المحيد عمير', 1);

insert into public.travels
  (name, destination, country, image_url, image_urls, banner_url, departure_date, duration, adult_price, child_price, short_description, long_description, guides, category, benefits, tickets_total, tickets_left, rating)
values
  ('عمرة شهر يونيو', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-06-01', '30 يوم', 185000, 145000, 'برنامج كامل من 1 إلى 30 يونيو يشمل الإقامة قرب الحرم، النقل، والمتابعة اليومية.', 'رحلة عمرة متكاملة مصممة لتمنح المسافرين تجربة واضحة ومريحة من لحظة التسجيل حتى العودة. يشمل البرنامج فندقا مختارا، استقبال المطار، تنقلات ميدانية، متابعة إدارية، ومرافقة من فريق الوكالة.', array['كمال رايب','مهدي عجرود','حامي إبراهيم'], 'Culture', array['Vol','Hotel','Repas','Guide','Transfert','Assurance'], 45, 31, 4.9),
  ('عمرة شهر يوليو', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/18274181/pexels-photo-18274181.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-07-01', '30 يوم', 189000, 149000, 'رحلة منظمة من 1 إلى 30 يوليو مع مرشدين مرافقين وخدمة متابعة للحجاج والمعتمرين.', 'هذا البرنامج مناسب للمعتمرين الذين يريدون رحلة ثابتة ومهيكلة مع عدد مقاعد مدروس. تتكفل الوكالة بالمتابعة قبل السفر وبعد الوصول مع فريق مرشدين معروفين داخل المجموعة.', array['ناصر صغير','تجني إبراهيم','دحون حمزة'], 'Culture', array['Vol','Hotel','Repas','Guide','Wifi','Transfert'], 40, 22, 4.8),
  ('عمرة شهر أغسطس', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/34959945/pexels-photo-34959945.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-08-01', '30 يوم', 192000, 152000, 'إقامة مريحة من 1 إلى 30 أغسطس، تنقلات جماعية، ومرافقة إدارية طوال الرحلة.', 'برنامج أغسطس موجه لمن يريد مستوى راحة أعلى داخل الرحلة مع تنظيم محكم وخدمات مريحة للعائلات. جميع التفاصيل الأساسية واضحة من البداية داخل صفحة الحجز.', array['طاهر هني','رعاد نوفل','عيسى التير'], 'Luxe', array['Vol','Hotel','Repas','Guide','Climatisation','Assurance'], 36, 14, 5.0),
  ('عمرة شهر سبتمبر', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/35315914/pexels-photo-35315914.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-09-01', '30 يوم', 179000, 139000, 'برنامج اقتصادي من 1 إلى 30 سبتمبر مع خدمات أساسية منظمة وقريبة من احتياجات العائلات.', 'رحلة اقتصادية منظمة بعناية مع الحفاظ على العناصر الأساسية التي يحتاجها المسافر. مناسبة لمن يريد سعرا مضبوطا مع متابعة جدية من الوكالة.', array['مصعب هني','العربي شلف','خليفة حسين'], 'Aventure', array['Vol','Hotel','Guide','Transfert','Bagages'], 50, 37, 4.7),
  ('عمرة شهر أكتوبر', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/34959936/pexels-photo-34959936.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-10-01', '30 يوم', 187000, 147000, 'رحلة من 1 إلى 30 أكتوبر تجمع بين التنظيم الهادئ والإرشاد الديني والمتابعة اليومية.', 'صيغ هذا البرنامج ليعطي توازنا جيدا بين السعر والخدمات والهدوء في التنظيم. يظهر في صفحة الحجز كل ما يحتاجه الموظف لتجهيز ملف العميل بطريقة مرتبة.', array['عبد العزيز حيدة','محند غدو الطيب','بوشملة عبد الله'], 'Culture', array['Vol','Hotel','Repas','Guide','Wifi','Assurance'], 42, 26, 4.9),
  ('عمرة شهر نوفمبر', 'مكة المكرمة', 'السعودية', 'https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400', array['https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1400','https://images.pexels.com/photos/32525647/pexels-photo-32525647.jpeg?auto=compress&cs=tinysrgb&w=1400'], 'https://images.pexels.com/photos/28209449/pexels-photo-28209449.jpeg?auto=compress&cs=tinysrgb&w=1920', '2026-11-01', '30 يوم', 194000, 154000, 'برنامج مميز من 1 إلى 30 نوفمبر مع فنادق مختارة وخدمة إرشاد ومرافقة كاملة.', 'برنامج نوفمبر يقدم مستوى أعلى من الراحة والخدمة مع مساحات أوسع لتنظيم الطلبات الكبيرة والملفات العائلية، ويظهر كل شيء بوضوح داخل طلب الحجز.', array['عبد المالك بوقادة','قنان عز الدين','خالد عايس'], 'Luxe', array['Vol','Hotel','Repas','Guide','Wifi','Paiement flexible'], 34, 19, 4.8);

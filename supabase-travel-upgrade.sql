alter table public.travels
  add column if not exists departures date[] default '{}',
  add column if not exists exit_city text default 'جدة',
  add column if not exists guides text[] default '{}'::text[],
  add column if not exists baby_price numeric(12,2),
  add column if not exists commission numeric(12,2) default 0,
  add column if not exists room_prices jsonb default '{"single":0,"double":0,"triple":0,"quad":0,"quint":0,"sext":0}'::jsonb,
  add column if not exists has_child_price boolean default true,
  add column if not exists has_baby_price boolean default false,
  add column if not exists hotels jsonb default '[]'::jsonb,
  add column if not exists flight_mode text default 'direct',
  add column if not exists airlines text[] default '{"Air Algerie"}';

alter table public.reservation_requests
  add column if not exists babies_count integer not null default 0,
  add column if not exists trashed_at timestamptz,
  add column if not exists trashed_by text,
  add column if not exists trash_reason text;

create index if not exists reservation_requests_trashed_at_idx
  on public.reservation_requests (trashed_at);

create table if not exists public.guide_cost_settings (
  id text primary key,
  guide_ticket_cost numeric(12,2) not null default 30000,
  visa_cost numeric(12,2) not null default 0,
  expense_cost numeric(12,2) not null default 100000,
  medina_bed_cost numeric(12,2) not null default 19520,
  mecca_bed_cost numeric(12,2) not null default 10980,
  updated_at timestamptz not null default now()
);

insert into public.guide_cost_settings (
  id,
  guide_ticket_cost,
  visa_cost,
  expense_cost,
  medina_bed_cost,
  mecca_bed_cost
)
values (
  'default',
  30000,
  0,
  100000,
  19520,
  10980
)
on conflict (id) do nothing;

create table if not exists public.hotel_cost_settings (
  id text primary key,
  title text not null default 'فندق 01 بيعد 300',
  mecca_sar numeric(12,2) not null default 90,
  medina_sar numeric(12,2) not null default 400,
  visa_sar numeric(12,2) not null default 565,
  diwan_dzd numeric(12,2) not null default 2500,
  ticket_dzd numeric(12,2) not null default 76000,
  gift_dzd numeric(12,2) not null default 1800,
  food_dzd numeric(12,2) not null default 0,
  guide_dzd numeric(12,2) not null default 3275.51,
  exchange_rate numeric(12,2) not null default 61,
  seats_count integer not null default 50,
  mecca_nights integer not null default 10,
  medina_nights integer not null default 4,
  updated_at timestamptz not null default now()
);

insert into public.hotel_cost_settings (
  id,
  title,
  mecca_sar,
  medina_sar,
  visa_sar,
  diwan_dzd,
  ticket_dzd,
  gift_dzd,
  food_dzd,
  guide_dzd,
  exchange_rate,
  seats_count,
  mecca_nights,
  medina_nights
)
values (
  'default',
  'فندق 01 بيعد 300',
  90,
  400,
  565,
  2500,
  76000,
  1800,
  0,
  3275.51,
  61,
  50,
  10,
  4
)
on conflict (id) do nothing;

update public.hotel_cost_settings h
set guide_dzd = case
  when coalesce(h.seats_count, 0) <= 0 then 0
  else (
    select round((
      coalesce(g.guide_ticket_cost, 0) +
      coalesce(g.visa_cost, 0) +
      coalesce(g.expense_cost, 0) +
      coalesce(g.medina_bed_cost, 0) +
      coalesce(g.mecca_bed_cost, 0)
    ) / h.seats_count, 2)
    from public.guide_cost_settings g
    where g.id = 'default'
  )
end
where h.id = 'default';

do $$
declare
  guides_udt text;
begin
  select columns.udt_name
  into guides_udt
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'travels'
    and column_name = 'guides';

  if guides_udt is null then
    execute 'alter table public.travels add column guides text[] default ''{}''::text[]';
  elsif guides_udt <> '_text' then
    execute 'alter table public.travels add column if not exists guides_fixed text[] default ''{}''::text[]';
    execute $sql$
      update public.travels
      set guides_fixed = case
        when guides is null then '{}'::text[]
        when btrim(guides::text) = '' then '{}'::text[]
        when left(btrim(guides::text), 1) = '[' then (
          select coalesce(array_agg(value), '{}'::text[])
          from jsonb_array_elements_text(guides::jsonb) as value
        )
        when left(btrim(guides::text), 1) = '{' then (
          select coalesce(array_agg(nullif(btrim(item, ' "'), '')), '{}'::text[])
          from unnest(string_to_array(trim(both '{}' from guides::text), ',')) as item
        )
        else array[guides::text]
      end
    $sql$;
    execute 'alter table public.travels drop column guides';
    execute 'alter table public.travels rename column guides_fixed to guides';
  else
    execute $sql$
      update public.travels
      set guides = coalesce((
        select array_agg(trim(item))
        from unnest(guides) as item
        where trim(item) <> ''
      ), '{}'::text[])
    $sql$;
  end if;
end $$;

update public.travels
set
  destination = case
    when destination = 'مكة المكرمة' then 'جدة'
    when destination = 'المدينة' then 'المدينة المنورة'
    else coalesce(destination, 'جدة')
  end,
  exit_city = coalesce(nullif(exit_city, ''), 'جدة'),
  guides = coalesce(guides, '{}'::text[]),
  departures = coalesce(departures, array[coalesce(departure_date, current_date)]),
  commission = coalesce(commission, 0),
  has_child_price = coalesce(has_child_price, true),
  has_baby_price = coalesce(has_baby_price, false),
  room_prices = coalesce(room_prices, jsonb_build_object(
    'single', coalesce(adult_price, price, 0),
    'double', coalesce(adult_price, price, 0),
    'triple', coalesce(adult_price, price, 0),
    'quad', coalesce(adult_price, price, 0),
    'quint', coalesce(adult_price, price, 0),
    'sext', coalesce(adult_price, price, 0)
  )),
  hotels = coalesce(hotels, '[]'::jsonb),
  flight_mode = coalesce(flight_mode, 'direct'),
  airlines = coalesce(airlines, '{"Air Algerie"}')
where true;

alter table public.travels
  alter column departures set default '{}',
  alter column departures set not null,
  alter column exit_city set default 'جدة',
  alter column exit_city set not null,
  alter column guides set default '{}'::text[],
  alter column guides set not null,
  alter column commission set default 0,
  alter column commission set not null,
  alter column room_prices set default '{"single":0,"double":0,"triple":0,"quad":0,"quint":0,"sext":0}'::jsonb,
  alter column room_prices set not null,
  alter column has_child_price set default true,
  alter column has_child_price set not null,
  alter column has_baby_price set default false,
  alter column has_baby_price set not null,
  alter column hotels set default '[]'::jsonb,
  alter column hotels set not null,
  alter column flight_mode set default 'direct',
  alter column flight_mode set not null,
  alter column airlines set default '{"Air Algerie"}',
  alter column airlines set not null;

alter table public.travels
  drop constraint if exists travels_flight_mode_check;

alter table public.travels
  add constraint travels_flight_mode_check
  check (flight_mode in ('direct', 'escale'));

do $$
begin
  alter type public.passenger_type add value if not exists 'baby';
exception
  when undefined_object then null;
end $$;

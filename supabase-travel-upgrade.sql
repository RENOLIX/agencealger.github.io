alter table public.travels
  add column if not exists departures date[] default '{}',
  add column if not exists exit_city text default 'مكة المكرمة',
  add column if not exists guides text[] default '{}',
  add column if not exists baby_price numeric(12,2),
  add column if not exists commission numeric(12,2) default 0,
  add column if not exists room_prices jsonb default '{"double":0,"triple":0,"quad":0,"quint":0}'::jsonb,
  add column if not exists has_child_price boolean default true,
  add column if not exists has_baby_price boolean default false,
  add column if not exists hotels jsonb default '[]'::jsonb,
  add column if not exists flight_mode text default 'direct',
  add column if not exists airlines text[] default '{"Air Algerie"}';

update public.travels
set
  destination = case
    when destination = 'مكة المكرمة' then 'جدة'
    when destination = 'المدينة' then 'المدينة المنورة'
    else coalesce(destination, 'جدة')
  end,
  exit_city = coalesce(nullif(exit_city, ''), 'مكة المكرمة'),
  guides = coalesce(guides, '{}'),
  departures = coalesce(departures, array[coalesce(departure_date, current_date)]),
  commission = coalesce(commission, 0),
  has_child_price = coalesce(has_child_price, true),
  has_baby_price = coalesce(has_baby_price, false),
  room_prices = coalesce(room_prices, jsonb_build_object(
    'double', coalesce(adult_price, price, 0),
    'triple', coalesce(adult_price, price, 0),
    'quad', coalesce(adult_price, price, 0),
    'quint', coalesce(adult_price, price, 0)
  )),
  hotels = coalesce(hotels, '[]'::jsonb),
  flight_mode = coalesce(flight_mode, 'direct'),
  airlines = coalesce(airlines, '{"Air Algerie"}')
where true;

alter table public.travels
  alter column departures set default '{}',
  alter column departures set not null,
  alter column exit_city set default 'مكة المكرمة',
  alter column exit_city set not null,
  alter column guides set default '{}',
  alter column guides set not null,
  alter column commission set default 0,
  alter column commission set not null,
  alter column room_prices set default '{"double":0,"triple":0,"quad":0,"quint":0}'::jsonb,
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

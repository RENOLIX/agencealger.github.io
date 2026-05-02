alter table public.travels
  add column if not exists departures date[] default '{}',
  add column if not exists baby_price numeric(12,2),
  add column if not exists has_child_price boolean default true,
  add column if not exists has_baby_price boolean default false,
  add column if not exists hotels jsonb default '[]'::jsonb,
  add column if not exists flight_mode text default 'direct',
  add column if not exists airlines text[] default '{"Air Algérie"}';

update public.travels
set
  departures = coalesce(departures, array[coalesce(departure_date, current_date)]),
  has_child_price = coalesce(has_child_price, true),
  has_baby_price = coalesce(has_baby_price, false),
  hotels = coalesce(hotels, '[]'::jsonb),
  flight_mode = coalesce(flight_mode, 'direct'),
  airlines = coalesce(airlines, '{"Air Algérie"}')
where true;

alter table public.travels
  alter column departures set default '{}',
  alter column departures set not null,
  alter column has_child_price set default true,
  alter column has_child_price set not null,
  alter column has_baby_price set default false,
  alter column has_baby_price set not null,
  alter column hotels set default '[]'::jsonb,
  alter column hotels set not null,
  alter column flight_mode set default 'direct',
  alter column flight_mode set not null,
  alter column airlines set default '{"Air Algérie"}',
  alter column airlines set not null;

alter table public.travels
  add constraint travels_flight_mode_check
  check (flight_mode in ('direct', 'escale'));

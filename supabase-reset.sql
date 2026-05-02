-- ATTENTION
-- Ce script supprime les tables/types de cette application dans Supabase.
-- A utiliser seulement si tu n'as pas encore de vraies donnees a conserver.

drop trigger if exists reservation_stock_trigger on public.reservation_requests;
drop trigger if exists reservation_requests_touch_updated_at on public.reservation_requests;
drop trigger if exists travels_touch_updated_at on public.travels;
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.sync_confirmed_reservation_stock() cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.current_user_role() cascade;
drop function if exists public.handle_new_user() cascade;

drop table if exists public.reservation_attachments cascade;
drop table if exists public.reservation_passengers cascade;
drop table if exists public.reservation_requests cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.travels cascade;
drop table if exists public.team_members cascade;
drop table if exists public.team_groups cascade;
drop table if exists public.profiles cascade;

drop type if exists public.reservation_status cascade;
drop type if exists public.passenger_type cascade;
drop type if exists public.travel_category cascade;
drop type if exists public.app_role cascade;

delete from storage.objects where bucket_id = 'reservation-documents';
delete from storage.buckets where id = 'reservation-documents';

-- ISH Orleans - Timetable image schema
-- Compatible with the Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.timetable_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists timetable_images_published_created_idx
on public.timetable_images(is_published, created_at desc);

drop trigger if exists set_timetable_images_updated_at on public.timetable_images;
create trigger set_timetable_images_updated_at
before update on public.timetable_images
for each row execute function public.set_updated_at();

alter table public.timetable_images enable row level security;

create policy "visitors can read published timetable images"
on public.timetable_images for select
using (is_published = true);

-- Temporary policy matching the current local admin session model.
-- Tighten this when the admin area uses Supabase Auth.
create policy "site client can manage timetable images"
on public.timetable_images for all
using (true)
with check (true);

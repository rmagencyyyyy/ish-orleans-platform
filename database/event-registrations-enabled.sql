-- ISH Orleans - Enable/disable public registrations per event.
-- Compatible with the Supabase SQL Editor.

alter table public.events
  add column if not exists registrations_enabled boolean default true;

update public.events
set registrations_enabled = true
where registrations_enabled is null;

drop policy if exists "visitors can register to events"
on public.event_registrations;

create policy "visitors can register to events"
on public.event_registrations for insert
with check (
  exists (
    select 1
    from public.events
    where events.id = event_id
      and events.status in ('Ouvert', 'open', 'published')
      and events.is_published = true
      and events.registrations_enabled = true
  )
);

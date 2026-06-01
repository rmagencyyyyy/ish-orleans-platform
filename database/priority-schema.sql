-- ISH Orleans - Priority flag for public content
-- Compatible with the Supabase SQL Editor.

alter table public.news
  add column if not exists is_priority boolean default false;

alter table public.events
  add column if not exists is_priority boolean default false;

create index if not exists news_priority_published_at_idx
on public.news(is_priority, published_at);

create index if not exists events_priority_date_idx
on public.events(is_priority, date);

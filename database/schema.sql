-- ISH Orleans - Supabase schema
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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  role text check (role in ('admin', 'teacher')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  birth_date date,
  age integer,
  birth_place text,
  nationality text,
  legal_guardian text,
  relationship text,
  address text,
  postal_code text,
  city text,
  phone1 text,
  phone2 text,
  email text,
  status text default 'En attente',
  assignment_status text default 'Non affecté',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.registration_courses (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references public.registrations(id) on delete cascade,
  subject text,
  level text,
  public_type text,
  availability_type text,
  available_days jsonb default '[]'::jsonb,
  preferred_time text,
  planning text,
  group_key text,
  assignment_status text default 'Non affecté',
  assigned_class_id uuid,
  assigned_class_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text,
  subject text,
  level text,
  public_type text,
  availability_type text,
  days jsonb default '[]'::jsonb,
  preferred_time text,
  start_time time,
  end_time time,
  teacher_id uuid references public.profiles(id),
  teacher_name text,
  room text,
  max_students integer default 15,
  creation_mode text,
  source_pre_group_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.registration_courses
  add constraint registration_courses_assigned_class_id_fkey
  foreign key (assigned_class_id) references public.classes(id) on delete set null;

create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete cascade,
  registration_course_id uuid references public.registration_courses(id) on delete cascade,
  created_at timestamptz default now(),
  unique (class_id, registration_course_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text,
  date date,
  start_time time,
  end_time time,
  location text,
  max_participants integer,
  status text default 'Ouvert',
  is_published boolean default true,
  is_priority boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.events
  add column if not exists image_url text,
  add column if not exists is_published boolean default true,
  add column if not exists is_priority boolean default false,
  add column if not exists sort_order integer default 0;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text,
  status text default 'Publiée',
  is_published boolean default true,
  is_priority boolean default false,
  published_at date,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.news
  add column if not exists is_published boolean default true,
  add column if not exists is_priority boolean default false,
  add column if not exists sort_order integer default 0;

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  first_name text,
  last_name text,
  age integer,
  phone text,
  email text,
  created_at timestamptz default now()
);

alter table public.event_registrations
  add column if not exists phone text,
  add column if not exists email text;

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  category text,
  image_url text,
  is_published boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gallery_images
  add column if not exists sort_order integer default 0;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text,
  age_range text,
  description text,
  sort_order integer default 0,
  order_index integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.programs
  add column if not exists age_range text,
  add column if not exists order_index integer default 0;

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.registrations(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  date date,
  status text,
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.registrations(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete cascade,
  subject text,
  evaluation_title text,
  grade numeric,
  max_grade numeric,
  coefficient numeric default 1,
  appreciation text,
  date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique,
  value jsonb,
  updated_at timestamptz default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists registrations_status_idx on public.registrations(status);
create index if not exists registrations_email_idx on public.registrations(email);
create index if not exists registration_courses_registration_id_idx on public.registration_courses(registration_id);
create index if not exists registration_courses_group_key_idx on public.registration_courses(group_key);
create index if not exists registration_courses_assignment_status_idx on public.registration_courses(assignment_status);
create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
create index if not exists classes_subject_level_idx on public.classes(subject, level);
create index if not exists class_students_class_id_idx on public.class_students(class_id);
create index if not exists class_students_registration_id_idx on public.class_students(registration_id);
create index if not exists class_students_registration_course_id_idx on public.class_students(registration_course_id);
create index if not exists events_status_date_idx on public.events(status, date);
create index if not exists events_published_sort_idx on public.events(is_published, sort_order);
create index if not exists events_priority_date_idx on public.events(is_priority, date);
create index if not exists news_status_published_at_idx on public.news(status, published_at);
create index if not exists news_published_sort_idx on public.news(is_published, sort_order);
create index if not exists news_priority_published_at_idx on public.news(is_priority, published_at);
create index if not exists event_registrations_event_id_idx on public.event_registrations(event_id);
create index if not exists gallery_images_published_idx on public.gallery_images(is_published);
create index if not exists gallery_images_published_sort_idx on public.gallery_images(is_published, sort_order);
create index if not exists programs_published_sort_idx on public.programs(is_published, sort_order);
create index if not exists attendance_teacher_class_idx on public.attendance(teacher_id, class_id);
create index if not exists attendance_student_id_idx on public.attendance(student_id);
create index if not exists student_grades_teacher_class_idx on public.student_grades(teacher_id, class_id);
create index if not exists student_grades_student_id_idx on public.student_grades(student_id);
create index if not exists settings_key_idx on public.settings(key);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_registrations_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create trigger set_registration_courses_updated_at
before update on public.registration_courses
for each row execute function public.set_updated_at();

create trigger set_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_news_updated_at
before update on public.news
for each row execute function public.set_updated_at();

create trigger set_gallery_images_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

create trigger set_programs_updated_at
before update on public.programs
for each row execute function public.set_updated_at();

create trigger set_attendance_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

create trigger set_student_grades_updated_at
before update on public.student_grades
for each row execute function public.set_updated_at();

create trigger set_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = required_role
      and is_active = true
  );
$$;

create or replace function public.is_teacher_for_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes
    where id = target_class_id
      and teacher_id = auth.uid()
  );
$$;

create or replace function public.is_teacher_for_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_students cs
    join public.classes c on c.id = cs.class_id
    where cs.registration_id = target_student_id
      and c.teacher_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_courses enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.events enable row level security;
alter table public.news enable row level security;
alter table public.event_registrations enable row level security;
alter table public.gallery_images enable row level security;
alter table public.programs enable row level security;
alter table public.attendance enable row level security;
alter table public.student_grades enable row level security;
alter table public.settings enable row level security;

create policy "admins can manage profiles"
on public.profiles for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "visitors can create registrations"
on public.registrations for insert
with check (true);

create policy "admins can manage registrations"
on public.registrations for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read students in their classes"
on public.registrations for select
using (public.is_teacher_for_student(id));

create policy "visitors can create registration courses"
on public.registration_courses for insert
with check (true);

create policy "admins can manage registration courses"
on public.registration_courses for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read courses for their students"
on public.registration_courses for select
using (public.is_teacher_for_student(registration_id));

create policy "admins can manage classes"
on public.classes for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read own classes"
on public.classes for select
using (teacher_id = auth.uid());

create policy "admins can manage class students"
on public.class_students for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read own class students"
on public.class_students for select
using (public.is_teacher_for_class(class_id));

create policy "visitors can read open events"
on public.events for select
using (is_published = true);

create policy "admins can manage events"
on public.events for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "site client can manage events"
on public.events for all
using (true)
with check (true);

create policy "visitors can read published news"
on public.news for select
using (is_published = true and status = 'Publiée');

create policy "admins can manage news"
on public.news for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "site client can manage news"
on public.news for all
using (true)
with check (true);

create policy "visitors can register to events"
on public.event_registrations for insert
with check (
  exists (
    select 1
    from public.events
    where events.id = event_id
      and events.status = 'Ouvert'
      and events.is_published = true
  )
);

create policy "admins can manage event registrations"
on public.event_registrations for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "site client can manage event registrations"
on public.event_registrations for all
using (true)
with check (true);

create policy "visitors can read published gallery images"
on public.gallery_images for select
using (is_published = true);

create policy "admins can manage gallery images"
on public.gallery_images for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "site client can manage gallery images"
on public.gallery_images for all
using (true)
with check (true);

create policy "visitors can read published programs"
on public.programs for select
using (is_published = true);

create policy "admins can manage programs"
on public.programs for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "site client can manage programs"
on public.programs for all
using (true)
with check (true);

create policy "admins can manage attendance"
on public.attendance for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read own attendance"
on public.attendance for select
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can create own attendance"
on public.attendance for insert
with check (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can update own attendance"
on public.attendance for update
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id))
with check (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can delete own attendance"
on public.attendance for delete
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "admins can manage student grades"
on public.student_grades for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "teachers can read own student grades"
on public.student_grades for select
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can create own student grades"
on public.student_grades for insert
with check (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can update own student grades"
on public.student_grades for update
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id))
with check (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "teachers can delete own student grades"
on public.student_grades for delete
using (teacher_id = auth.uid() and public.is_teacher_for_class(class_id));

create policy "admins can manage settings"
on public.settings for all
using (public.has_role('admin'))
with check (public.has_role('admin'));

create policy "public can read settings"
on public.settings for select
using (true);

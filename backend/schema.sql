-- ASHI POLYTECHNIC PORTAL
-- Supabase PostgreSQL schema for authentication-linked records and document metadata.

create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('admission','handbook','fees','forms','timetable','other')),
  file_name text not null,
  r2_key text not null unique,
  mime_type text not null default 'application/pdf',
  file_size bigint not null default 0,
  visibility text not null default 'authorized' check (visibility in ('public','authorized','admin')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_category_idx on public.documents(category);
create index if not exists documents_created_at_idx on public.documents(created_at desc);

alter table public.documents enable row level security;

-- Public website can list only public documents. Authorized users are checked by the API.
drop policy if exists documents_public_read on public.documents;
create policy documents_public_read on public.documents
  for select using (visibility = 'public');

-- These tables are prepared for the wider portal build.
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  matric_no text unique,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  department text,
  level text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  staff_no text unique,
  first_name text not null,
  last_name text not null,
  email text,
  role text not null default 'staff',
  department text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  application_no text unique not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  programme text,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applicants(id) on delete cascade,
  programme text,
  session text,
  status text default 'submitted',
  created_at timestamptz default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete cascade,
  session text not null,
  semester text not null,
  course_code text not null,
  score numeric(5,2),
  grade text,
  created_at timestamptz default now()
);

-- Admin authorization: add an auth user id to this table after creating the admin account.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

drop policy if exists admin_self_read on public.admin_users;
create policy admin_self_read on public.admin_users
  for select using (user_id = auth.uid());

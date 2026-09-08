-- Ashi Polytechnic portal backend foundation
-- Safe for the seven existing tables: only adds missing columns/indexes/policies.

begin;

alter table public.applicants add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.applicants add column if not exists full_name text;
alter table public.applicants add column if not exists email text;
alter table public.applicants add column if not exists phone text;
alter table public.applicants add column if not exists programme text;

alter table public.applications add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.applications add column if not exists status text default 'submitted';

alter table public.documents add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.documents add column if not exists storage_path text;

alter table public.students add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.students add column if not exists email text;

alter table public.staff add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.staff add column if not exists email text;

alter table public.admin_users add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.admin_users add column if not exists email text;

alter table public.results add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;
alter table public.results add column if not exists is_public boolean default false;

create index if not exists applicants_auth_user_id_idx on public.applicants(auth_user_id);
create index if not exists applications_auth_user_id_idx on public.applications(auth_user_id);
create index if not exists documents_auth_user_id_idx on public.documents(auth_user_id);
create index if not exists students_auth_user_id_idx on public.students(auth_user_id);
create index if not exists staff_auth_user_id_idx on public.staff(auth_user_id);
create index if not exists admin_users_auth_user_id_idx on public.admin_users(auth_user_id);
create index if not exists results_auth_user_id_idx on public.results(auth_user_id);

alter table public.applicants enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.students enable row level security;
alter table public.staff enable row level security;
alter table public.admin_users enable row level security;
alter table public.results enable row level security;

create policy "Applicants can view their own record"
on public.applicants for select to authenticated
using (auth_user_id = auth.uid());

create policy "Applicants can create their own record"
on public.applicants for insert to authenticated
with check (auth_user_id = auth.uid());

create policy "Applicants can update their own record"
on public.applicants for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "Applicants can view their applications"
on public.applications for select to authenticated
using (auth_user_id = auth.uid());

create policy "Applicants can create their applications"
on public.applications for insert to authenticated
with check (auth_user_id = auth.uid());

create policy "Applicants can view their documents"
on public.documents for select to authenticated
using (auth_user_id = auth.uid());

create policy "Applicants can create their documents"
on public.documents for insert to authenticated
with check (auth_user_id = auth.uid());

create policy "Students can view their record"
on public.students for select to authenticated
using (auth_user_id = auth.uid());

create policy "Staff can view their record"
on public.staff for select to authenticated
using (auth_user_id = auth.uid());

create policy "Admins can view their record"
on public.admin_users for select to authenticated
using (auth_user_id = auth.uid());

create policy "Students can view their results"
on public.results for select to authenticated
using (auth_user_id = auth.uid() or is_public = true);

create policy "Public can view published results"
on public.results for select to anon
using (is_public = true);

commit;

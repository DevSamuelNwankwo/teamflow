-- TeamFlow initial schema
-- Single shared workspace model: every authenticated user is a team member and can see
-- all projects/tasks (see README "Architecture" section for the trade-offs this implies).
-- Apply via the Supabase SQL editor or `supabase db push`.

-- ── ENUM TYPES ────────────────────────────────────────────────────────────
create type project_status as enum ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED');
create type task_status    as enum ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED');
create type priority_level as enum ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
create type member_status  as enum ('ACTIVE', 'INVITED', 'INACTIVE');

-- ── PROFILES (merges "User" + "TeamMember" — see README) ─────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  avatar_url  text,
  role        text not null default 'Member',
  status      member_status not null default 'ACTIVE',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── PROJECTS ────────────────────────────────────────────────────────────
create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  status      project_status not null default 'PLANNING',
  priority    priority_level not null default 'MEDIUM',
  start_date  date not null,
  due_date    date not null,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint due_after_start check (due_date >= start_date)
);

-- ── PROJECT_MEMBERS (assignment join table) ───────────────────────────────
create table project_members (
  project_id uuid not null references projects(id) on delete cascade,
  member_id  uuid not null references profiles(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (project_id, member_id)
);

-- ── TASKS ───────────────────────────────────────────────────────────────
create table tasks (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references projects(id) on delete cascade,
  title              text not null,
  description        text not null default '',
  status             task_status not null default 'TODO',
  priority           priority_level not null default 'MEDIUM',
  assigned_member_id uuid references profiles(id) on delete set null,
  due_date           date,
  tags               text[] not null default '{}',
  position           integer not null default 0,
  created_by         uuid references profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── ACTIVITY (append-only audit log, written client-side — see README) ───
create table activity (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in (
               'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_STATUS_CHANGED',
               'PROJECT_COMPLETED', 'PROJECT_DELETED', 'PROJECT_MEMBER_ADDED',
               'PROJECT_MEMBER_REMOVED', 'TASK_CREATED', 'TASK_UPDATED',
               'TASK_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED',
               'TASK_COMPLETED', 'TASK_DELETED'
             )),
  actor_id   uuid references profiles(id) on delete set null,
  project_id uuid references projects(id) on delete cascade,
  task_id    uuid references tasks(id) on delete cascade,
  message    text not null,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── INDEXES ─────────────────────────────────────────────────────────────
create index idx_tasks_project_id on tasks(project_id);
create index idx_tasks_assignee on tasks(assigned_member_id);
create index idx_tasks_status on tasks(status);
create index idx_projects_status on projects(status);
create index idx_project_members_member on project_members(member_id);
create index idx_activity_project_created on activity(project_id, created_at desc);
create index idx_activity_created on activity(created_at desc);

-- ── PROFILE BOOTSTRAP TRIGGER ──────────────────────────────────────────
-- The client can't insert into auth.users directly, so this is the one place a matching
-- profiles row can reliably be created. All other business logic stays in the frontend
-- api/ layer — see README "Architecture Decisions" for why.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Member',
    'ACTIVE'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table activity enable row level security;

create policy profiles_select_all on profiles for select to authenticated using (true);
create policy profiles_update_own on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy projects_select_all on projects for select to authenticated using (true);
create policy projects_insert on projects for insert to authenticated with check (auth.uid() = created_by);
create policy projects_update on projects for update to authenticated using (true) with check (true);
create policy projects_delete on projects for delete to authenticated using (true);

create policy project_members_select on project_members for select to authenticated using (true);
create policy project_members_insert on project_members for insert to authenticated with check (true);
create policy project_members_delete on project_members for delete to authenticated using (true);

create policy tasks_select on tasks for select to authenticated using (true);
create policy tasks_insert on tasks for insert to authenticated with check (auth.uid() = created_by);
create policy tasks_update on tasks for update to authenticated using (true) with check (true);
create policy tasks_delete on tasks for delete to authenticated using (true);

-- No update/delete policy on activity: RLS denies those by default, keeping it append-only.
create policy activity_select on activity for select to authenticated using (true);
create policy activity_insert on activity for insert to authenticated with check (auth.uid() = actor_id);

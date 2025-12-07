-- Supabase schema for RulesBuddy

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Enum types
create type membership_tier as enum ('MEMBER', 'BRONZE', 'SILVER', 'GOLD');
create type user_type as enum ('STANDARD', 'GROUP_ADMIN', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN');
create type group_type as enum ('POST', 'DISTRICT', 'DEPARTMENT', 'OTHER');
create type case_level as enum ('POST', 'DISTRICT', 'DEPARTMENT');
create type case_status as enum ('DRAFT', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'REOPENED');
create type notification_type as enum ('CASE_SHARED', 'CASE_REOPENED', 'SEAT_ASSIGNED', 'TIER_CHANGED', 'SYSTEM');

-- Departments table
create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  state text not null,
  is_active boolean not null default true
);

-- Districts table
create table if not exists districts (
  id uuid primary key default uuid_generate_v4(),
  code text not null,
  name text not null,
  department_id uuid not null references departments(id) on delete cascade,
  is_active boolean not null default true
);

-- Posts table
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  post_number text not null,
  name text not null,
  city text,
  state text,
  department_id uuid references departments(id) on delete cascade,
  district_id uuid references districts(id) on delete cascade,
  is_active boolean not null default true
);

-- Groups table
create table if not exists groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  group_type group_type not null,
  department_id uuid references departments(id) on delete cascade,
  is_active boolean not null default true
);

-- Profiles table
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  department_id uuid references departments(id),
  district_id uuid references districts(id),
  post_id uuid references posts(id),
  group_id uuid references groups(id),
  membership_tier membership_tier not null default 'MEMBER',
  user_type user_type not null default 'STANDARD',
  bio text,
  avatar_url text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Documents table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  level text not null check (level in ('GLOBAL', 'DEPARTMENT', 'DISTRICT', 'POST')),
  department_id uuid references departments(id),
  district_id uuid references districts(id),
  post_id uuid references posts(id),
  storage_path text not null,
  text_content text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Settings table for simple key/value configuration
create table if not exists settings (
  key text primary key,
  value text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Drafts table
create table if not exists drafts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  type text not null,
  content jsonb,
  status text not null check (status in ('DRAFT', 'FINALIZED')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Cases table
create table if not exists cases (
  id uuid primary key default uuid_generate_v4(),
  level case_level not null,
  department_id uuid references departments(id),
  district_id uuid references districts(id),
  post_id uuid references posts(id),
  respondent_name text,
  respondent_id_number text,
  complainant_name text,
  description text,
  status case_status not null default 'DRAFT',
  created_by uuid not null references profiles(user_id),
  closed_by uuid references profiles(user_id),
  closed_at timestamp with time zone,
  reopened_by uuid references profiles(user_id),
  reopened_at timestamp with time zone,
  reopen_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Case forms
create table if not exists case_forms (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id) on delete cascade,
  type text not null check (type in ('INCIDENT','DA1','DA2','DA3','DA4','DA5','DA6','DA7','DA8')),
  content jsonb,
  completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Case notes
create table if not exists case_notes (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid not null references profiles(user_id),
  user_role_snapshot user_type not null,
  note_text text,
  created_at timestamp with time zone default now()
);

-- Case files
create table if not exists case_files (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid not null references profiles(user_id),
  file_path text not null,
  file_name text not null,
  file_type text not null,
  created_at timestamp with time zone default now()
);

-- Case shares
create table if not exists case_shares (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid not null references cases(id) on delete cascade,
  user_id uuid not null references profiles(user_id),
  created_at timestamp with time zone default now()
);

-- Group subscriptions
create table if not exists group_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references groups(id) on delete cascade,
  stripe_subscription_id text unique,
  tier membership_tier not null,
  seat_count integer not null,
  price_per_seat_cents integer not null,
  discount_percent integer not null default 0,
  status text not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Revenue shares
create table if not exists revenue_shares (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid not null references departments(id) on delete cascade,
  source_type text not null check (source_type in ('INDIVIDUAL','GROUP')),
  source_id uuid not null,
  amount_cents integer not null,
  currency text not null default 'usd',
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  type notification_type not null,
  message text not null,
  data jsonb,
  read boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Audit logs
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(user_id),
  action_type text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Indexes for faster lookups
create index if not exists idx_profiles_department_id on profiles(department_id);
create index if not exists idx_profiles_district_id on profiles(district_id);
create index if not exists idx_profiles_post_id on profiles(post_id);
create index if not exists idx_documents_department_id on documents(department_id);
create index if not exists idx_documents_district_id on documents(district_id);
create index if not exists idx_documents_post_id on documents(post_id);
create index if not exists idx_documents_level on documents(level);
create index if not exists idx_group_subscriptions_group_id on group_subscriptions(group_id);
create index if not exists idx_group_subscriptions_subscription_id on group_subscriptions(stripe_subscription_id);
create index if not exists idx_revenue_shares_department_id on revenue_shares(department_id);

-- Basic row level security policies

alter table profiles enable row level security;
alter table documents enable row level security;
alter table cases enable row level security;
alter table case_forms enable row level security;
alter table case_notes enable row level security;
alter table case_files enable row level security;
alter table case_shares enable row level security;
alter table drafts enable row level security;
alter table notifications enable row level security;

-- Profiles: users can view and update their own profile
create policy "Select own profile" on profiles for select using (auth.uid() = user_id);
create policy "Update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Insert own profile" on profiles for insert with check (auth.uid() = user_id);

-- Documents: users can view global or their org docs
create policy "Select documents" on documents for select using (
  is_super_admin()
  or level = 'GLOBAL'
  or (level = 'DEPARTMENT' and department_id = (select department_id from profiles where user_id = auth.uid()))
  or (level = 'DISTRICT' and district_id = (select district_id from profiles where user_id = auth.uid()))
  or (level = 'POST' and post_id = (select post_id from profiles where user_id = auth.uid()))
);

-- Cases: restrict select by creator or share
create policy "Select own or shared cases" on cases for select using (
  is_super_admin()
  or created_by = auth.uid() 
  or id in (select case_id from case_shares where user_id = auth.uid())
);

-- Drafts: user can see own drafts
create policy "Select own drafts" on drafts for select using (user_id = auth.uid());
create policy "Insert own drafts" on drafts for insert with check (user_id = auth.uid());
create policy "Update own drafts" on drafts for update using (user_id = auth.uid());

-- Notifications: user can view their notifications
create policy "Select own notifications" on notifications for select using (user_id = auth.uid());
create policy "Update own notifications" on notifications for update using (user_id = auth.uid());

-- Create helper function to check super admin
create or replace function is_super_admin() returns boolean as $$
  select exists (select 1 from profiles where user_id = auth.uid() and user_type = 'SUPER_ADMIN');
$$ language sql stable;

-- Enable RLS for groups and group_subscriptions
alter table groups enable row level security;
alter table group_subscriptions enable row level security;
alter table revenue_shares enable row level security;

-- Groups: allow select for users who belong to the group or admin roles
create policy "Select groups" on groups for select using (
  is_super_admin()
  or (exists (select 1 from profiles p where p.user_id = auth.uid() and p.group_id = groups.id))
  or (exists (select 1 from profiles p where p.user_id = auth.uid() and p.user_type = 'DEPARTMENT_ADMIN' and p.department_id = groups.department_id))
);

-- Group subscriptions: allow select for group admins, department admins or super admin
create policy "Select group subscriptions" on group_subscriptions for select using (
  is_super_admin()
  or (exists (select 1 from profiles p where p.user_id = auth.uid() and p.user_type = 'GROUP_ADMIN' and p.group_id = group_subscriptions.group_id))
  or (exists (select 1 from profiles p join groups g on g.id = group_subscriptions.group_id where p.user_id = auth.uid() and p.user_type = 'DEPARTMENT_ADMIN' and p.department_id = g.department_id))
);

-- Revenue shares: allow select for department admins and super admin
create policy "Select revenue shares" on revenue_shares for select using (
  is_super_admin()
  or (exists (select 1 from profiles p where p.user_id = auth.uid() and p.user_type = 'DEPARTMENT_ADMIN' and p.department_id = revenue_shares.department_id))
);
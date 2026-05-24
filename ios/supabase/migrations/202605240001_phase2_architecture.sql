-- Phase 2 Architecture schema for FuelWell.
-- Run in Supabase SQL Editor or via Supabase CLI after the project credentials are available.

create extension if not exists pgcrypto;

create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    goal text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists foods (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references auth.users(id) on delete cascade,
    name text not null,
    brand text,
    calories integer not null default 0,
    protein numeric not null default 0,
    carbs numeric not null default 0,
    fat numeric not null default 0,
    created_at timestamptz not null default now()
);

create table if not exists meals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    logged_at timestamptz not null default now(),
    notes text,
    created_at timestamptz not null default now()
);

create table if not exists recipes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    instructions jsonb not null default '[]'::jsonb,
    nutrition jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists grocery_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    checked boolean not null default false,
    source_recipe_id uuid references recipes(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists progress_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    kind text not null,
    value numeric not null,
    measured_at timestamptz not null default now(),
    source text not null default 'manual',
    created_at timestamptz not null default now()
);

create table if not exists coach_messages (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'system')),
    body text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists restaurants (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    location text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists feature_flags (
    name text primary key,
    enabled boolean not null default true,
    description text,
    updated_at timestamptz not null default now()
);

insert into feature_flags (name, enabled, description)
values
    ('ai_meal_plan', true, 'Anthropic-powered meal plan generation'),
    ('ai_workout_suggestion', true, 'Anthropic-powered workout suggestions'),
    ('coach_chat', true, 'Anthropic-powered coach chat')
on conflict (name) do nothing;

alter table profiles enable row level security;
alter table foods enable row level security;
alter table meals enable row level security;
alter table recipes enable row level security;
alter table grocery_items enable row level security;
alter table progress_entries enable row level security;
alter table coach_messages enable row level security;
alter table restaurants enable row level security;
alter table feature_flags enable row level security;

create policy "profiles are owner-readable" on profiles
    for select using (auth.uid() = id);
create policy "profiles are owner-writable" on profiles
    for insert with check (auth.uid() = id);
create policy "profiles are owner-updatable" on profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "foods public seed or owner-readable" on foods
    for select using (owner_id is null or auth.uid() = owner_id);
create policy "foods owner-writable" on foods
    for insert with check (auth.uid() = owner_id);
create policy "foods owner-updatable" on foods
    for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "meals owner-readable" on meals
    for select using (auth.uid() = user_id);
create policy "meals owner-writable" on meals
    for insert with check (auth.uid() = user_id);
create policy "meals owner-updatable" on meals
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "recipes public seed or owner-readable" on recipes
    for select using (user_id is null or auth.uid() = user_id);
create policy "recipes owner-writable" on recipes
    for insert with check (auth.uid() = user_id);
create policy "recipes owner-updatable" on recipes
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "grocery_items owner-readable" on grocery_items
    for select using (auth.uid() = user_id);
create policy "grocery_items owner-writable" on grocery_items
    for insert with check (auth.uid() = user_id);
create policy "grocery_items owner-updatable" on grocery_items
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress_entries owner-readable" on progress_entries
    for select using (auth.uid() = user_id);
create policy "progress_entries owner-writable" on progress_entries
    for insert with check (auth.uid() = user_id);
create policy "progress_entries owner-updatable" on progress_entries
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coach_messages owner-readable" on coach_messages
    for select using (auth.uid() = user_id);
create policy "coach_messages owner-writable" on coach_messages
    for insert with check (auth.uid() = user_id);

create policy "restaurants public seed or owner-readable" on restaurants
    for select using (user_id is null or auth.uid() = user_id);
create policy "restaurants owner-writable" on restaurants
    for insert with check (auth.uid() = user_id);
create policy "restaurants owner-updatable" on restaurants
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "anyone can read feature flags" on feature_flags
    for select using (true);

create index if not exists meals_user_logged_at_idx on meals (user_id, logged_at desc);
create index if not exists progress_entries_user_measured_at_idx on progress_entries (user_id, measured_at desc);
create index if not exists coach_messages_user_created_at_idx on coach_messages (user_id, created_at desc);

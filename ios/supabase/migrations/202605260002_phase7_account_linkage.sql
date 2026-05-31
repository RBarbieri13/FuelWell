-- Phase 7 web-to-app account linkage and subscription validation ledger.
-- Apply after 202605260001_phase7_founding100.sql.

create table if not exists marketing_signups (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    normalized_email text generated always as (lower(email)) stored,
    name text,
    first_name text,
    last_name text,
    source text not null default 'signup',
    desired_tier text not null default 'pro' check (desired_tier in ('pro', 'premium')),
    billing_period text not null default 'monthly' check (billing_period in ('monthly', 'six_month', 'annual')),
    founding100_interest boolean not null default false,
    auth_user_id uuid references auth.users(id) on delete set null,
    linked_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (normalized_email)
);

create table if not exists founders_100 (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    normalized_email text generated always as (lower(email)) stored,
    name text,
    first_name text,
    last_name text,
    source text not null default 'founders-100',
    tier text not null default 'pro' check (tier in ('pro', 'premium')),
    billing_period text not null default 'monthly' check (billing_period in ('monthly', 'six_month', 'annual')),
    auth_user_id uuid references auth.users(id) on delete set null,
    linked_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (normalized_email)
);

alter table founders_100 add column if not exists normalized_email text generated always as (lower(email)) stored;
alter table founders_100 add column if not exists first_name text;
alter table founders_100 add column if not exists last_name text;
alter table founders_100 add column if not exists source text not null default 'founders-100';
alter table founders_100 add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
alter table founders_100 add column if not exists linked_at timestamptz;
alter table founders_100 add column if not exists updated_at timestamptz not null default now();

create unique index if not exists founders_100_normalized_email_idx
    on founders_100 (normalized_email);

create index if not exists marketing_signups_auth_user_idx
    on marketing_signups (auth_user_id);

create index if not exists founders_100_auth_user_idx
    on founders_100 (auth_user_id);

create table if not exists subscription_validation_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    provider text not null check (provider in ('manual', 'revenue_cat', 'stripe')),
    product_id text not null,
    environment text not null check (environment in ('sandbox', 'production')),
    entitlement_tier text not null check (entitlement_tier in ('pilot', 'pro', 'premium', 'founding100Lifetime')),
    provider_customer_id text,
    provider_event_id text,
    validated_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb
);

alter table marketing_signups enable row level security;
alter table founders_100 enable row level security;
alter table subscription_validation_events enable row level security;

create policy "marketing signups are owner-readable" on marketing_signups
    for select using (
        auth.uid() = auth_user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = normalized_email
    );

create policy "founders 100 signups are owner-readable" on founders_100
    for select using (
        auth.uid() = auth_user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = normalized_email
    );

create policy "subscription validation events are owner-readable" on subscription_validation_events
    for select using (auth.uid() = user_id);

create or replace function link_marketing_signup_to_user(target_user_id uuid, target_email text)
returns table (
    user_id uuid,
    email text,
    source text,
    linked_at timestamptz,
    founding100_position integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
    normalized_target_email text;
begin
    if auth.uid() is null or auth.uid() <> target_user_id then
        raise exception 'Marketing signup linkage must target the authenticated user' using errcode = '42501';
    end if;

    normalized_target_email := lower(trim(target_email));
    if normalized_target_email is null or normalized_target_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
        raise exception 'Marketing signup linkage requires a valid email' using errcode = '23514';
    end if;

    insert into marketing_signups (
        email,
        source,
        auth_user_id,
        linked_at,
        metadata
    )
    values (
        normalized_target_email,
        'ios_account',
        target_user_id,
        now(),
        jsonb_build_object('link_source', 'ios_account')
    )
    on conflict (normalized_email) do update
    set auth_user_id = excluded.auth_user_id,
        linked_at = excluded.linked_at,
        updated_at = now();

    update founders_100
    set auth_user_id = target_user_id,
        linked_at = now(),
        updated_at = now()
    where normalized_email = normalized_target_email;

    update founding100_reservations
    set email = normalized_target_email
    where user_id = target_user_id;

    return query
    select
        target_user_id,
        normalized_target_email,
        coalesce(ms.source, 'ios_account'),
        ms.linked_at,
        f100.position
    from marketing_signups ms
    left join founding100_reservations f100 on f100.user_id = target_user_id
    where ms.normalized_email = normalized_target_email
    limit 1;
end;
$$;

create or replace function record_subscription_validation_event(
    target_user_id uuid,
    target_provider text,
    target_product_id text,
    target_environment text,
    target_entitlement_tier text,
    target_provider_customer_id text default null,
    target_provider_event_id text default null,
    target_metadata jsonb default '{}'::jsonb
)
returns subscription_validation_events
language plpgsql
security definer
set search_path = public
as $$
declare
    event subscription_validation_events;
begin
    if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
        raise exception 'Subscription validation events must be recorded server-side' using errcode = '42501';
    end if;

    insert into subscription_validation_events (
        user_id,
        provider,
        product_id,
        environment,
        entitlement_tier,
        provider_customer_id,
        provider_event_id,
        metadata
    )
    values (
        target_user_id,
        target_provider,
        target_product_id,
        target_environment,
        target_entitlement_tier,
        target_provider_customer_id,
        target_provider_event_id,
        target_metadata
    )
    returning * into event;

    insert into subscription_entitlements (
        user_id,
        tier,
        product_id,
        provider,
        provider_customer_id,
        provider_entitlement_id,
        is_active,
        validated_at
    )
    values (
        target_user_id,
        target_entitlement_tier,
        target_product_id,
        target_provider,
        target_provider_customer_id,
        target_provider_event_id,
        true,
        event.validated_at
    )
    on conflict (user_id) do update
    set tier = excluded.tier,
        product_id = excluded.product_id,
        provider = excluded.provider,
        provider_customer_id = excluded.provider_customer_id,
        provider_entitlement_id = excluded.provider_entitlement_id,
        is_active = excluded.is_active,
        validated_at = excluded.validated_at,
        updated_at = now();

    return event;
end;
$$;

revoke all on function link_marketing_signup_to_user(uuid, text) from public;
grant execute on function link_marketing_signup_to_user(uuid, text) to authenticated;

revoke all on function record_subscription_validation_event(
    uuid,
    text,
    text,
    text,
    text,
    text,
    text,
    jsonb
) from public;
grant execute on function record_subscription_validation_event(
    uuid,
    text,
    text,
    text,
    text,
    text,
    text,
    jsonb
) to service_role;

insert into schema_migrations (version, name)
values ('202605260002', 'phase7_account_linkage')
on conflict (version) do update
set name = excluded.name,
    applied_at = schema_migrations.applied_at;

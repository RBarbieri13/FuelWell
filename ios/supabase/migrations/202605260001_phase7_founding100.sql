-- Phase 7 Founding 100 subscription foundations.
-- Apply after 202605240001_phase2_architecture.sql.

create table if not exists subscription_entitlements (
    user_id uuid primary key references auth.users(id) on delete cascade,
    tier text not null check (tier in ('pilot', 'pro', 'premium', 'founding100Lifetime')),
    product_id text,
    provider text not null default 'manual',
    provider_customer_id text,
    provider_entitlement_id text,
    is_active boolean not null default true,
    expires_at timestamptz,
    validated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists founding100_reservations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    email text not null,
    position integer not null check (position between 1 and 100),
    product_id text not null default 'fuelwell.founding100.lifetime',
    reserved_at timestamptz not null default now(),
    unique (user_id),
    unique (position)
);

alter table subscription_entitlements enable row level security;
alter table founding100_reservations enable row level security;

create policy "entitlements are owner-readable" on subscription_entitlements
    for select using (auth.uid() = user_id);

create policy "founding100 reservations are owner-readable" on founding100_reservations
    for select using (auth.uid() = user_id);

create index if not exists subscription_entitlements_active_idx
    on subscription_entitlements (is_active, tier);

create index if not exists founding100_reservations_position_idx
    on founding100_reservations (position);

create or replace function reserve_founding100(target_user_id uuid, target_email text)
returns founding100_reservations
language plpgsql
security definer
set search_path = public
as $$
declare
    next_position integer;
    reservation founding100_reservations;
begin
    if auth.uid() is null or auth.uid() <> target_user_id then
        raise exception 'Founding 100 reservations must target the authenticated user' using errcode = '42501';
    end if;

    if nullif(trim(target_email), '') is null then
        raise exception 'Founding 100 reservations require an email' using errcode = '23514';
    end if;

    perform pg_advisory_xact_lock(hashtext('fuelwell_founding100_reservations'));

    select *
    into reservation
    from founding100_reservations
    where user_id = target_user_id;

    if reservation.id is null then
        select coalesce(max(position), 0) + 1
        into next_position
        from founding100_reservations;

        if next_position > 100 then
            raise exception 'Founding 100 is sold out' using errcode = 'P0001';
        end if;

        insert into founding100_reservations (user_id, email, position)
        values (target_user_id, target_email, next_position)
        returning * into reservation;
    else
        update founding100_reservations
        set email = target_email
        where user_id = target_user_id
        returning * into reservation;
    end if;

    insert into subscription_entitlements (
        user_id,
        tier,
        product_id,
        provider,
        is_active,
        validated_at
    )
    values (
        target_user_id,
        'founding100Lifetime',
        'fuelwell.founding100.lifetime',
        'manual',
        true,
        now()
    )
    on conflict (user_id) do update
    set tier = excluded.tier,
        product_id = excluded.product_id,
        provider = excluded.provider,
        is_active = excluded.is_active,
        validated_at = excluded.validated_at,
        updated_at = now();

    return reservation;
end;
$$;

revoke all on function reserve_founding100(uuid, text) from public;
grant execute on function reserve_founding100(uuid, text) to authenticated;

insert into schema_migrations (version, name)
values ('202605260001', 'phase7_founding100')
on conflict (version) do update
set name = excluded.name,
    applied_at = schema_migrations.applied_at;

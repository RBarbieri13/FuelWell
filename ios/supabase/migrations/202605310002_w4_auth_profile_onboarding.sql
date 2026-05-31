-- W4 auth/onboarding profile foundation.

alter table profiles
    add column if not exists body_baseline jsonb not null default '{}'::jsonb,
    add column if not exists dietary_constraints jsonb not null default '{}'::jsonb,
    add column if not exists lifestyle jsonb not null default '{}'::jsonb,
    add column if not exists onboarding_completed_at timestamptz;

create index if not exists profiles_onboarding_completed_at_idx
    on profiles (onboarding_completed_at);

create or replace function delete_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    current_user_id uuid := auth.uid();
begin
    if current_user_id is null then
        raise exception 'delete_current_user requires an authenticated user' using errcode = '42501';
    end if;

    delete from auth.users
    where id = current_user_id;
end;
$$;

revoke all on function delete_current_user() from public;
grant execute on function delete_current_user() to authenticated;

insert into schema_migrations (version, name)
values ('202605310002', 'w4_auth_profile_onboarding')
on conflict (version) do update
set name = excluded.name,
    applied_at = schema_migrations.applied_at;

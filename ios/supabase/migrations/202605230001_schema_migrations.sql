-- FuelWell migration bookkeeping.
-- Apply first. Later migration files insert one row here after they complete.

create table if not exists schema_migrations (
    version text primary key,
    name text not null,
    checksum text,
    applied_at timestamptz not null default now()
);

alter table schema_migrations enable row level security;

insert into schema_migrations (version, name)
values ('202605230001', 'schema_migrations')
on conflict (version) do update
set name = excluded.name,
    applied_at = schema_migrations.applied_at;

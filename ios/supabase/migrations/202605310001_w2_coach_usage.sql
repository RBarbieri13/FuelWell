-- W2 coach usage ledger for the W1 Anthropic proxy.
-- Stores token/cost metadata only. Prompt and response text must not be persisted here.

create table if not exists coach_usage (
    request_id text primary key,
    user_id uuid references auth.users(id) on delete set null,
    feature_flag text not null references feature_flags(name) on delete restrict,
    model text not null,
    input_tokens integer not null default 0 check (input_tokens >= 0),
    output_tokens integer not null default 0 check (output_tokens >= 0),
    estimated_cost_usd numeric(12, 6) not null default 0 check (estimated_cost_usd >= 0),
    status text not null check (status in ('success', 'failed', 'blocked')),
    created_at timestamptz not null default now()
);

alter table coach_usage enable row level security;

create policy "coach usage owner-readable" on coach_usage
    for select using (auth.uid() = user_id);

create index if not exists coach_usage_user_created_at_idx
    on coach_usage (user_id, created_at desc);

create index if not exists coach_usage_created_at_idx
    on coach_usage (created_at desc);

create index if not exists coach_usage_feature_status_created_at_idx
    on coach_usage (feature_flag, status, created_at desc);

insert into schema_migrations (version, name)
values ('202605310001', 'w2_coach_usage')
on conflict (version) do update
set name = excluded.name,
    applied_at = schema_migrations.applied_at;

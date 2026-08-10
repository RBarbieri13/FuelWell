create table if not exists public.account_delete_confirmation_uses (
  nonce_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.account_delete_confirmation_uses enable row level security;

drop policy if exists "account delete confirmation insert own" on public.account_delete_confirmation_uses;
create policy "account delete confirmation insert own"
on public.account_delete_confirmation_uses
for insert
to authenticated
with check (auth.uid() = user_id);

revoke all on table public.account_delete_confirmation_uses from anon;
grant insert on table public.account_delete_confirmation_uses to authenticated;

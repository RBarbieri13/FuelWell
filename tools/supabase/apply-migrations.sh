#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file="${FUELWELL_SUPABASE_ENV_FILE:-${HOME}/.fuelwell/supabase-staging.env}"
migrations_dir="${FUELWELL_SUPABASE_MIGRATIONS_DIR:-${repo_root}/supabase/migrations}"
command_name="${1:-plan}"

usage() {
  cat >&2 <<'USAGE'
Usage: tools/supabase/apply-migrations.sh [plan|apply]

Environment:
  FUELWELL_SUPABASE_ENV_FILE    defaults to ~/.fuelwell/supabase-staging.env
  FUELWELL_SUPABASE_DB_URL      required for apply; optional for plan; use a direct Postgres URL
  FUELWELL_SUPABASE_TARGET      staging|production, defaults to staging

Safety:
  apply refuses production unless FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1.
  This script never prompts for secrets and never writes production without the explicit flag above.
USAGE
}

case "${command_name}" in
  plan | apply)
    ;;
  *)
    usage
    exit 2
    ;;
esac

if [[ ! -d "${migrations_dir}" ]]; then
  echo "Missing migrations directory: ${migrations_dir}" >&2
  exit 2
fi

checksum_for() {
  shasum -a 256 "$1" | awk '{print $1}'
}

if [[ -f "${env_file}" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${env_file}"
  set +a
fi

target="${FUELWELL_SUPABASE_TARGET:-staging}"
db_url="${FUELWELL_SUPABASE_DB_URL:-}"

if [[ -z "${db_url}" && "${command_name}" == "apply" ]]; then
  echo "Missing FUELWELL_SUPABASE_DB_URL." >&2
  echo "Add it to ${env_file} or export it in the current shell." >&2
  exit 2
fi

if [[ -n "${db_url}" ]] && ! command -v psql >/dev/null 2>&1; then
  echo "Missing psql. Install PostgreSQL client tools before applying migrations." >&2
  exit 2
fi

if [[ "${command_name}" == "apply" && "${target}" == "production" && "${FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY:-}" != "1" ]]; then
  echo "Refusing production migration apply without FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1." >&2
  exit 3
fi

migrations=()
while IFS= read -r migration; do
  migrations+=("${migration}")
done < <(find "${migrations_dir}" -maxdepth 1 -type f -name '*.sql' | sort)

if [[ "${#migrations[@]}" -eq 0 ]]; then
  echo "No migration files found in ${migrations_dir}." >&2
  exit 2
fi

psql_base=(psql "${db_url}" -v ON_ERROR_STOP=1 -X -q)

ensure_tracking_table() {
  "${psql_base[@]}" -c "create table if not exists public.schema_migrations (version text primary key, name text not null, checksum text, applied_at timestamptz not null default now());" >/dev/null
  "${psql_base[@]}" -c "alter table public.schema_migrations add column if not exists checksum text;" >/dev/null
}

is_applied() {
  local version="$1"
  local result
  result="$("${psql_base[@]}" -At -c "select 1 from public.schema_migrations where version = '${version}' limit 1;" 2>/dev/null || true)"
  [[ "${result}" == "1" ]]
}

applied_checksum() {
  local version="$1"
  "${psql_base[@]}" -At -c "select coalesce(checksum, '') from public.schema_migrations where version = '${version}' limit 1;" 2>/dev/null || true
}

record_checksum() {
  local version="$1"
  local name="$2"
  local checksum="$3"
  "${psql_base[@]}" -c "
    insert into public.schema_migrations (version, name, checksum)
    values ('${version}', '${name}', '${checksum}')
    on conflict (version) do update
      set name = excluded.name,
          checksum = excluded.checksum;
  " >/dev/null
}

echo "Supabase target: ${target}"
echo "Migration directory: ${migrations_dir}"
echo

if [[ -z "${db_url}" ]]; then
  for migration in "${migrations[@]}"; do
    printf 'planned  %s  checksum=%s\n' "$(basename "${migration}")" "$(checksum_for "${migration}")"
  done
  echo
  echo "Plan only. Set FUELWELL_SUPABASE_DB_URL to compare against schema_migrations or apply."
  exit 0
fi

ensure_tracking_table

pending=()
for migration in "${migrations[@]}"; do
  filename="$(basename "${migration}")"
  version="${filename%%_*}"
  expected_checksum="$(checksum_for "${migration}")"
  if is_applied "${version}"; then
    current_checksum="$(applied_checksum "${version}")"
    if [[ -z "${current_checksum}" ]]; then
      printf 'applied  %s  checksum=%s  tracked=missing\n' "${filename}" "${expected_checksum}"
      if [[ "${command_name}" == "apply" ]]; then
        record_checksum "${version}" "${filename}" "${expected_checksum}"
      fi
    elif [[ "${current_checksum}" == "${expected_checksum}" ]]; then
      printf 'applied  %s  checksum=%s\n' "${filename}" "${expected_checksum}"
    else
      printf 'changed  %s  expected=%s  database=%s\n' "${filename}" "${expected_checksum}" "${current_checksum}"
      if [[ "${command_name}" == "apply" ]]; then
        echo "Refusing apply because an already-applied migration checksum differs from the repository file." >&2
        exit 4
      fi
    fi
  else
    pending+=("${migration}")
    printf 'pending  %s  checksum=%s\n' "${filename}" "${expected_checksum}"
  fi
done

if [[ "${command_name}" == "plan" ]]; then
  echo
  echo "Plan only. Re-run with 'apply' after confirming the target and snapshotting production data if needed."
  exit 0
fi

if [[ "${#pending[@]}" -eq 0 ]]; then
  echo
  echo "No pending migrations."
  exit 0
fi

echo
echo "Applying ${#pending[@]} pending migration(s)."

for migration in "${pending[@]}"; do
  filename="$(basename "${migration}")"
  version="${filename%%_*}"
  expected_checksum="$(checksum_for "${migration}")"
  echo "Applying ${filename}"
  "${psql_base[@]}" -f "${migration}"
  record_checksum "${version}" "${filename}" "${expected_checksum}"
done

echo
echo "Migration apply complete."

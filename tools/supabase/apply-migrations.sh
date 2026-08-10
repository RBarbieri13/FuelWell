#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file="${FUELWELL_SUPABASE_ENV_FILE:-${HOME}/.fuelwell/supabase-staging.env}"
migrations_dir="${FUELWELL_SUPABASE_MIGRATIONS_DIR:-${repo_root}/supabase/migrations}"
manifest_file="${FUELWELL_SUPABASE_MANIFEST_FILE:-${repo_root}/tools/supabase/data/migration-manifest.json}"
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
  The canonical supabase_migrations.schema_migrations ledger must already exist.
  Repository files must match the reviewed SHA-256 migration manifest.
  This script never creates or trusts a parallel public migration ledger.
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

if [[ ! -f "${manifest_file}" ]]; then
  echo "Missing reviewed migration manifest: ${manifest_file}" >&2
  echo "Run tools/supabase/generate-migration-manifest.mjs --write and review the result." >&2
  exit 2
fi

checksum_for() {
  shasum -a 256 "$1" | awk '{print $1}'
}

manifest_checksum_for() {
  local filename="$1"
  node -e '
    const fs = require("node:fs");
    const manifest = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const migration = manifest.migrations.find((entry) => entry.file === process.argv[2]);
    if (!migration) process.exit(3);
    process.stdout.write(migration.sha256);
  ' "${manifest_file}" "${filename}"
}

# Supabase's migration APIs assign their own timestamps. Names are the durable
# identity across staging, production, and local history. One old migration was
# renamed before this manifest was introduced, so its canonical alias is explicit.
canonical_name_for() {
  local filename="$1"
  case "${filename}" in
    20260612120000_profiles_preferences_jsonb.sql) echo "add_profiles_preferences_jsonb" ;;
    *)
      local name="${filename#*_}"
      echo "${name%.sql}"
      ;;
  esac
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

canonical_ledger_exists() {
  local result
  result="$("${psql_base[@]}" -At -c "select to_regclass('supabase_migrations.schema_migrations') is not null;" 2>/dev/null || true)"
  [[ "${result}" == "t" ]]
}

applied_version_for_name() {
  local canonical_name="$1"
  local result
  result="$("${psql_base[@]}" -At -c "select coalesce(string_agg(version, ',' order by version), '') from supabase_migrations.schema_migrations where name = '${canonical_name}';" 2>/dev/null || true)"
  if [[ "${result}" == *,* ]]; then
    echo "Refusing to continue because canonical migration name '${canonical_name}' is duplicated: ${result}" >&2
    exit 6
  fi
  printf '%s' "${result}"
}

apply_migration_atomically() {
  local migration="$1"
  local version="$2"
  local name="$3"

  "${psql_base[@]}" --single-transaction \
    -f "${migration}" \
    -c "
      insert into supabase_migrations.schema_migrations (version, name, statements)
      values ('${version}', '${name}', array['Applied from reviewed FuelWell migration ${name}'])
      on conflict (version) do nothing;
    " >/dev/null
}

echo "Supabase target: ${target}"
echo "Migration directory: ${migrations_dir}"
echo "Canonical ledger: supabase_migrations.schema_migrations"
echo

manifest_mismatch=0
for migration in "${migrations[@]}"; do
  filename="$(basename "${migration}")"
  expected_checksum="$(checksum_for "${migration}")"
  reviewed_checksum="$(manifest_checksum_for "${filename}" 2>/dev/null || true)"
  if [[ -z "${reviewed_checksum}" || "${expected_checksum}" != "${reviewed_checksum}" ]]; then
    printf 'unreviewed  %s  repository=%s  manifest=%s\n' "${filename}" "${expected_checksum}" "${reviewed_checksum:-missing}"
    manifest_mismatch=1
  fi
done

if [[ "${manifest_mismatch}" == "1" ]]; then
  echo "Refusing to continue because migration files differ from the reviewed manifest." >&2
  exit 4
fi

if [[ -z "${db_url}" ]]; then
  for migration in "${migrations[@]}"; do
    filename="$(basename "${migration}")"
    printf 'reviewed  %s  canonical-name=%s  checksum=%s\n' "${filename}" "$(canonical_name_for "${filename}")" "$(checksum_for "${migration}")"
  done
  echo
  echo "Plan only. Set FUELWELL_SUPABASE_DB_URL to compare against the canonical Supabase migration ledger."
  exit 0
fi

if ! canonical_ledger_exists; then
  echo "Refusing to continue because supabase_migrations.schema_migrations is missing." >&2
  echo "Use the Supabase CLI or Management API to initialize canonical migration history." >&2
  exit 5
fi

pending=()
for migration in "${migrations[@]}"; do
  filename="$(basename "${migration}")"
  canonical_name="$(canonical_name_for "${filename}")"
  expected_checksum="$(checksum_for "${migration}")"
  applied_version="$(applied_version_for_name "${canonical_name}")"
  if [[ -n "${applied_version}" ]]; then
    printf 'applied  %s  canonical-name=%s  live-version=%s  checksum=%s\n' "${filename}" "${canonical_name}" "${applied_version}" "${expected_checksum}"
  else
    pending+=("${migration}")
    printf 'pending  %s  canonical-name=%s  checksum=%s\n' "${filename}" "${canonical_name}" "${expected_checksum}"
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
  canonical_version="${filename%%_*}"
  migration_name="${filename#*_}"
  migration_name="${migration_name%.sql}"
  echo "Applying ${filename} as canonical version ${canonical_version}"
  apply_migration_atomically "${migration}" "${canonical_version}" "${migration_name}"
done

echo
echo "Migration apply complete."

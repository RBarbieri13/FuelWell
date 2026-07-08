#!/usr/bin/env bash
set -euo pipefail

env_file="${FUELWELL_SUPABASE_ENV_FILE:-${HOME}/.fuelwell/supabase-staging.env}"
command_name="${1:-read}"

if [[ ! -f "${env_file}" ]]; then
  echo "Missing Supabase env file: ${env_file}" >&2
  exit 2
fi

set -a
# shellcheck source=/dev/null
source "${env_file}"
set +a

if [[ -z "${FUELWELL_SUPABASE_URL:-}" || -z "${FUELWELL_SUPABASE_ANON_KEY:-}" ]]; then
  echo "Expected FUELWELL_SUPABASE_URL and FUELWELL_SUPABASE_ANON_KEY in ${env_file}" >&2
  exit 2
fi

case "${command_name}" in
  read | drill)
    ;;
  *)
    echo "Usage: $0 [read|drill]" >&2
    echo "  read  - read ai_meal_plan through the app anon key" >&2
    echo "  drill - disable, observe, and restore ai_meal_plan; requires FUELWELL_SUPABASE_SERVICE_ROLE_KEY" >&2
    exit 2
    ;;
esac

if [[ "${command_name}" == "drill" && -z "${FUELWELL_SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "Drill mode needs FUELWELL_SUPABASE_SERVICE_ROLE_KEY in ${env_file}." >&2
  echo "Read mode can still verify app-side access with the anon key." >&2
  exit 2
fi

python3 - "${command_name}" <<'PY'
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

command = sys.argv[1]
base_url = os.environ["FUELWELL_SUPABASE_URL"].rstrip("/")
anon_key = os.environ["FUELWELL_SUPABASE_ANON_KEY"]
service_key = os.environ.get("FUELWELL_SUPABASE_SERVICE_ROLE_KEY")
flag_name = os.environ.get("FUELWELL_KILL_SWITCH_FLAG", "ai_meal_plan")


def request(method, path, key, body=None):
    data = None
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation"

    req = urllib.request.Request(
        f"{base_url}{path}",
        method=method,
        headers=headers,
        data=data,
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            payload = response.read().decode("utf-8")
            return response.status, payload
    except urllib.error.HTTPError as error:
        payload = error.read().decode("utf-8")
        return error.code, payload


def feature_flag_path():
    query = urllib.parse.urlencode({
        "select": "name,enabled,description,updated_at",
        "name": f"eq.{flag_name}",
    })
    return f"/rest/v1/feature_flags?{query}"


def read_flag():
    status, payload = request("GET", feature_flag_path(), anon_key)
    if status < 200 or status >= 300:
        print(f"read_status={status}")
        print(payload)
        if "PGRST205" in payload or "Could not find the table" in payload:
            print("BLOCKED: public.feature_flags is not present in the staging schema cache.")
            print("Apply ios/supabase/migrations/202605240001_phase2_architecture.sql to staging, then rerun.")
            sys.exit(3)
        sys.exit(1)

    rows = json.loads(payload)
    if not rows:
        print(f"BLOCKED: feature flag {flag_name!r} is missing in staging.")
        sys.exit(3)

    row = rows[0]
    print(
        "flag="
        f"{row.get('name')} enabled={row.get('enabled')} "
        f"updated_at={row.get('updated_at')}"
    )
    return bool(row["enabled"])


def set_flag(enabled):
    status, payload = request(
        "PATCH",
        f"/rest/v1/feature_flags?name=eq.{urllib.parse.quote(flag_name)}",
        service_key,
        {"enabled": enabled},
    )
    if status < 200 or status >= 300:
        print(f"write_status={status}")
        print(payload)
        sys.exit(1)


def wait_until(expected, timeout=45):
    started = time.monotonic()
    while time.monotonic() - started <= timeout:
        observed = read_flag()
        if observed == expected:
            return time.monotonic() - started
        time.sleep(2)
    print(f"Timed out waiting for {flag_name} enabled={expected}.")
    sys.exit(1)


if command == "read":
    read_flag()
    sys.exit(0)

t0 = time.monotonic()
started_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
original = read_flag()

set_flag(False)
disable_elapsed = time.monotonic() - t0
disabled_observed = wait_until(False)

set_flag(original)
restore_started = time.monotonic()
restored_observed = wait_until(original)

print("DRILL_RESULT")
print(f"started_at_utc={started_at.isoformat()}")
print(f"original_enabled={original}")
print(f"t0_to_kill_seconds={disable_elapsed:.2f}")
print(f"kill_to_disabled_seconds={disabled_observed:.2f}")
print(f"disabled_to_restored_seconds={restored_observed:.2f}")
print(
    "| "
    f"{started_at.date()} | Staging | {disable_elapsed:.2f}s | "
    f"{disabled_observed:.2f}s | {time.monotonic() - restore_started:.2f}s | "
    "Passed | Read/toggle/restore verified through Supabase REST. |"
)
PY

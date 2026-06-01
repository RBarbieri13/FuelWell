#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}"

run_full=false
if [[ "${1:-}" == "--full" ]]; then
  run_full=true
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--full]" >&2
  exit 2
fi

passes=0
warnings=0
blockers=0
failures=0

pass() {
  passes=$((passes + 1))
  echo "PASS: $1"
}

warn() {
  warnings=$((warnings + 1))
  echo "WARN: $1"
}

block() {
  blockers=$((blockers + 1))
  echo "BLOCKED: $1"
}

fail() {
  failures=$((failures + 1))
  echo "FAIL: $1"
}

run_check() {
  local label="$1"
  shift

  if "$@" >/tmp/fuelwell-phase4-gate-check.log 2>&1; then
    pass "${label}"
  else
    fail "${label}"
    sed -n '1,80p' /tmp/fuelwell-phase4-gate-check.log
  fi
}

env_file="${FUELWELL_SUPABASE_ENV_FILE:-${HOME}/.fuelwell/supabase-staging.env}"
ios_destination="${IOS_CI_DESTINATION:-platform=iOS Simulator,name=iPhone 17}"

echo "FuelWell Phase 4 release gate"
echo "Mode: $([[ "${run_full}" == true ]] && echo full || echo quick)"
echo "iOS destination: ${ios_destination}"
echo

run_check "repository diff has no whitespace errors" git diff --check
run_check "privacy manifest is valid plist" plutil -lint ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy
run_check "feature import guard passes" ios/scripts/check-feature-imports.sh
run_check "theme drift guard passes" ios/scripts/check-theme-drift.sh
run_check "kill-switch drill script parses" bash -n tools/supabase/kill-switch-drill.sh

if [[ -f "${env_file}" ]]; then
  pass "staging Supabase env file exists"
  set -a
  # shellcheck source=/dev/null
  source "${env_file}"
  set +a
else
  block "staging Supabase env file is missing at ${env_file}"
fi

if [[ -f "${env_file}" ]] && grep -Eq '^(export[[:space:]]+)?FUELWELL_SUPABASE_SERVICE_ROLE_KEY=' "${env_file}"; then
  pass "local staging service-role key is present"
else
  block "local staging service-role key is not present; full disable/restore drill cannot run"
fi

if [[ -n "${FUELWELL_SUPABASE_DB_URL:-}" ]]; then
  pass "local staging direct Postgres URL is present"
  if command -v psql >/dev/null 2>&1; then
    pass "Postgres client is available"
    set +e
    tools/supabase/apply-migrations.sh plan >/tmp/fuelwell-phase4-migration-plan.log 2>&1
    migration_plan_status=$?
    set -e
    if [[ "${migration_plan_status}" -eq 0 ]]; then
      pass "staging migration plan can be inspected"
    else
      fail "staging migration plan failed"
      sed -n '1,80p' /tmp/fuelwell-phase4-migration-plan.log
    fi
  else
    block "psql is not installed; migration plan/apply cannot inspect staging"
  fi
else
  block "local staging direct Postgres URL is missing; migration apply cannot run"
fi

if [[ -x tools/supabase/kill-switch-drill.sh ]]; then
  set +e
  tools/supabase/kill-switch-drill.sh read >/tmp/fuelwell-phase4-kill-switch-read.log 2>&1
  read_status=$?
  set -e

  if [[ "${read_status}" -eq 0 ]]; then
    pass "staging kill-switch read path works"
  elif [[ "${read_status}" -eq 3 ]]; then
    block "staging kill-switch read path is blocked"
    sed -n '1,80p' /tmp/fuelwell-phase4-kill-switch-read.log
  else
    fail "staging kill-switch read path failed unexpectedly"
    sed -n '1,80p' /tmp/fuelwell-phase4-kill-switch-read.log
  fi
else
  fail "tools/supabase/kill-switch-drill.sh is not executable"
fi

if xcrun devicectl list devices >/tmp/fuelwell-phase4-devices.log 2>&1; then
  if grep -q "No devices found" /tmp/fuelwell-phase4-devices.log; then
    block "no physical iOS device is visible for Instruments evidence"
  else
    pass "physical iOS device is visible"
  fi
else
  fail "could not inspect physical iOS devices"
  sed -n '1,80p' /tmp/fuelwell-phase4-devices.log
fi

if [[ "${run_full}" == true ]]; then
  run_check "Xcode project regenerates" bash -c "cd ios && xcodegen generate --spec project.yml"
  run_check "SwiftLint strict passes" bash -c "cd ios && swiftlint --strict --config .swiftlint.yml"
  run_check "AppTests pass" xcodebuild test -quiet -project ios/FuelWellApp.xcodeproj -scheme AppTests -destination "${ios_destination}"
  run_check "full iOS test suite passes" xcodebuild test -quiet -project ios/FuelWellApp.xcodeproj -scheme FuelWellApp -destination "${ios_destination}"
  run_check "simulator rebuild and launch succeeds" tools/simulator-live/rebuild-and-launch.sh
else
  warn "full build/test/simulator verification skipped; rerun with --full before release tagging"
fi

echo
echo "Summary: ${passes} passed, ${warnings} warnings, ${blockers} blockers, ${failures} failures"

if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi

if [[ "${blockers}" -gt 0 ]]; then
  exit 3
fi

exit 0

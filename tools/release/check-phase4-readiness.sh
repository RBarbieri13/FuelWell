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

echo "FuelWell Phase 4 release gate"
echo "Mode: $([[ "${run_full}" == true ]] && echo full || echo quick)"
echo

run_check "repository diff has no whitespace errors" git diff --check
run_check "privacy manifest is valid plist" plutil -lint ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy
run_check "feature import guard passes" ios/scripts/check-feature-imports.sh
run_check "theme drift guard passes" ios/scripts/check-theme-drift.sh
run_check "kill-switch drill script parses" bash -n tools/supabase/kill-switch-drill.sh

if [[ -f "${env_file}" ]]; then
  pass "staging Supabase env file exists"
else
  block "staging Supabase env file is missing at ${env_file}"
fi

if [[ -f "${env_file}" ]] && grep -Eq '^(export[[:space:]]+)?FUELWELL_SUPABASE_SERVICE_ROLE_KEY=' "${env_file}"; then
  pass "local staging service-role key is present"
else
  block "local staging service-role key is not present; full disable/restore drill cannot run"
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
  run_check "SwiftLint strict passes" swiftlint --strict --config ios/.swiftlint.yml ios
  run_check "AppTests pass" xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:AppTests test
  run_check "full iOS test suite passes" xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test
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

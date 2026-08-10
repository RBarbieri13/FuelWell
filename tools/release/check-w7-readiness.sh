#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}"

passes=0
blockers=0
failures=0

run_gate() {
  local label="$1"
  shift

  local log_file
  log_file="$(mktemp "/tmp/fuelwell-w7-${label//[^A-Za-z0-9]/-}.XXXXXX")"

  set +e
  "$@" >"${log_file}" 2>&1
  local status=$?
  set -e

  if [[ "${status}" -eq 0 ]]; then
    passes=$((passes + 1))
    echo "PASS: ${label}"
  elif [[ "${status}" -eq 3 ]]; then
    blockers=$((blockers + 1))
    echo "BLOCKED: ${label}"
    sed -n '1,100p' "${log_file}"
  else
    failures=$((failures + 1))
    echo "FAIL: ${label}"
    sed -n '1,120p' "${log_file}"
  fi
}

echo "FuelWell W7 release readiness aggregate"
echo

run_gate "Phase 4 release gate quick" tools/release/check-phase4-readiness.sh
run_gate "Phase 7 Founding 100 local contracts" tools/release/check-phase7-founding100.sh
run_gate "Phase 7 commerce/account linkage local contracts" tools/release/check-phase7-commerce-linkage.sh
run_gate "Phase 6 operate readiness local contracts" tools/operate/check-operate-readiness.sh
run_gate "Root web unit tests" npm run test:unit

echo
echo "Summary: ${passes} passed, ${blockers} blocked, ${failures} failed"

if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi

if [[ "${blockers}" -gt 0 ]]; then
  exit 3
fi

exit 0

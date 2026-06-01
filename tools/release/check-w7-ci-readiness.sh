#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
workflow="${repo_root}/.github/workflows/ios-ci.yml"
status=0

pass() {
  echo "ok: $1"
}

fail() {
  echo "missing: $1" >&2
  status=1
}

require_match() {
  local pattern="$1"
  local message="$2"

  if grep -Fq -- "$pattern" "$workflow"; then
    pass "$message"
  else
    fail "$message"
  fi
}

if [[ ! -f "$workflow" ]]; then
  echo "missing: .github/workflows/ios-ci.yml" >&2
  exit 1
fi

echo "FuelWell W7 CI readiness"
echo

require_match "workflow_dispatch:" "manual full-suite workflow dispatch is enabled"
require_match "schedule:" "scheduled full-suite workflow is enabled"
require_match "cron:" "scheduled workflow has a cron expression"
require_match "-resultBundlePath build/reports/FuelWellApp.xcresult" "test job emits a stable result bundle"
require_match "tools/release/check-coverage-floor.sh ios/build/reports/FuelWellApp.xcresult" \
  "test job enforces the coverage floor"
require_match "tools/release/check-w7-ci-readiness.sh" "quality job checks W7 CI readiness"

if python3 - "$workflow" <<'PY'
import sys

workflow = sys.argv[1]
with open(workflow, "r", encoding="utf-8") as handle:
    lines = handle.readlines()

in_push = False
push_indent = None
for line in lines:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        continue

    indent = len(line) - len(line.lstrip(" "))
    if stripped == "push:":
        in_push = True
        push_indent = indent
        continue

    if in_push and indent <= push_indent and not stripped.startswith("-"):
        in_push = False

    if in_push and stripped == "paths:":
        sys.exit(1)

sys.exit(0)
PY
then
  pass "main push runs are not path-filtered"
else
  fail "main push runs must not be path-filtered"
fi

echo
if [[ "$status" -eq 0 ]]; then
  echo "W7 CI readiness checks passed."
else
  echo "W7 CI readiness checks failed."
fi

exit "$status"

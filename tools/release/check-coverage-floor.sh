#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
xcresult_path="${1:-${repo_root}/ios/build/reports/FuelWellApp.xcresult}"
floor_percent="${FUELWELL_COVERAGE_FLOOR_PERCENT:-70}"

required_targets=(
  "CoreTests.xctest"
  "FuelWellAppTests.xctest"
  "NutritionDomainTests.xctest"
)

if [[ ! -d "${xcresult_path}" ]]; then
  echo "Coverage result bundle is missing: ${xcresult_path}" >&2
  echo "Run xcodebuild test with -resultBundlePath before this gate." >&2
  exit 2
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "xcrun is required to read coverage reports." >&2
  exit 2
fi

tmp_json="$(mktemp)"
trap 'rm -f "${tmp_json}"' EXIT

xcrun xccov view --report --json "${xcresult_path}" >"${tmp_json}"

python3 - "$tmp_json" "$floor_percent" "${required_targets[@]}" <<'PY'
import json
import sys

report_path = sys.argv[1]
floor = float(sys.argv[2])
required_targets = sys.argv[3:]

with open(report_path, "r", encoding="utf-8") as handle:
    report = json.load(handle)

targets = {target["name"]: target for target in report.get("targets", [])}
missing = [name for name in required_targets if name not in targets]
if missing:
    print("Missing coverage targets: " + ", ".join(missing), file=sys.stderr)
    sys.exit(1)

failures = []
for name in required_targets:
    target = targets[name]
    coverage = float(target.get("lineCoverage", 0)) * 100
    covered = int(target.get("coveredLines", 0))
    executable = int(target.get("executableLines", 0))
    print(f"{name}: {coverage:.1f}% ({covered}/{executable} lines)")
    if coverage < floor:
        failures.append(f"{name} {coverage:.1f}% < {floor:.1f}%")

if failures:
    print("Coverage floor failed: " + "; ".join(failures), file=sys.stderr)
    sys.exit(1)

print(f"Coverage floor passed for {len(required_targets)} critical targets at >= {floor:.1f}%.")
PY

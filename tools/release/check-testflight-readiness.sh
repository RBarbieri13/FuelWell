#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${repo_root}"

mode="local"
if [[ "${1:-}" == "--ci" ]]; then
  mode="ci"
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--ci]" >&2
  exit 2
fi

passes=0
blockers=0
failures=0

pass() {
  passes=$((passes + 1))
  echo "PASS: $1"
}

block() {
  blockers=$((blockers + 1))
  echo "BLOCKED: $1"
}

fail() {
  failures=$((failures + 1))
  echo "FAIL: $1"
}

require_file() {
  local path="$1"
  local label="$2"

  if [[ -f "${path}" ]]; then
    pass "${label}"
  else
    fail "${label} missing at ${path}"
  fi
}

require_env() {
  local key="$1"
  local fallback="${2:-}"

  if [[ -n "${!key:-}" ]]; then
    pass "${key} is set"
  elif [[ -n "${fallback}" && -n "${!fallback:-}" ]]; then
    pass "${fallback} is set"
  else
    block "${key}${fallback:+ or ${fallback}} is not set"
  fi
}

run_check() {
  local label="$1"
  shift

  if "$@" >/tmp/fuelwell-testflight-check.log 2>&1; then
    pass "${label}"
  else
    fail "${label}"
    sed -n '1,80p' /tmp/fuelwell-testflight-check.log
  fi
}

echo "FuelWell TestFlight readiness gate"
echo "Mode: ${mode}"
echo

require_file "ios/fastlane/Fastfile" "Fastlane Fastfile exists"
require_file "ios/fastlane/Appfile" "Fastlane Appfile exists"
require_file "ios/fastlane/Matchfile" "Fastlane Matchfile exists"
require_file ".github/workflows/ios-testflight.yml" "manual TestFlight workflow exists"
require_file "ios/fastlane/metadata/en-US/description.txt" "App Store description metadata exists"
require_file "ios/fastlane/metadata/en-US/release_notes.txt" "release notes metadata exists"
require_file "ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy" "privacy manifest exists"

run_check "repository diff has no whitespace errors" git diff --check
run_check "privacy manifest is valid plist" plutil -lint ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy
run_check "release scripts parse" bash -n tools/release/check-phase4-readiness.sh
run_check "TestFlight helper parses" bash -n tools/release/run-testflight-beta.sh

if grep -q "app_store_connect_api_key" ios/fastlane/Fastfile; then
  pass "Fastlane beta lane supports App Store Connect API key auth"
else
  fail "Fastlane beta lane does not configure App Store Connect API key auth"
fi

if grep -q "distribute_external: false" ios/fastlane/Fastfile; then
  pass "Fastlane beta lane is internal-TestFlight only by default"
else
  fail "Fastlane beta lane must not distribute externally by default"
fi

if grep -q "bundle exec fastlane beta" .github/workflows/ios-testflight.yml; then
  pass "manual workflow invokes the beta lane"
else
  fail "manual workflow does not invoke the beta lane"
fi

require_env "FUELWELL_APP_IDENTIFIER"
require_env "FUELWELL_APPLE_ID"
require_env "FUELWELL_APPLE_TEAM_ID" "DEVELOPMENT_TEAM"
require_env "FUELWELL_APP_STORE_CONNECT_TEAM_ID"
require_env "FUELWELL_MATCH_GIT_URL"
require_env "MATCH_PASSWORD"
require_env "FUELWELL_ASC_KEY_ID" "ASC_KEY_ID"
require_env "FUELWELL_ASC_ISSUER_ID" "ASC_ISSUER_ID"
require_env "FUELWELL_ASC_KEY_P8_BASE64" "ASC_KEY_P8_BASE64"

if [[ "${mode}" == "ci" ]]; then
  require_env "MATCH_DEPLOY_KEY"
fi

echo
echo "Summary: ${passes} passed, ${blockers} blockers, ${failures} failures"

if [[ "${failures}" -gt 0 ]]; then
  exit 1
fi

if [[ "${blockers}" -gt 0 ]]; then
  exit 3
fi

exit 0

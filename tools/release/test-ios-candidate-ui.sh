#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
candidate_url="${FUELWELL_CANDIDATE_URL:-}"
expected_git_sha="${FUELWELL_CANDIDATE_GIT_SHA:-}"
expected_deployment_id="${FUELWELL_CANDIDATE_DEPLOYMENT_ID:-}"
expected_environment="${FUELWELL_CANDIDATE_ENVIRONMENT:-}"
supabase_url="${NEXT_PUBLIC_SUPABASE_URL:-${FUELWELL_SUPABASE_URL:-}}"
supabase_anon_key="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-${FUELWELL_SUPABASE_ANON_KEY:-}}"
devices_csv="${FUELWELL_RELEASE_TEST_DEVICES:-${FUELWELL_RELEASE_TEST_DEVICE:-iPhone 16e,iPhone 17 Pro Max}}"
result_path="${FUELWELL_UI_TEST_RESULT_PATH:-${repo_root}/ios/build/reports/FuelWellCandidateUITests.xcresult}"
overflow_result_path="${FUELWELL_MOBILE_OVERFLOW_RESULT_PATH:-${repo_root}/ios/build/reports/coach-mobile-overflow}"

usage() {
  cat <<'EOF'
Verify an immutable FuelWell web candidate through the actual iOS WKWebView shell.

Required release gate:
  FUELWELL_CANDIDATE_URL=https://<immutable-deployment>.vercel.app \
  FUELWELL_CANDIDATE_GIT_SHA=<exact-candidate-sha> \
  FUELWELL_CANDIDATE_DEPLOYMENT_ID=<exact-vercel-deployment-id> \
  FUELWELL_CANDIDATE_ENVIRONMENT=preview \
  FUELWELL_UI_TEST_EMAIL=<dedicated-test-user> \
  FUELWELL_UI_TEST_PASSWORD=<dedicated-test-password> \
  FUELWELL_UI_TEST_SECOND_EMAIL=<second-dedicated-test-user> \
  FUELWELL_UI_TEST_SECOND_PASSWORD=<second-dedicated-test-password> \
  tools/release/test-ios-candidate-ui.sh

The script rejects the mutable fuelwell-preview.vercel.app alias, validates the
candidate release manifest, requires authenticated live Coach inference,
verifies Coach overflow at release mobile widths,
generates an isolated Xcode project, and runs the native candidate journey on a
compact and large iPhone by default. Override the comma-separated device list
with FUELWELL_RELEASE_TEST_DEVICES. Screenshots and test results are preserved
under ios/build/reports.
EOF
}

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

[[ -n "${candidate_url}" ]] || fail "FUELWELL_CANDIDATE_URL is required"
[[ -n "${expected_git_sha}" ]] || fail "FUELWELL_CANDIDATE_GIT_SHA is required"
[[ -n "${expected_deployment_id}" ]] || fail "FUELWELL_CANDIDATE_DEPLOYMENT_ID is required"
[[ -n "${expected_environment}" ]] || fail "FUELWELL_CANDIDATE_ENVIRONMENT is required"
[[ "${candidate_url}" == https://* ]] || fail "candidate URL must use HTTPS"

candidate_url="${candidate_url%/}"
candidate_origin="$(node -e 'const u = new URL(process.argv[1]); console.log(u.origin)' "${candidate_url}")"
candidate_host="$(node -e 'const u = new URL(process.argv[1]); console.log(u.hostname)' "${candidate_url}")"
[[ "${candidate_url}" == "${candidate_origin}" ]] || fail "candidate URL must be a deployment origin without a path"
[[ "${candidate_host}" != "fuelwell-preview.vercel.app" ]] || fail "mutable preview alias is not a release candidate"

manifest_url="${candidate_origin}/.well-known/fuelwell-release"
manifest="$(curl --fail --silent --show-error --max-time 20 \
  -H 'Accept: application/json' "${manifest_url}")" || fail "candidate release manifest is unavailable"

read_manifest() {
  jq -er "$1" <<<"${manifest}" || fail "candidate manifest is missing $2"
}

schema_version="$(read_manifest '.schemaVersion' 'schemaVersion')"
package_version="$(read_manifest '.packageVersion' 'packageVersion')"
manifest_git_sha="$(read_manifest '.gitSha' 'gitSha')"
deployment_id="$(read_manifest '.vercelDeploymentId' 'vercelDeploymentId')"
deployment_url="$(read_manifest '.deploymentUrl | rtrimstr("/")' 'deploymentUrl')"
environment="$(read_manifest '.environment' 'environment')"

[[ "${manifest_git_sha}" == "${expected_git_sha}" ]] || \
  fail "candidate Git SHA ${manifest_git_sha} does not match expected ${expected_git_sha}"
[[ "${deployment_id}" == "${expected_deployment_id}" ]] || \
  fail "candidate deployment ID ${deployment_id} does not match expected ${expected_deployment_id}"
[[ "${environment}" == "${expected_environment}" ]] || \
  fail "candidate environment ${environment} does not match expected ${expected_environment}"
[[ "${deployment_url}" == "${candidate_origin}" ]] || \
  fail "manifest deployment URL does not match candidate origin"
[[ "${package_version}" == "$(node -p "require('${repo_root}/package.json').version")" ]] || \
  fail "manifest package version does not match package.json"

for public_path in /privacy /support; do
  public_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 20 \
    "${candidate_origin}${public_path}")" || fail "candidate public page ${public_path} is unavailable"
  [[ "${public_status}" == "200" ]] || \
    fail "candidate public page ${public_path} returned HTTP ${public_status}"
done

preflight_url="${candidate_origin}/api/launch-preflight?live=1"

[[ "${FUELWELL_UI_TEST_ALLOW_ANONYMOUS:-0}" != "1" ]] || \
  fail "anonymous candidates cannot be uploaded to TestFlight"
[[ -n "${FUELWELL_UI_TEST_EMAIL:-}" ]] || fail "FUELWELL_UI_TEST_EMAIL is required"
[[ -n "${FUELWELL_UI_TEST_PASSWORD:-}" ]] || fail "FUELWELL_UI_TEST_PASSWORD is required"
[[ -n "${FUELWELL_UI_TEST_SECOND_EMAIL:-}" ]] || fail "FUELWELL_UI_TEST_SECOND_EMAIL is required"
[[ -n "${FUELWELL_UI_TEST_SECOND_PASSWORD:-}" ]] || fail "FUELWELL_UI_TEST_SECOND_PASSWORD is required"
[[ -n "${supabase_url}" ]] || fail "NEXT_PUBLIC_SUPABASE_URL or FUELWELL_SUPABASE_URL is required"
[[ -n "${supabase_anon_key}" ]] || fail "NEXT_PUBLIC_SUPABASE_ANON_KEY or FUELWELL_SUPABASE_ANON_KEY is required"

auth_response="$(curl --fail --silent --show-error --max-time 20 \
  -H "apikey: ${supabase_anon_key}" \
  -H 'Content-Type: application/json' \
  --data "$(jq -nc \
    --arg email "${FUELWELL_UI_TEST_EMAIL}" \
    --arg password "${FUELWELL_UI_TEST_PASSWORD}" \
    '{email: $email, password: $password}')" \
  "${supabase_url%/}/auth/v1/token?grant_type=password")" || \
  fail "dedicated UI-test user could not authenticate with Supabase"
access_token="$(jq -er '.access_token' <<<"${auth_response}")" || \
  fail "Supabase authentication did not return an access token"

auth_settings="$(curl --fail --silent --show-error --max-time 20 \
  -H "apikey: ${supabase_anon_key}" \
  -H 'Accept: application/json' \
  "${supabase_url%/}/auth/v1/settings")" || \
  fail "Supabase Auth settings are unavailable"
for provider in google facebook apple; do
  jq -e --arg provider "${provider}" '.external[$provider] == true' \
    <<<"${auth_settings}" >/dev/null || \
    fail "Supabase ${provider} OAuth is not enabled for the release candidate"
done

oauth_redirect="${candidate_origin}/callback?next=/app/dashboard"
for provider in google facebook apple; do
  oauth_result="$(curl --silent --show-error --output /dev/null \
    --write-out '%{http_code}\t%{redirect_url}' \
    --max-time 20 \
    -H "apikey: ${supabase_anon_key}" \
    --get \
    --data-urlencode "provider=${provider}" \
    --data-urlencode "redirect_to=${oauth_redirect}" \
    "${supabase_url%/}/auth/v1/authorize")" || \
    fail "Supabase ${provider} OAuth authorization could not start"
  IFS=$'\t' read -r oauth_status oauth_location <<<"${oauth_result}"
  [[ "${oauth_status}" =~ ^30[2378]$ ]] || \
    fail "Supabase ${provider} OAuth authorization returned HTTP ${oauth_status}"
  oauth_host="$(node -e 'const u = new URL(process.argv[1]); console.log(u.hostname)' "${oauth_location}")" || \
    fail "Supabase ${provider} OAuth returned an invalid provider URL"
  case "${provider}" in
    google)
      [[ "${oauth_host}" == "accounts.google.com" ]] || \
        fail "Google OAuth redirected to unexpected host ${oauth_host}"
      ;;
    facebook)
      [[ "${oauth_host}" == "facebook.com" || "${oauth_host}" == *.facebook.com ]] || \
        fail "Facebook OAuth redirected to unexpected host ${oauth_host}"
      ;;
    apple)
      [[ "${oauth_host}" == "appleid.apple.com" ]] || \
        fail "Apple OAuth redirected to unexpected host ${oauth_host}"
      ;;
  esac
done

echo "Proving two-account Supabase isolation"
node "${repo_root}/tools/release/verify-supabase-account-isolation.mjs"

preflight="$(curl --fail --silent --show-error --max-time 20 \
  -H 'Accept: application/json' \
  -H "Authorization: Bearer ${access_token}" \
  "${preflight_url}")" || fail "authenticated candidate launch preflight is unavailable"
jq -e '.productionReady == true and .liveReady == true' <<<"${preflight}" >/dev/null || \
  fail "candidate is not live production-ready for TestFlight: $(jq -c '{previewReady, productionReady, liveReady, checks, liveChecks}' <<<"${preflight}")"

if [[ ! -x "${repo_root}/node_modules/.bin/playwright" ]]; then
  echo "Installing locked web test dependencies"
  npm --prefix "${repo_root}" ci --ignore-scripts
fi

rm -rf "${overflow_result_path}"
echo "Proving authenticated Coach live inference against immutable candidate ${candidate_origin}"
FUELWELL_PLAYWRIGHT_BASE_URL="${candidate_origin}" \
FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL="${FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL:-chrome}" \
FUELWELL_PLAYWRIGHT_OUTPUT_DIR="${overflow_result_path}-live-coach" \
  "${repo_root}/node_modules/.bin/playwright" test \
    "${repo_root}/tests/testflight-live-coach.spec.ts" \
    --config="${repo_root}/playwright.config.ts" \
    --project=chromium \
    --workers=1

echo "Proving authenticated user data survives a fresh sign-in"
FUELWELL_PLAYWRIGHT_BASE_URL="${candidate_origin}" \
FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL="${FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL:-chrome}" \
FUELWELL_PLAYWRIGHT_OUTPUT_DIR="${overflow_result_path}-authenticated-persistence" \
  "${repo_root}/node_modules/.bin/playwright" test \
    "${repo_root}/tests/testflight-authenticated-persistence.spec.ts" \
    --config="${repo_root}/playwright.config.ts" \
    --project=chromium \
    --workers=1

echo "Testing authenticated FuelWell mobile containment against immutable candidate ${candidate_origin}"
FUELWELL_PLAYWRIGHT_BASE_URL="${candidate_origin}" \
FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL="${FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL:-chrome}" \
FUELWELL_PLAYWRIGHT_OUTPUT_DIR="${overflow_result_path}" \
  "${repo_root}/node_modules/.bin/playwright" test \
    "${repo_root}/tests/mobile-component-clipping.spec.ts" \
    --config="${repo_root}/playwright.config.ts" \
    --project=chromium \
    --workers=1

echo "Repeating authenticated mobile containment in mobile WebKit"
FUELWELL_PLAYWRIGHT_BASE_URL="${candidate_origin}" \
FUELWELL_PLAYWRIGHT_MOBILE_WEBKIT=1 \
FUELWELL_PLAYWRIGHT_OUTPUT_DIR="${overflow_result_path}-webkit" \
  "${repo_root}/node_modules/.bin/playwright" test \
    "${repo_root}/tests/mobile-component-clipping.spec.ts" \
    --config="${repo_root}/playwright.config.ts" \
    --project=mobile-webkit \
    --workers=1

temporary_project="$(mktemp -d "${TMPDIR:-/tmp}/fuelwell-candidate-ui.XXXXXX")"
trap 'rm -rf "${temporary_project}"' EXIT

xcodegen generate \
  --spec "${repo_root}/ios/project.yml" \
  --project-root "${repo_root}/ios" \
  --project "${temporary_project}" \
  --quiet

mkdir -p "$(dirname "${result_path}")"

echo "Testing iOS shell against immutable candidate ${candidate_origin}"
echo "Candidate SHA: ${manifest_git_sha}; deployment: ${deployment_id}; environment: ${environment}"

IFS=',' read -r -a devices <<<"${devices_csv}"
[[ "${#devices[@]}" -gt 0 ]] || fail "at least one iPhone simulator is required"

result_stem="${result_path%.xcresult}"
result_paths=()

for raw_device in "${devices[@]}"; do
  device="$(printf '%s' "${raw_device}" | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')"
  [[ -n "${device}" ]] || fail "FUELWELL_RELEASE_TEST_DEVICES contains an empty device name"

  device_slug="$(printf '%s' "${device}" | tr '[:upper:] ' '[:lower:]-' | tr -cd '[:alnum:]-')"
  if [[ "${#devices[@]}" -eq 1 ]]; then
    device_result_path="${result_path}"
  else
    device_result_path="${result_stem}-${device_slug}.xcresult"
  fi
  rm -rf "${device_result_path}"

  echo "Running candidate UI tests on ${device}"
  DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}" \
    xcodebuild \
      -project "${temporary_project}/FuelWellApp.xcodeproj" \
      -scheme CandidateUITests \
      -destination "platform=iOS Simulator,name=${device}" \
      -resultBundlePath "${device_result_path}" \
      -only-testing:FuelWellUITests \
      CODE_SIGNING_ALLOWED=NO \
      INFOPLIST_FILE="${repo_root}/ios/FuelWellApp/Info.plist" \
      FUELWELL_START_URL="${candidate_origin}/app/dashboard" \
      FUELWELL_SUPABASE_URL="${supabase_url}" \
      FUELWELL_EXPECTED_PACKAGE_VERSION="${package_version}" \
      FUELWELL_EXPECTED_GIT_SHA="${manifest_git_sha}" \
      FUELWELL_EXPECTED_DEPLOYMENT_ID="${deployment_id}" \
      FUELWELL_EXPECTED_DEPLOYMENT_URL="${candidate_origin}" \
      FUELWELL_EXPECTED_ENVIRONMENT="${environment}" \
      FUELWELL_RELEASE_SCHEMA_VERSION="${schema_version}" \
      test
  result_paths+=("${device_result_path}")
done

echo "PASS: bound iOS candidate launched and all critical web routes remained live"
printf 'Evidence: %s\n' "${result_paths[@]}"
echo "Coach overflow evidence: ${overflow_result_path}"

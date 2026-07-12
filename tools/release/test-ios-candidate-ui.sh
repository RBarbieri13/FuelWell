#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
candidate_url="${FUELWELL_CANDIDATE_URL:-}"
expected_git_sha="${FUELWELL_CANDIDATE_GIT_SHA:-}"
expected_deployment_id="${FUELWELL_CANDIDATE_DEPLOYMENT_ID:-}"
expected_environment="${FUELWELL_CANDIDATE_ENVIRONMENT:-}"
device="${FUELWELL_RELEASE_TEST_DEVICE:-iPhone 15}"
result_path="${FUELWELL_UI_TEST_RESULT_PATH:-${repo_root}/ios/build/reports/FuelWellCandidateUITests.xcresult}"

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
  tools/release/test-ios-candidate-ui.sh

For an explicitly anonymous preview candidate only, replace the credentials with:
  FUELWELL_UI_TEST_ALLOW_ANONYMOUS=1

The script rejects the mutable fuelwell-preview.vercel.app alias, validates the
candidate release manifest, generates an isolated Xcode project, and preserves
screenshots and test results in ios/build/reports/FuelWellCandidateUITests.xcresult.
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

preflight_url="${candidate_origin}/api/launch-preflight"
preflight="$(curl --fail --silent --show-error --max-time 20 \
  -H 'Accept: application/json' "${preflight_url}")" || fail "candidate launch preflight is unavailable"
jq -e '.ready == true' <<<"${preflight}" >/dev/null || \
  fail "candidate launch preflight is not ready: $(jq -c '{ready, checks}' <<<"${preflight}")"

if [[ "${FUELWELL_UI_TEST_ALLOW_ANONYMOUS:-0}" != "1" ]]; then
  [[ -n "${FUELWELL_UI_TEST_EMAIL:-}" ]] || fail "FUELWELL_UI_TEST_EMAIL is required"
  [[ -n "${FUELWELL_UI_TEST_PASSWORD:-}" ]] || fail "FUELWELL_UI_TEST_PASSWORD is required"
fi

temporary_project="$(mktemp -d "${TMPDIR:-/tmp}/fuelwell-candidate-ui.XXXXXX")"
trap 'rm -rf "${temporary_project}"' EXIT

xcodegen generate \
  --spec "${repo_root}/ios/project.yml" \
  --project-root "${repo_root}/ios" \
  --project "${temporary_project}" \
  --quiet

mkdir -p "$(dirname "${result_path}")"
rm -rf "${result_path}"

echo "Testing iOS shell against immutable candidate ${candidate_origin}"
echo "Candidate SHA: ${manifest_git_sha}; deployment: ${deployment_id}; environment: ${environment}"

DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}" \
  xcodebuild \
    -project "${temporary_project}/FuelWellApp.xcodeproj" \
    -scheme CandidateUITests \
    -destination "platform=iOS Simulator,name=${device}" \
    -resultBundlePath "${result_path}" \
    -only-testing:FuelWellUITests \
    CODE_SIGNING_ALLOWED=NO \
    FUELWELL_START_URL="${candidate_origin}/app/dashboard" \
    FUELWELL_EXPECTED_PACKAGE_VERSION="${package_version}" \
    FUELWELL_EXPECTED_GIT_SHA="${manifest_git_sha}" \
    FUELWELL_EXPECTED_DEPLOYMENT_ID="${deployment_id}" \
    FUELWELL_EXPECTED_DEPLOYMENT_URL="${candidate_origin}" \
    FUELWELL_EXPECTED_ENVIRONMENT="${environment}" \
    FUELWELL_RELEASE_SCHEMA_VERSION="${schema_version}" \
    test

echo "PASS: bound iOS candidate launched and all critical web routes remained live"
echo "Evidence: ${result_path}"

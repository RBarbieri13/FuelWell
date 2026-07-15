#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
temporary_project="$(mktemp -d "${TMPDIR:-/tmp}/fuelwell-release-binding.XXXXXX")"
trap 'rm -rf "${temporary_project}"' EXIT

cd "${repo_root}"

npx vitest run tests/unit/release-manifest.test.ts
ruby -c ios/fastlane/Fastfile
for key in \
  FUELWELL_CANDIDATE_URL \
  FUELWELL_CANDIDATE_GIT_SHA \
  FUELWELL_CANDIDATE_DEPLOYMENT_ID \
  FUELWELL_CANDIDATE_ENVIRONMENT; do
  grep -q "required_release_value(\"${key}\")" ios/fastlane/Fastfile
done

xcodegen generate \
  --spec ios/project.yml \
  --project-root ios \
  --project "${temporary_project}" \
  --quiet

generated_project="${temporary_project}/FuelWellApp.xcodeproj/project.pbxproj"
# The binding keys live in the explicit Info.plist (build settings only
# support Apple's known-key allowlist); assert the plist template carries
# every key and the generated project consumes an Info.plist file.
release_plist="${repo_root}/ios/FuelWellApp/Info.plist"
for key in \
  FuelWellStartURL \
  FuelWellExpectedPackageVersion \
  FuelWellExpectedGitSHA \
  FuelWellExpectedDeploymentID \
  FuelWellExpectedDeploymentURL \
  FuelWellExpectedEnvironment \
  FuelWellReleaseSchemaVersion; do
  grep -q "${key}" "${release_plist}"
done
grep -q "INFOPLIST_FILE" "${generated_project}"

if grep -q "fuelwell-preview.vercel.app" ios/FuelWellApp/Sources/FuelWellApp.swift; then
  echo "FAIL: mutable preview alias remains hardcoded in FuelWellApp.swift" >&2
  exit 1
fi

DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}" \
  xcodebuild \
    -project "${temporary_project}/FuelWellApp.xcodeproj" \
    -scheme ReleaseBindingTests \
    -destination "platform=iOS Simulator,name=${FUELWELL_RELEASE_TEST_DEVICE:-iPhone 15}" \
    -only-testing:FuelWellAppTests \
    test \
    CODE_SIGNING_ALLOWED=NO \
    INFOPLIST_FILE="${repo_root}/ios/FuelWellApp/Info.plist" \
    -quiet

echo "PASS: release manifest and immutable iOS binding verified"

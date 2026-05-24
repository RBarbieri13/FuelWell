#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-$(git rev-parse --show-toplevel)}"
simulator_name="${FUELWELL_SIMULATOR_NAME:-iPhone 15}"
scheme="${FUELWELL_SCHEME:-FuelWellApp}"
bundle_id="${FUELWELL_BUNDLE_ID:-com.fuelwell.app}"
derived_data_path="${FUELWELL_DERIVED_DATA_PATH:-/tmp/fuelwell-live-derived}"

cd "${repo_root}/ios"

xcrun simctl boot "${simulator_name}" >/dev/null 2>&1 || true
open -a Simulator

xcodegen generate
xcodebuild build \
  -scheme "${scheme}" \
  -destination "platform=iOS Simulator,name=${simulator_name}" \
  -derivedDataPath "${derived_data_path}"

xcrun simctl install booted "${derived_data_path}/Build/Products/Debug-iphonesimulator/${scheme}.app"
xcrun simctl launch booted "${bundle_id}"

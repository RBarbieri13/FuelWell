#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
env_file="${FUELWELL_TESTFLIGHT_ENV_FILE:-${HOME}/.fuelwell/apple-testflight.env}"

if [[ ! -f "${env_file}" ]]; then
  echo "Missing TestFlight env file at ${env_file}" >&2
  echo "Create it from docs/ios-guide/operate/testflight-route.md, then rerun." >&2
  exit 3
fi

set -a
# shellcheck source=/dev/null
source "${env_file}"
set +a

cd "${repo_root}/ios"
bundle config set path vendor/bundle
bundle install
bundle exec fastlane beta

#!/usr/bin/env bash
set -euo pipefail

source_root="$(git rev-parse --show-toplevel)"
live_root="${FUELWELL_LIVE_ROOT:-$(dirname "${source_root}")/FuelWell-live}"
interval_seconds="${FUELWELL_WATCH_INTERVAL_SECONDS:-60}"
branch="${FUELWELL_LIVE_BRANCH:-main}"
rebuild_script="${source_root}/tools/simulator-live/rebuild-and-launch.sh"

if ! git -C "${live_root}" rev-parse --show-toplevel >/dev/null 2>&1; then
  git -C "${source_root}" worktree add "${live_root}" "${branch}"
fi

last_built=""

while true; do
  git -C "${live_root}" fetch origin "${branch}"
  remote_head="$(git -C "${live_root}" rev-parse "origin/${branch}")"

  if [[ "${remote_head}" != "${last_built}" ]]; then
    git -C "${live_root}" checkout "${branch}"
    git -C "${live_root}" pull --ff-only origin "${branch}"
    "${rebuild_script}" "${live_root}"
    last_built="${remote_head}"
  fi

  sleep "${interval_seconds}"
done

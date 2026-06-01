#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "FuelWell W9 TestFlight and App Store readiness"
node tools/release/generate-app-store-readiness.mjs "$@"

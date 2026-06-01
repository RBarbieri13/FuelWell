#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "FuelWell W2 staging schema evidence"
node tools/supabase/generate-staging-schema-evidence.mjs "$@"

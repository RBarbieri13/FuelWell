#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${FUELWELL_SUPABASE_ENV_FILE:-$HOME/.fuelwell/supabase-staging.env}"
STRICT="${1:-}"

required_files=(
  "docs/ios-guide/operate/incident-response-runbook.md"
  "docs/ios-guide/operate/pilot-feedback-triage.md"
  "docs/ios-guide/operate/posthog-decision-engine-dashboard.json"
  "docs/ios-guide/operate/sentry-alert-routing.md"
  "docs/ios-guide/operate/app-review-rejection-runbook.md"
  "docs/ios-guide/operate/production-database-access.md"
  "docs/ios-guide/operate/monthly-kill-switch-drill.md"
  "tools/operate/triage-feedback.js"
)

missing=0

check_file() {
  local path="$1"
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    echo "missing: $path"
    missing=1
  else
    echo "ok: $path"
  fi
}

echo "FuelWell Phase 6 operate readiness"
echo

for file in "${required_files[@]}"; do
  check_file "$file"
done

echo
echo "Syntax checks"
bash -n "$ROOT_DIR/tools/operate/check-operate-readiness.sh"
node --check "$ROOT_DIR/tools/operate/triage-feedback.js"
node -e "JSON.parse(require('fs').readFileSync('$ROOT_DIR/docs/ios-guide/operate/posthog-decision-engine-dashboard.json', 'utf8')); console.log('ok: posthog dashboard json')"

echo
echo "Environment checks"
if [[ -f "$ENV_FILE" ]]; then
  echo "ok: Supabase env file present"
else
  echo "blocked: Supabase env file missing at $ENV_FILE"
  missing=1
fi

if [[ -n "${FUELWELL_POSTHOG_API_KEY:-}" ]]; then
  echo "ok: PostHog key exported"
else
  echo "blocked: FUELWELL_POSTHOG_API_KEY not exported"
  [[ "$STRICT" == "--strict" ]] && missing=1
fi

if [[ -n "${SENTRY_AUTH_TOKEN:-}" && -n "${SENTRY_ORG:-}" && -n "${SENTRY_PROJECT:-}" ]]; then
  echo "ok: Sentry release env exported"
else
  echo "blocked: Sentry release env not fully exported"
  [[ "$STRICT" == "--strict" ]] && missing=1
fi

echo
if [[ "$missing" -eq 0 ]]; then
  echo "Operate readiness files and local syntax checks are green."
else
  echo "Operate readiness has blockers. Non-secret external credentials may still be required."
fi

exit "$missing"

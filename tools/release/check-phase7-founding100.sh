#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STRICT="${1:-}"
status=0

require_file() {
  local path="$1"
  if [[ -f "$ROOT_DIR/$path" ]]; then
    echo "ok: $path"
  else
    echo "missing: $path"
    status=1
  fi
}

echo "FuelWell Phase 7 Founding 100 readiness"
echo

require_file "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
require_file "ios/Packages/SubscriptionClient/Tests/SubscriptionClientTests/SubscriptionClientTests.swift"
require_file "ios/supabase/migrations/202605260001_phase7_founding100.sql"
require_file "docs/ios-guide/phase7/founding100-commerce-foundations.md"
require_file "docs/ios-guide/phase7/web-app-account-linkage.md"

echo
echo "Contract checks"
rg -q "hardCap = 100" "$ROOT_DIR/ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
echo "ok: app hard cap is 100"
rg -q "position between 1 and 100" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: database hard cap is 100"
rg -q "fuelwell.founding100.lifetime" "$ROOT_DIR/ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
rg -q "fuelwell.founding100.lifetime" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: Founding 100 product id is consistent"
rg -Fq "auth.uid() <> target_user_id" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: reservation function is owner-scoped"
rg -Fq "nullif(trim(target_email), '')" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: reservation function rejects blank email"
rg -Fq "pg_advisory_xact_lock" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: reservation function serializes seat allocation"
rg -Fq "grant execute on function reserve_founding100(uuid, text) to authenticated" "$ROOT_DIR/ios/supabase/migrations/202605260001_phase7_founding100.sql"
echo "ok: reservation function grants authenticated execution only"

echo
echo "External setup"
if [[ -n "${REVENUECAT_API_KEY:-}" || -n "${FUELWELL_REVENUECAT_API_KEY:-}" ]]; then
  echo "ok: RevenueCat key exported"
else
  echo "blocked: RevenueCat key not exported"
  [[ "$STRICT" == "--strict" ]] && status=1
fi

if [[ -n "${FUELWELL_FOUNDING100_PRICE_ID:-}" ]]; then
  echo "ok: Founding 100 price id exported"
else
  echo "blocked: FUELWELL_FOUNDING100_PRICE_ID not exported"
  [[ "$STRICT" == "--strict" ]] && status=1
fi

echo
if [[ "$status" -eq 0 ]]; then
  echo "Phase 7 Founding 100 local contracts are ready."
else
  echo "Phase 7 Founding 100 readiness has blockers."
fi

exit "$status"

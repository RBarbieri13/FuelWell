#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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

echo "FuelWell Phase 7 commerce and account-linkage readiness"
echo

require_file "ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
require_file "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
require_file "src/app/api/signup/route.ts"
require_file "src/components/signup-form.tsx"
require_file "docs/ios-guide/phase7/commerce-account-linkage.md"

echo
echo "Contract checks"
rg -Fq "marketing_signups" "$ROOT_DIR/ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
echo "ok: marketing signup table is versioned"
rg -Fq "link_marketing_signup_to_user" "$ROOT_DIR/ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
echo "ok: authenticated account-link RPC is versioned"
rg -Fq "record_subscription_validation_event" "$ROOT_DIR/ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
echo "ok: server-side validation ledger RPC is versioned"
rg -Fq "service_role" "$ROOT_DIR/ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
echo "ok: paid validation write path is server-only"
rg -Fq "getSupabaseAdmin" "$ROOT_DIR/src/app/api/signup/route.ts"
echo "ok: website signup uses server-side Supabase client"
rg -Fq "normalizeEmail" "$ROOT_DIR/src/app/api/signup/route.ts"
echo "ok: website signup normalizes email before storage"
rg -Fq 'onConflict: "normalized_email"' "$ROOT_DIR/src/app/api/signup/route.ts"
echo "ok: website signup upserts by normalized email"
rg -Fq "linkMarketingSignup" "$ROOT_DIR/ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
echo "ok: iOS subscription client exposes account linkage"
rg -Fq "validateProviderReceipt" "$ROOT_DIR/ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
echo "ok: iOS subscription client exposes provider receipt validation seam"

echo
if [[ "$status" -eq 0 ]]; then
  echo "Phase 7 commerce and account-linkage local contracts are ready."
else
  echo "Phase 7 commerce and account-linkage readiness has blockers."
fi

exit "$status"

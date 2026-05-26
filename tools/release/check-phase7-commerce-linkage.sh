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

require_match() {
  local pattern="$1"
  local path="$2"
  local message="$3"

  if rg -Fq "$pattern" "$ROOT_DIR/$path"; then
    echo "ok: $message"
  else
    echo "missing: $message"
    status=1
  fi
}

echo "FuelWell Phase 7 commerce and account-linkage readiness"
echo

require_file "ios/supabase/migrations/202605260002_phase7_account_linkage.sql"
require_file "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift"
require_file "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SupabaseSubscriptionTransport.swift"
require_file "src/app/api/signup/route.ts"
require_file "src/components/signup-form.tsx"
require_file "docs/ios-guide/phase7/commerce-account-linkage.md"

echo
echo "Contract checks"
require_match "marketing_signups" "ios/supabase/migrations/202605260002_phase7_account_linkage.sql" \
  "marketing signup table is versioned"
require_match "link_marketing_signup_to_user" "ios/supabase/migrations/202605260002_phase7_account_linkage.sql" \
  "authenticated account-link RPC is versioned"
require_match "record_subscription_validation_event" "ios/supabase/migrations/202605260002_phase7_account_linkage.sql" \
  "server-side validation ledger RPC is versioned"
require_match "service_role" "ios/supabase/migrations/202605260002_phase7_account_linkage.sql" \
  "paid validation write path is server-only"
require_match "getSupabaseAdmin" "src/app/api/signup/route.ts" \
  "website signup uses server-side Supabase client"
require_match "normalizeEmail" "src/app/api/signup/route.ts" \
  "website signup normalizes email before storage"
require_match 'onConflict: "normalized_email"' "src/app/api/signup/route.ts" \
  "website signup upserts by normalized email"
require_match "linkMarketingSignup" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift" \
  "iOS subscription client exposes account linkage"
require_match "validateProviderReceipt" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SubscriptionClient.swift" \
  "iOS subscription client exposes provider receipt validation seam"
require_match "SupabaseSubscriptionTransport" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SupabaseSubscriptionTransport.swift" \
  "iOS subscription client has live Supabase transport"
require_match "rest/v1/rpc/reserve_founding100" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SupabaseSubscriptionTransport.swift" \
  "iOS client calls Founding 100 reservation RPC"
require_match "rest/v1/rpc/link_marketing_signup_to_user" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SupabaseSubscriptionTransport.swift" \
  "iOS client calls marketing account-link RPC"
require_match "subscription_validation_events" "ios/Packages/SubscriptionClient/Sources/SubscriptionClient/SupabaseSubscriptionTransport.swift" \
  "iOS client reads validation audit events"

echo
if [[ "$status" -eq 0 ]]; then
  echo "Phase 7 commerce and account-linkage local contracts are ready."
else
  echo "Phase 7 commerce and account-linkage readiness has blockers."
fi

exit "$status"

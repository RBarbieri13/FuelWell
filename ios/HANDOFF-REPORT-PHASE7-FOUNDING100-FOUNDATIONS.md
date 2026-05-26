# FuelWell - Phase 7 Founding 100 Foundations Handoff

Date: 2026-05-26
Branch: `feature/phase-7-founding-100-foundations`

## Summary

This PR starts Phase 7 with the commerce/account foundations needed before a public Founders 100 offer. It does not turn on a paywall. It adds tier and entitlement contracts, a server-side Supabase schema, Founders 100 hard-cap checks, and a small app-visible account/subscription surface.

## What Changed

- Added `SubscriptionClient`, a new local package for:
  - Pilot, Pro, Premium, and Founding 100 Lifetime tiers
  - premium feature access checks
  - RevenueCat/StoreKit product IDs
  - server-validated subscription status
  - Founders 100 reservation hard cap
- Added tests covering tier gates, receipt validation, Founders 100 access, and sold-out behavior.
- Added the Phase 7 Supabase migration for:
  - `subscription_entitlements`
  - `founding100_reservations`
  - owner-readable RLS policies
  - `reserve_founding100(...)` server-side reservation function
- Added `tools/release/check-phase7-founding100.sh`.
- Added Phase 7 docs for commerce foundations and web-to-app account linkage.
- Added a Founding 100 status card in the Menu using existing design-system card patterns.

## Verification

- `xcodegen generate --spec project.yml`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `git diff --check`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `bash -n tools/release/check-phase7-founding100.sh`
- `tools/release/check-phase7-founding100.sh`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -skipMacroValidation -skipPackagePluginValidation -only-testing:SubscriptionClientTests`

## Remaining External Setup

- Choose final RevenueCat or Stripe provider configuration.
- Export provider credentials and real price IDs.
- Apply the Phase 7 Supabase migration after staging has the Phase 2 schema.
- Wire the website signup records into Supabase user IDs.

# FuelWell Phase 7 Commerce and Account Linkage Handoff

Date: 2026-05-26
Branch: feature/phase-7-commerce-account-linkage

## Scope

This PR advances Phase 7 by connecting the website signup surface, Founders 100 capture, iOS account access, and the server-side subscription validation contract.

## What Changed

- Added a Supabase migration for `marketing_signups`, Founders 100 email linkage, `subscription_validation_events`, and the server-only validation RPC.
- Moved website signup storage to the server-side Supabase admin client and normalized email conflict handling.
- Expanded the admin dashboard so it shows all marketing leads plus Founders 100 seats.
- Aligned Founders 100 pricing across the current signup form and v2 Founders page with `PRODUCT-CONTEXT.md`.
- Introduced iOS subscription-account models for provider receipts, account-link requests, marketing-account links, and validation events.
- Added an Account and access settings screen that surfaces Supabase identity, subscription status, and Founders 100 linkage.
- Wired local Phase 7 commerce-linkage release checks into CI with syntax validation.

## Guardrails

- Website signup does not grant app entitlement.
- RevenueCat, Stripe, and manual subscription validation are modeled as server-validated events.
- The app can display and cache account-linkage state, but active paid entitlements remain owned by the server-side validation path.

## Verification

- `tools/release/check-phase7-commerce-linkage.sh`
- `tools/release/check-phase7-founding100.sh`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `npx eslint src/app/api/signup/route.ts src/app/founders-100/page.tsx src/components/signup-form.tsx src/app/v2/founders-100/page.tsx src/app/admin/page.tsx`
- `npm run build`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -skipMacroValidation -skipPackagePluginValidation`

## Known Follow-Ups

- Apply the Supabase migration in staging before enabling live account linkage.
- Keep `SUPABASE_SERVICE_ROLE_KEY` available for website signup/admin server routes.
- Wire RevenueCat and Stripe webhooks to `record_subscription_validation_event(...)` once product IDs are final in App Store Connect and Stripe.

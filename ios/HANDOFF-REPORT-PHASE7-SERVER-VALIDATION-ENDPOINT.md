# FuelWell Phase 7 Server Validation Endpoint Handoff

Date: 2026-05-26
Branch: feature/phase-7-server-validation-endpoint

## Scope

This PR completes the next Phase 7 commerce step after the live iOS RPC client: paid entitlement writes now have a server-owned website API endpoint instead of relying on direct app writes.

## What Changed

- Added `POST /api/subscriptions/validate-provider` as the server-side subscription validation entrypoint.
- Added a typed validation helper for RevenueCat, Stripe, and manual entitlement events.
- Secret-gated the endpoint with `SUBSCRIPTION_VALIDATION_SECRET` and a timing-safe header comparison.
- Routed successful validation writes through the existing Supabase `record_subscription_validation_event(...)` RPC.
- Added subscription validation event visibility to the admin dashboard.
- Expanded the Phase 7 commerce release checker to guard the endpoint, typed schema, secret gate, RPC call, and admin audit surface.
- Documented the server-owned validation contract in the Phase 7 guide.

## Guardrails

- iOS still cannot write paid entitlements directly.
- Supabase service role access stays on the server.
- Invalid JSON, invalid provider payloads, missing endpoint configuration, and bad secrets fail before the RPC call.
- The endpoint supports provider events now, while product-provider webhook verification can be tightened once RevenueCat/Stripe credentials and final product IDs are live.

## Verification

- `tools/release/check-phase7-commerce-linkage.sh`
- `npx eslint src/app/api/subscriptions/validate-provider/route.ts src/lib/subscription-validation.ts src/app/admin/page.tsx`
- `npm run build`
- `git diff --check`

Note: the repo-wide `npm run lint` still fails on pre-existing unrelated files under `tools/` and `src/components/interactive-coach.tsx`; this PR uses targeted lint plus production build for the touched website surface.

## Known Follow-Ups

- Point RevenueCat and/or Stripe webhook workers at this endpoint once production credentials are available.
- Add provider-signature verification for the final webhook source before public paid-tier enforcement.
- Wire iOS provider receipt submission only after the backend has a provider verification worker, not directly to Supabase.

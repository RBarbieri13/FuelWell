# Phase 7 Commerce and Account Linkage

Scope: connect website signups, iOS accounts, Founders 100 reservations, and subscription validation without putting payment authority in the app.

## Identity Rule

`auth.users.id` is the app identity. Website signups start as email leads, then become linked records once the user signs into iOS with the same email.

The account-linkage migration adds:

- `marketing_signups`: canonical website lead capture with normalized email and optional `auth_user_id`.
- `founders_100`: versioned Founders 100 lead table for the existing marketing surface.
- `link_marketing_signup_to_user(target_user_id, target_email)`: authenticated RPC that links a matching signup to the current app user.
- `subscription_validation_events`: server-side audit ledger for RevenueCat, Stripe, or manual validation events.
- `record_subscription_validation_event(...)`: service-role-only RPC that writes the validation audit row and updates `subscription_entitlements`.

## Website Contract

`/api/signup` now uses the server-side Supabase admin client, normalizes email to lowercase, and upserts:

1. Every lead into `marketing_signups`.
2. Founders 100 leads into `founders_100`.

The route does not create app entitlements. It only preserves the lead and source route so iOS and the backend can link it later.

## App Contract

The iOS `SubscriptionClient` exposes three separate jobs:

- `status(userID)`: read the current entitlement.
- `linkMarketingSignup(request)`: link a website signup to the signed-in app user.
- `validateProviderReceipt(userID, receipt)`: cache/display server-validated access and preserve a validation event.

Pilot remains open. The app can show account and Founders 100 status now, but public tier gating should wait until provider validation is live.

## Payment Authority

RevenueCat or Stripe validation must happen server-side. The app may submit provider receipt tokens, but only a server-side validation path can write active `subscription_entitlements`.

## Pricing Source

Founders 100 prices shown in the current website UI match `PRODUCT-CONTEXT.md`:

- Pro: `$10.99/mo`, `$59/6 months`, `$99/year`
- Premium: `$16.99/mo`, `$89/6 months`, `$159/year`

Do not create App Store products or RevenueCat offerings until these prices are approved as final in App Store Connect.

## Local Check

```bash
tools/release/check-phase7-commerce-linkage.sh
```

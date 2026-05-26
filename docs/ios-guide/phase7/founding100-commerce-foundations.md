# Phase 7 Founding 100 Commerce Foundations

Scope: tier gating, subscription validation, Founders 100 lifetime access, and the hard cap of 100 seats.

## Product Contract

Pilot users continue to see every feature until paid tiers are explicitly enabled. Phase 7 introduces the contracts that make tier gating safe without turning on a public paywall yet.

| Tier | Purpose | Access |
| --- | --- | --- |
| Pilot | TestFlight and early validation | All current MVP features |
| Pro | Main paid plan | Coach, nudges, meal plans, groceries, recipes, restaurant guidance |
| Premium | Higher tier | Pro plus future workout-plan surfaces |
| Founding 100 Lifetime | First 100 paid supporters | Lifetime Premium-equivalent access |

## Product IDs

The app and database both use these identifiers:

```text
fuelwell.pro.monthly
fuelwell.premium.monthly
fuelwell.founding100.lifetime
```

## Hard Cap

Founders 100 is capped in two places:

- App/domain contract: `Founding100Reservation.hardCap == 100`
- Database contract: `founding100_reservations.position between 1 and 100`

The database is the source of truth. The app contract exists to keep UI, tests, and release checks honest.

## Server-Side Validation

`subscription_entitlements` is the canonical table for active access. Payment providers such as RevenueCat or Stripe should validate receipts server-side before writing an entitlement row.

The app must not trust local receipt parsing for paid access. Local state can cache the latest validated entitlement, but server validation wins whenever there is a conflict.

## Founders 100 Reservation

The migration adds `reserve_founding100(target_user_id, target_email)`. It:

1. Finds the next available position.
2. Rejects position 101 and above.
3. Creates or refreshes the user's Founding 100 reservation.
4. Grants `founding100Lifetime` entitlement.

## Local Check

```bash
tools/release/check-phase7-founding100.sh
```

Use `--strict` only on a machine where external payment credentials are expected to be present.

## Not Turned On Yet

This PR does not enable a public paywall. It creates the contracts and guardrails so the paywall can be wired without risking an uncapped Founders offer.

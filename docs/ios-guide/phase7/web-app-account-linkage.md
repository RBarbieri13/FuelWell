# Web to App Account Linkage

Phase 7 requires marketing-site signups and iOS accounts to land in the same Supabase identity system.

## Rule

The Supabase auth user is the stable identity. Website waitlist records, Founders 100 reservations, feedback rows, and in-app profile rows must converge on `auth.users.id`.

## Linkage Flow

1. Visitor joins Founders 100 or waitlist on the website.
2. Website stores email and source metadata.
3. When the user signs into the app with the same email, Supabase auth creates or resolves the user.
4. Backend links the waitlist/signup record to `auth.users.id`.
5. If a Founders 100 payment or reservation exists, `subscription_entitlements` grants the app entitlement.

## Required Fields

Website signup records should preserve:

- email
- source route
- campaign/referrer
- Founders 100 interest
- created timestamp
- linked Supabase user ID once known

## Validation Rules

- Email matching is case-insensitive.
- Entitlements should be granted only after server validation.
- A Founders 100 position is assigned once and cannot exceed 100.
- Support can manually link an email to a Supabase user only with an audit note.

## Open Implementation Work

- Add the website-side signup linkage table or extend the existing signup storage.
- Add the backend job/function that links website records to Supabase users.
- Add support tooling to inspect one user's linkage state without exposing service-role credentials in the app.

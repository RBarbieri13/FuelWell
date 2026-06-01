# FuelWell W1 Coach Proxy Hardening Handoff

Branch: `feature/w1-coach-proxy-hardening`

## Summary

This slice tightens the server-side Coach proxy before live pilot usage. The proxy now rejects unapproved Claude model names and requires a stable UUID-shaped user id before feature-flag reads, usage-cap checks, usage logging, or Anthropic calls proceed.

## What Changed

- Added `FUELWELL_COACH_ALLOWED_MODELS` parsing with safe defaults.
- Added model allow-list enforcement in `/api/coach`.
- Tightened `x-fuelwell-user-id` parsing so only stable UUID identifiers are accepted for cost attribution.
- Added helper coverage for model allow-list parsing and stable user-id enforcement.
- Documented Coach proxy controls and rotation checks in the runbook.

## Verification

- `npm run test:website`
- `npm run lint` (passes with existing unrelated warnings only)
- `npm run build`

## Notes

- No secrets were read or printed.
- No live Anthropic or Supabase calls were made.
- The next live W1 gate still requires server-side `ANTHROPIC_API_KEY`, `FUELWELL_COACH_PROXY_SECRET`, and applied Supabase `feature_flags` plus `coach_usage` tables.

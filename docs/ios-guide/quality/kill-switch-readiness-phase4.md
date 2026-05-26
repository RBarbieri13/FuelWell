# Phase 4 Kill-Switch Readiness

Scope: local verification for the `ai_meal_plan` safety switch

## Contract

The production kill-switch path has two layers:

1. The client reads `feature_flags` from Supabase with a short cache.
2. AI requests go through the configured proxy/edge function, which can enforce the same feature decision server-side.

The live staging drill still requires real Supabase credentials. This document records what the repository can prove without those credentials.

## Local Evidence

`SupabaseClientTests.liveFeatureFlagClientFetchesSupabaseRows` verifies that the live feature-flag client:

- calls `/rest/v1/feature_flags?select=*`
- sends the Supabase anon key as both `apikey` and `Authorization`
- reads `ai_meal_plan = false` as disabled

`SupabaseClientTests.liveFeatureFlagClientUsesCacheWithinTTL` verifies that repeated reads within the configured TTL use the cached value instead of repeatedly hitting the feature flag endpoint.

`AnthropicClientTests.liveClientStopsBeforeProxyWhenFeatureIsDisabled` verifies that a disabled `ai_meal_plan` flag throws `featureDisabled` before any proxy request is sent.

`AnthropicClientTests.liveClientSendsFeatureFlagToProxyWhenEnabled` verifies that enabled AI requests include `feature_flag` in the proxy payload, giving the server/proxy enough context for independent enforcement and logging.

`AppFeatureTests.disabledAnthropicFeatureStillCountsAsReady` verifies that a disabled AI feature is considered a safe-off state during launch readiness, not an app outage.

## Remaining Live Drill

Before TestFlight, run the runbook drill against staging:

1. Set `ai_meal_plan` to disabled in Supabase.
2. Wait up to 30 seconds.
3. Confirm the app presents the unavailable path instead of generated AI content.
4. Restore the flag.
5. Record timings in `docs/ios-guide/runbook.md`.

This PR does not claim that live staging has been exercised.

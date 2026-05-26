# FuelWell - Phase 4 Kill-Switch Readiness

Date: 2026-05-26
Branch: `feature/phase-4-kill-switch-readiness`

## Summary

This Phase 4 slice hardens the AI kill-switch path that remains blocked from live verification until Supabase staging credentials are attached. The app now has local regression coverage for the Supabase feature flag REST contract, the 30-second cache behavior, and the Anthropic proxy path stopping before generation when `ai_meal_plan` is disabled.

## What Changed

- Made `FeatureFlagClient.live` testable with injected TTL and `URLSession`, while keeping the production default at 30 seconds.
- Made `AnthropicClient.live` testable with injected endpoint, feature flags, and `URLSession`, while keeping `liveValue` environment-driven.
- Added `feature_flag` to the Anthropic proxy payload so the server/proxy can independently enforce and log the requested AI feature.
- Added package tests for Supabase feature flag reads, cache behavior, disabled AI safe-off behavior, and enabled proxy payloads.
- Updated the runbook and added Phase 4 kill-switch readiness documentation.

## Verification

- `git diff --check`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:SupabaseClientTests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:AnthropicClientTests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -derivedDataPath /tmp/fuelwell-phase4-kill-derived -only-testing:AppTests -only-testing:AnthropicClientTests -only-testing:SupabaseClientTests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -derivedDataPath /tmp/fuelwell-phase4-kill-derived test`
- `tools/simulator-live/rebuild-and-launch.sh`

## Remaining Phase 4 Work

- Run and record the live staging kill-switch drill once Supabase staging credentials are available.
- Attach physical-device Instruments values before TestFlight is considered release-ready.

# FuelWell W9 App Store Evidence Handoff

## Scope

This slice adds a non-secret TestFlight/App Store evidence pack for the release track. It validates repository-owned metadata and privacy manifest inputs, identifies human-gated blockers, and generates a readable status snapshot for Robert and Max.

## Added

- `tools/release/check-w9-app-store-readiness.sh`
- `tools/release/generate-app-store-readiness.mjs`
- `docs/ios-guide/ship/testflight-app-store-evidence.md`
- `docs/APP-STORE-READINESS.md`
- `tools/release/data/app-store-readiness.json`

## Verification

- `node --check tools/release/generate-app-store-readiness.mjs`
- `bash -n tools/release/check-w9-app-store-readiness.sh`
- `tools/release/check-w9-app-store-readiness.sh --write` returns the expected externally blocked status because screenshots and Apple/Fastlane credentials are not present.

## Remaining External Blockers

- Add final App Store screenshots after UI sign-off.
- Configure Apple Developer and Fastlane secrets outside git.
- Robert must explicitly approve TestFlight invite actions and any App Review submission.

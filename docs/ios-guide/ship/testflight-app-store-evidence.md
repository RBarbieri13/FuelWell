# TestFlight and App Store Evidence Pack

This pack is the W9 release-readiness layer that can be prepared before Apple credentials or App Review submission. It keeps App Store work visible without letting an automation cross a human-gated line.

## What Codex Can Prepare

- Fastlane metadata completeness and length checks.
- Privacy manifest coverage for the app's current health, photo, fitness, crash, and product-interaction data classes.
- Screenshot folder expectations for App Store device families.
- A generated readiness snapshot at `docs/APP-STORE-READINESS.md`.
- A machine-readable snapshot at `tools/release/data/app-store-readiness.json`.

## What Requires Robert

- Apple Developer Program membership and App Store Connect access.
- Signing certificate and Match repository access.
- TestFlight invite lists.
- Final privacy-label review.
- Any App Review submission or public release.

## Commands

Refresh the evidence snapshot:

```bash
tools/release/check-w9-app-store-readiness.sh --write
```

Run as a strict gate where external blockers fail the command:

```bash
tools/release/check-w9-app-store-readiness.sh --strict
```

## Screenshot Naming

Store screenshots under `ios/fastlane/screenshots/en-US/`. Use filenames that include the device family, for example:

- `iphone-6.7-01-dashboard.png`
- `iphone-6.7-02-meals.png`
- `iphone-6.5-01-dashboard.png`

The checker intentionally reports missing screenshots as an external blocker until the UI is locked and approved.

## Release Guardrail

`ios/fastlane/Fastfile` keeps App Review submission manual with `submit_for_review: false`. This is deliberate: submitting to App Review is a Vital Question and must be explicitly approved by Robert.

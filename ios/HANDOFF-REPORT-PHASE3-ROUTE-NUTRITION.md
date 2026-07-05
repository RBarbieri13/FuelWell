# FuelWell - Phase 3 Route Nutrition Handoff

Date: 2026-05-24
Branch: `feature/phase-3-route-nutrition`

## Summary

- Routed the `Meals` tab from the placeholder tab hub into `DailyLogView`.
- Added the App target dependency on the Nutrition feature package.
- Seeded the live in-memory nutrition repository with deterministic preview
  meals so the routed screen has immediate content.
- Kept the feature import guard strict while allowing the root App feature to
  compose leaf features.
- Added a read-only live simulator viewer under `tools/simulator-live`.

## Verification

- `xcodegen generate`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' build`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `tools/simulator-live/rebuild-and-launch.sh`
- `tools/simulator-live/start-viewer.sh`

## Live Simulator

The viewer serves simulator screenshots at `http://127.0.0.1:8787`.

To share a temporary public URL:

```bash
cloudflared tunnel --url http://127.0.0.1:8787
```

To keep the shared preview following merged `main` changes, run:

```bash
tools/simulator-live/watch-main.sh
```

The watcher uses a separate `FuelWell-live` worktree so it does not disturb the
active development checkout.

## Next Slice

Build the first Add Meal flow from the daily log, then replace the seeded live
repository with persistence-backed storage.

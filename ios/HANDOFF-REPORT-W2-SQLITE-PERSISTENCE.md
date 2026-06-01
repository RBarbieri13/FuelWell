# FuelWell W2 SQLite Persistence Foundation Handoff

Branch: `feature/w2-sqlite-persistence-foundation`

## Summary

This slice replaces the placeholder local persistence path with a real SQLite-backed foundation while keeping the feature-facing protocols stable. Meal logs now persist through SQLite, legacy JSON meal logs import on first access, and the pending-write queue now uses the same local database foundation that future Supabase sync work can flush.

## What Changed

- Implemented `SQLiteDataStore` with WAL, foreign keys, schema migration tracking, meal-entry storage, pending-write storage, and sync-state tables.
- Moved JSON/file attachment helpers into `FileStores.swift` so SQLite and file persistence stay readable and lintable.
- Updated `LocalNutritionRepository` to store meal entries in SQLite while keeping meal photos in the existing attachment folder.
- Added one-time legacy JSON import into SQLite when the local nutrition repository first opens an empty database.
- Updated `PendingWriteQueue` to persist through the SQLite `pending_writes` table instead of a JSON file.
- Queued meal save/delete mutations as durable pending writes in the same SQLite database.
- Added `PendingWriteSyncClient` so queued meal-log writes can flush through `SupabaseDatabaseClient.insertMeal` for the authenticated user without requiring live credentials in tests.
- Added simulator tests for migration table creation, SQLite meal soft delete behavior, legacy JSON import, and pending-write reload/remove behavior.

## Verification

- `swiftlint --strict --config .swiftlint.yml`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme PersistenceTests -destination 'platform=iOS Simulator,name=iPhone 17'`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme CoreTests -destination 'platform=iOS Simulator,name=iPhone 17'`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme SupabaseClientTests -destination 'platform=iOS Simulator,name=iPhone 17'`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme NutritionTests -destination 'platform=iOS Simulator,name=iPhone 17'`
- `scripts/check-feature-imports.sh`
- `scripts/check-theme-drift.sh`
- `bash -n tools/release/check-phase4-readiness.sh tools/release/check-phase7-founding100.sh tools/release/check-phase7-commerce-linkage.sh tools/operate/check-operate-readiness.sh tools/release/check-w7-readiness.sh`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme AppTests -destination 'platform=iOS Simulator,name=iPhone 17'`
- `xcodebuild test -quiet -project FuelWellApp.xcodeproj -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17'`

## Still Required

- Supabase staging still needs `FUELWELL_SUPABASE_DB_URL` and `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` before live migrations and kill-switch drills can run.
- This PR creates the local flush client and covers meal-log flush behavior with tests, but does not auto-run live sync from app launch. That belongs in the next W2/W3 live-sync slice after staging schema is confirmed.

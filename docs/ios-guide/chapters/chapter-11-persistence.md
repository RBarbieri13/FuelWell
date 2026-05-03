# Chapter 11: Persistence — SQLiteData Behind a Repository

*"The database is the only thing in your app that the user actually owns. Treat it that way."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Set up SQLiteData (built on GRDB) as FuelWell's local store.
2.  Define @Table types that map cleanly between domain models and SQLite rows.
3.  Write schema migrations that move forward without losing data.
4.  Implement a real LiveNutritionRepository that satisfies the protocol from Chapter 4.
5.  Enable CloudKit sync so a user's data follows them across devices.
6.  Decide what belongs in the database, what belongs in Keychain, and what belongs encrypted at the file level.

## Prerequisites

  - Chapters 1–10 complete.
  - Add/edit/delete meal flows work against the in-memory repository.
  - Networking layer with Supabase integration is functional.

  

## 11.1 Why SQLiteData and Not SwiftData

The Reconciliation Matrix's persistence row is the most contested decision in the whole stack. Three reports recommend SwiftData; two strongly prefer SQLiteData on GRDB. We chose SQLiteData. The reasoning, in plain terms:

  

  - **SwiftData has documented stability problems with complex relations** — exactly the shape of FuelWell's data (nutrition logs with food references, workouts with exercise references, vitamins with timing references). The reports cite real production crashes around many-to-many relationships and background context merges.
  - **SQLiteData gives you SwiftData-style ergonomics** (@Table, @FetchAll) but runs on **GRDB**, which has a decade of production hardening as the gold-standard SQLite library for Swift.
  - **It pairs natively with the Point-Free ecosystem** we've already adopted (TCA, swift-dependencies). Same authors, consistent patterns.
  - **CloudKit sync is first-class** — not a bolted-on layer.

  

The tradeoff: SwiftData has Apple's marketing momentum and will improve. If Apple fixes the relational issues in iOS 27 or 28, this decision becomes worth revisiting. The repository protocol from Chapter 4 makes that revisit a swap, not a rewrite.

  

**Decision point** — the Reconciliation Matrix **Persistence** row commits us to SQLiteData behind a repository. The repository pattern is the entire reason this decision is reversible later.

  

## 11.2 Adding SQLiteData to the Persistence Package

Edit Packages/Persistence/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "Persistence",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "Persistence", targets: \["Persistence"\]),

  

    \],

  

    dependencies: \[

  

        .package(path: "../Core"),

  

        .package(url: "https://github.com/pointfreeco/sqlite-data",

  

                 from: "1.0.0"),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "Persistence",

  

            dependencies: \[

  

                .product(name: "Core", package: "Core"),

  

                .product(name: "SQLiteData", package: "sqlite-data"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "PersistenceTests",

  

            dependencies: \["Persistence"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

Add Persistence to the FuelWell app target in Xcode. Run /build to confirm SPM resolves cleanly.

  

## 11.3 The Storage Schema

Two things are worth distinguishing before we write code:

  

  - **Domain models** — MealEntry from Core. Designed for the app's logic. Lives in feature code.
  - **Storage models** — MealRow (we're about to write it). Designed for the database. Lives only in Persistence.

  

Some teams collapse these into one type. That works until your domain model needs a field SQLite can't represent (an enum with associated values, say) or your database needs a denormalization the domain doesn't care about. Two types with a mapper is more code on day one and dramatically less pain on day three hundred.

  

Create the storage type:

  

// Packages/Persistence/Sources/Persistence/Schema/MealRow.swift

  

import Foundation

  

import SQLiteData

  

@Table("meals")

  

struct MealRow: Equatable, Sendable {

  

    @Column(primaryKey: true)

  

    var id: UUID

  

    var name: String

  

    var calories: Int

  

    var protein: Double

  

    var carbs: Double

  

    var fat: Double

  

    @Column("logged\_at")

  

    var loggedAt: Date

  

    @Column("created\_at")

  

    var createdAt: Date

  

    @Column("updated\_at")

  

    var updatedAt: Date

  

}

  

A few details worth noting:

  

  - **@Table("meals")** makes the type a SQLite table named meals. SQLiteData generates the boilerplate to read/write it.
  - **@Column("logged\_at")** explicitly names the SQL column. Snake\_case in the database, camelCase in Swift — the convention most backends use.
  - **createdAt** **and** **updatedAt** **are storage concerns, not domain concerns.** The domain doesn't need them; the database keeps them for sync, debugging, and audit.
  - **MealRow** **is** **internal****.** Feature code never sees it. The repository converts to/from MealEntry at the boundary.

### The mapper

// Packages/Persistence/Sources/Persistence/Schema/MealRow+Mapping.swift

  

import Core

  

import Foundation

  

extension MealRow {

  

    init(entry: MealEntry, now: Date = .now) {

  

        self.id = entry.id

  

        self.name = entry.name

  

        self.calories = entry.calories

  

        self.protein = entry.protein

  

        self.carbs = entry.carbs

  

        self.fat = entry.fat

  

        self.loggedAt = entry.loggedAt

  

        self.createdAt = now

  

        self.updatedAt = now

  

    }

  

    func toDomain() -\> MealEntry {

  

        MealEntry(

  

            id: id,

  

            name: name,

  

            calories: calories,

  

            protein: protein,

  

            carbs: carbs,

  

            fat: fat,

  

            loggedAt: loggedAt

  

        )

  

    }

  

}

  

Two functions, one direction each. Boring on purpose. If you ever add a domain field SQLite doesn't carry (a runtime computed property, say), the mapper is the one place to handle the gap.

  

## 11.4 The Database

SQLiteData uses a Database actor that owns the connection. Set one up:

  

// Packages/Persistence/Sources/Persistence/FuelWellDatabase.swift

  

import Foundation

  

import SQLiteData

  

public actor FuelWellDatabase {

  

    public static let shared = FuelWellDatabase()

  

    let database: Database

  

    private init() {

  

        let storeURL = Self.storeLocation()

  

        do {

  

            self.database = try Database(

  

                path: storeURL.path,

  

                migrator: Self.makeMigrator()

  

            )

  

        } catch {

  

            // A corrupt or inaccessible database is unrecoverable.

  

            // Fail loud at launch rather than degrade silently.

  

            fatalError("Could not open FuelWell database: \\(error)")

  

        }

  

    }

  

    private static func storeLocation() -\> URL {

  

        let folder = try\! FileManager.default

  

            .url(for: .applicationSupportDirectory,

  

                 in: .userDomainMask,

  

                 appropriateFor: nil,

  

                 create: true)

  

        return folder.appendingPathComponent("fuelwell.sqlite")

  

    }

  

    private static func makeMigrator() -\> Migrator {

  

        var migrator = Migrator()

  

        migrator.registerMigration("v1: meals") { db in

  

            try db.create(table: "meals") { t in

  

                t.column("id", .text).primaryKey()

  

                t.column("name", .text).notNull()

  

                t.column("calories", .integer).notNull()

  

                t.column("protein", .double).notNull()

  

                t.column("carbs", .double).notNull()

  

                t.column("fat", .double).notNull()

  

                t.column("logged\_at", .datetime).notNull().indexed()

  

                t.column("created\_at", .datetime).notNull()

  

                t.column("updated\_at", .datetime).notNull()

  

            }

  

        }

  

        return migrator

  

    }

  

}

  

Three points worth pausing on:

  

**fatalError** **on init failure is intentional.** A corrupt database isn't something the app can paper over. Crashing at launch with a clear message is far better than running with broken persistence and corrupting more data.

  

**storeLocation()** **uses** **applicationSupportDirectory****.** Don't use documentsDirectory for SQLite — that's user-visible in the Files app and Apple discourages putting opaque blobs there. Application Support is the right home for app-managed data.

  

**The migrator is the single source of truth for schema.** Every change to the database goes through a new migration registration. We'll add a v2 migration in §11.7.

  

## 11.5 The Live Repository

Now the part feature code interacts with — the live NutritionRepository implementation:

  

// Packages/Persistence/Sources/Persistence/Repositories/LiveNutritionRepository.swift

  

import Core

  

import Foundation

  

import SQLiteData

  

public actor LiveNutritionRepository: NutritionRepository {

  

    private let database: FuelWellDatabase

  

    public init(database: FuelWellDatabase = .shared) {

  

        self.database = database

  

    }

  

    public func entries(for date: Date) async throws -\> \[MealEntry\] {

  

        let calendar = Calendar.current

  

        let dayStart = calendar.startOfDay(for: date)

  

        guard let dayEnd = calendar.date(byAdding: .day, value: 1, to: dayStart)

  

        else { return \[\] }

  

        let rows: \[MealRow\] = try await database.database.read { db in

  

            try MealRow

  

                .where { $0.loggedAt \>= dayStart && $0.loggedAt \< dayEnd }

  

                .order(by: { $0.loggedAt })

  

                .fetchAll(db)

  

        }

  

        return rows.map { $0.toDomain() }

  

    }

  

    public func save(\_ entry: MealEntry) async throws {

  

        let row = MealRow(entry: entry)

  

        try await database.database.write { db in

  

            try row.upsert(db)

  

        }

  

    }

  

    public func delete(id: MealEntry.ID) async throws {

  

        try await database.database.write { db in

  

            try MealRow.delete(id: id, db: db)

  

        }

  

    }

  

}

  

Notice the shape:

  

  - **It's an** **actor****.** Database access is serialized — no two writes happen at the same time. This is correctness, not performance.
  - **database.read { ... }** **and** **database.write { ... }** open a transaction implicitly. SQLiteData ensures reads see consistent state even when writes are concurrent.
  - **upsert** handles both insert and update — the same code path covers "new meal" and "edit existing meal." Whether the row exists is decided by the primary key.
  - **The returned** **\[MealEntry\]** **is a value copy.** Once it leaves the actor, the database has nothing to do with it. No lazy-loaded relationships, no detached-object surprises.

### Registering the live implementation

Update Packages/Core/Sources/Core/Dependencies/NutritionDependency.swift to no longer use the in-memory implementation as the live value. The cleanest way is to register the live implementation from the app at launch:

  

// In FuelWellApp.swift

  

import Persistence

  

import Dependencies

  

@main

  

struct FuelWellApp: App {

  

    init() {

  

        prepareDependencies {

  

            $0.nutritionRepository = LiveNutritionRepository()

  

            $0.foodDatabase = LiveFoodDatabase(

  

                url: LocalConfig.supabaseURL,

  

                key: LocalConfig.supabaseAnonKey

  

            )

  

        }

  

    }

  

    // ... rest unchanged

  

}

  

The liveValue in NutritionDependency.swift can stay as unimplemented(...) — it's there as a safety net for code paths that forget to register, not as the actual production value.

  

Run /run. Add a meal. Force-quit the app (Cmd+Shift+H twice in the simulator, swipe up). Relaunch. The meal should still be there. That's persistence working.

  

## 11.6 Reactive Queries

For lists that should update automatically when the underlying data changes, SQLiteData offers @FetchAll — a property wrapper that subscribes to a query and re-runs it when matching rows change. This is fantastic for pure SwiftUI bindings, but in our TCA world we already have one source of truth (the reducer's state) and don't want a second subscription path.

  

So we use SQLiteData's reactive queries selectively — for views that are read-only and don't go through a reducer (think the Component Gallery or a debug screen). For everything else, the reducer fetches via the repository, stores the result in state, and re-fetches when an action says to.

  

This is a deliberate consistency choice: in our architecture, reducers own state. If we let SwiftUI views subscribe to the database directly, we have two paths to the same data and inevitable drift. One path, even if slightly more verbose, is correct.

  

**⚠️ Common Pitfall — Mixing reactive queries with TCA state**

  

A view that reads @FetchAll var meals directly from the database alongside store.entries will display whichever value updated last. Pick one. In our architecture, that's store.entries.

  

## 11.7 Migrations: Adding a Field Without Losing Data

Three months from now, you'll want to add a notes: String? field to meals. The migration that handles this:

  

// Inside FuelWellDatabase.makeMigrator()

  

migrator.registerMigration("v2: meal notes") { db in

  

    try db.alter(table: "meals") { t in

  

        t.add(column: "notes", .text)  // nullable by default

  

    }

  

}

  

Three rules for safe migrations:

  

1.  **Migrations are append-only.** Once v1: meals ships to a user, you never edit it. New changes go in new migrations. The migrator name is permanent.
2.  **Add columns as nullable.** Existing rows get NULL; you don't have to backfill. If you need a default value, add it in the migration: t.add(column: "notes", .text).defaults(to: "").
3.  **Test the migration on real data.** Copy a production database (after stripping PII) into a test fixture and run the migrator against it before shipping. Forward-only migrations leave no rollback path.

  

Update the corresponding MealRow and MealEntry types to include the field, and update the mapper. The repository code doesn't change at all — upsert handles the new column automatically.

  

## 11.8 CloudKit Sync

SQLiteData offers a CloudKit integration that mirrors your local database to the user's iCloud account, with conflict resolution and automatic restoration on a new device.

  

The setup, in three steps:

  

**Step 1 — Enable CloudKit in your Xcode target.**

  

  - Open the FuelWell target → Signing & Capabilities → + Capability.
  - Add **iCloud**, then check **CloudKit** and add a container ID like iCloud.com.example.fuelwell.
  - Also add **Background Modes** with **Remote notifications** checked (so syncs trigger in the background).

  

**Step 2 — Configure the database for sync.**

  

// Inside FuelWellDatabase init:

  

self.database = try Database(

  

    path: storeURL.path,

  

    migrator: Self.makeMigrator(),

  

    cloudKit: .init(

  

        containerIdentifier: "iCloud.com.example.fuelwell",

  

        zone: "FuelWellPrivate"

  

    )

  

)

  

**Step 3 — Mark synced tables in their migration.** SQLiteData syncs tables that are explicitly enabled:

  

migrator.registerMigration("v1: meals") { db in

  

    try db.create(table: "meals", syncedToCloud: true) { t in

  

        // ... columns

  

    }

  

}

  

That's it. Saves to the local database now propagate to iCloud asynchronously, and changes from other devices flow back into the local database, triggering your reactive queries (or, in our case, prompting your reducer to re-fetch on the next onAppear).

### Conflict resolution

The default policy in SQLiteData is **last-write-wins by** **updated\_at** **timestamp.** For most fields, this is fine — the user editing a meal name on phone vs iPad isn't a critical conflict.

  

For more sensitive cases (workout completion, payment state), you can supply a custom resolver. We don't need this in v0; we'll revisit if specific fields demand it.

  

**Decision point** — sync introduces a class of bug that doesn't exist in single-device apps: clock skew, partial sync, lost updates. For v0 of FuelWell, enable CloudKit but plan for **Chapter 20** to revisit conflict telemetry. Don't wait for "perfect sync" before shipping.

  

## 11.9 What Belongs Where

The three tiers of on-device storage and what each is for:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Storage\*\* | \*\*What goes here\*\* | \*\*Why\*\* |
| \*\*SQLite (via SQLiteData)\*\* | Domain data: meals, workouts, vitamins, settings, cache of remote data | Queryable, transactional, syncable |
| \*\*Keychain\*\* | Auth tokens, refresh tokens, encryption keys | Per-app encrypted, survives reinstall, OS-managed |
| \*\*UserDefaults\*\* | Tiny scalar UI prefs: "has seen onboarding", last-selected tab | Easy, but unencrypted and unstructured |
| \*\*File system (encrypted)\*\* | Large binary blobs: photos, exports, model files | SQLite isn't great for big blobs |

  

A common mistake is to put auth tokens in UserDefaults. Don't — they're unencrypted and visible to anyone with file-system access (jailbroken device, iTunes backup). Keychain is non-negotiable for credentials.

  

Wrap Keychain access in a small KeychainStore actor. We'll need this when we add Supabase auth in a future chapter; the protocol for now:

  

// Packages/Core/Sources/Core/Keychain/KeychainStore.swift

  

import Foundation

  

public protocol KeychainStore: Sendable {

  

    func get(key: String) async throws -\> String?

  

    func set(\_ value: String, for key: String) async throws

  

    func delete(key: String) async throws

  

}

  

Implementations using SecItemAdd/SecItemCopyMatching are a chapter unto themselves; for now, the protocol exists and the live implementation can be added when first needed.

  

## 11.10 Updating Tests

Tests against the in-memory InMemoryNutritionRepository from Chapter 4 keep working — they target the protocol, not the implementation. But you should also add tests against LiveNutritionRepository to catch SQL-level bugs:

  

// Packages/Persistence/Tests/PersistenceTests/LiveNutritionRepositoryTests.swift

  

import Core

  

import Foundation

  

import Testing

  

@testable import Persistence

  

@MainActor

  

struct LiveNutritionRepositoryTests {

  

    @Test

  

    func saveAndFetch\_roundTrips() async throws {

  

        let db = try await ephemeralDatabase()

  

        let repo = LiveNutritionRepository(database: db)

  

        let entry = MealEntry(

  

            name: "Test Oats",

  

            calories: 310,

  

            protein: 10, carbs: 55, fat: 6

  

        )

  

        try await repo.save(entry)

  

        let fetched = try await repo.entries(for: .now)

  

        \#expect(fetched.contains { $0.id == entry.id })

  

        \#expect(fetched.first?.name == "Test Oats")

  

    }

  

    @Test

  

    func delete\_removesEntry() async throws {

  

        let db = try await ephemeralDatabase()

  

        let repo = LiveNutritionRepository(database: db)

  

        let entry = MealEntry(

  

            name: "Doomed",

  

            calories: 100,

  

            protein: 1, carbs: 1, fat: 1

  

        )

  

        try await repo.save(entry)

  

        try await repo.delete(id: entry.id)

  

        let fetched = try await repo.entries(for: .now)

  

        \#expect(fetched.contains { $0.id == entry.id } == false)

  

    }

  

    private func ephemeralDatabase() async throws -\> FuelWellDatabase {

  

        // Test helper that creates a fresh DB at a temp URL.

  

        // (Add this helper to Persistence with \`internal\` access.)

  

        return try await FuelWellDatabase.ephemeralForTesting()

  

    }

  

}

  

You'll need a small test-only factory in FuelWellDatabase:

  

extension FuelWellDatabase {

  

    static func ephemeralForTesting() async throws -\> FuelWellDatabase {

  

        let path = NSTemporaryDirectory() + "fw-test-\\(UUID()).sqlite"

  

        // Use a constructor variant that takes an explicit path

  

        // and skips CloudKit. (Sketch — actual API depends on

  

        // SQLiteData's testing support.)

  

        return /\* ... \*/

  

    }

  

}

  

The reason to test the live implementation directly: SwiftData/SQLite mismatches (a query that compiles but returns wrong data, a date encoding that loses milliseconds) only show up against the real engine. The protocol-level tests using InMemoryNutritionRepository don't catch those.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Domain model and storage row collapsed into one type | Keep MealEntry and MealRow separate; map at the boundary |
| Editing or removing an old migration | Migrations are append-only; never modify shipped ones |
| New columns added as NOT NULL without a default | Existing rows fail the migration; default or nullable always |
| Database in documentsDirectory | User-visible and discouraged; use applicationSupportDirectory |
| Auth tokens in UserDefaults | Keychain — unencrypted UserDefaults is a security finding |
| Reactive @FetchAll alongside reducer state | Pick one source of truth; in our architecture it's the reducer |
| Reading MealRow outside Persistence | Wrap in repo; mapping stays at the boundary |
| Skipping live-repository tests | Protocol tests miss SQL/encoding bugs; test the real engine too |
| Catching all DB errors silently | A failed write is data loss; surface to the user via error state |

  

## Hands-On Exercise

**Goal:** complete the in-memory → SQLiteData migration end-to-end, then add a v2 migration for a new field.

  

1.  **Wire up the live repository.** Update FuelWellApp.init to register LiveNutritionRepository(). Run /run. Verify add/edit/delete persist across app launches.

  

1.  **Add a** **notes: String?** **field to meals.**

  

  - Update MealEntry (Core) to include notes: String?.
  - Update MealRow (Persistence) and the mapper.
  - Add a v2 migration in FuelWellDatabase.makeMigrator().
  - Add a "Notes" TextField to EditMealView.
  - Run /run. Edit an existing meal, add notes, force-quit, relaunch — notes should persist.

  

1.  **Verify migration correctness.** Delete the simulator's app data (Device → Erase All Content and Settings is heavy-handed; instead use xcrun simctl uninstall \<UDID\> com.example.fuelwell then reinstall). The first launch should run v1 + v2 cleanly. You can also write a unit test that opens an empty DB, runs the v1 migration only, inserts a row, then runs v2 and confirms the row survives.

  

1.  **Add an index to optimize the by-date query.** The Chapter 11 schema already adds .indexed() on logged\_at. Verify it's there and add a fetch-all-meals-this-week query to the repository to exercise it.

  

1.  **Stretch:** wire CloudKit sync. Enable iCloud capability in Xcode, add the container, configure the database with the CloudKit options, and test on two devices (or a device + simulator with the same Apple ID).

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 11: SQLiteData persistence with notes field and v2 migration"

  

git push

  

**Time budget:** 3 hours. The CloudKit step alone can eat an hour the first time you set it up — Apple's provisioning UI is fiddly. If you hit a wall on iCloud, skip it for now and come back; persistence works fine without it for v0.

  

## What's Next

Chapter 12 — **Concurrency in Production** — pulls together everything you've learned about Swift Concurrency and applies it to the four places it matters most: HealthKit, the database, network calls, and SwiftUI's main actor. You'll learn the isolation policy that keeps strict concurrency green across the whole codebase, parallel fetching with TaskGroup, cancellation patterns, and how to debug actor reentrancy when it inevitably surprises you. By the end, the FuelWell dashboard will fetch nutrition, workouts, and HealthKit data concurrently, with proper cancellation when the view disappears.

  
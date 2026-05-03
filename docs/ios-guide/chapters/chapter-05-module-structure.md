# Chapter 5: Module Structure & SPM

*"A module boundary is a contract. Every* *public* *you type is a promise to your future self."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Design a feature-module topology that enforces one-way dependency flow.
2.  Distinguish internal, public, and package access control and use each correctly.
3.  Write Package.swift files that compile fast and expose narrow APIs.
4.  Use @\_exported deliberately (and know when it's a design smell).
5.  Diagnose and fix common SPM pitfalls: circular dependencies, slow resolution, version conflicts.
6.  Explain why this structure makes Claude Code noticeably more accurate.

## Prerequisites

  - Chapters 1–4 complete.
  - Your DailyLogFeature builds, runs, and passes tests.
  - Familiarity with Swift access control keywords (public, internal, private, fileprivate). If these are fuzzy, read Apple's [Access Control docs](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/accesscontrol/) — ten minutes.

  

## 5.1 Why Modularize at All

At 500 lines of code, one module is fine. At 5,000 lines, boundaries start to matter. At 50,000 lines, boundaries are the only thing keeping the project buildable in under a minute.

  

FuelWell will sit between 5,000 and 50,000 lines of Swift over its lifetime. We modularize now, before it gets painful, because the alternatives are worse:

  

1.  **Build times.** A monolithic app target recompiles everything when you change one file. Split into modules, only the changed module and its dependents recompile. By v1.0 this means the difference between a 2-second incremental build and a 30-second one.

  

1.  **Mental load.** When you open a file, everything in the module is one import away. Everything outside the module is explicit. That's the boundary doing its job — forcing you to decide what's a shared concept and what's a local detail.

  

1.  **Testability.** A module with a small public surface is easy to mock. A god-module with everything internal is not.

  

1.  **AI agent accuracy.** This is the argument that flipped me. When Claude Code is working on Nutrition, its context window doesn't need to hold the entire app. It holds one feature package plus its narrow dependencies. Agents produce dramatically better code when the relevant context is smaller and cleaner. R1 and R4 both make this argument explicitly, and once you see it in practice you won't go back.

  

**Decision point** — the Reconciliation Matrix **Module structure** row commits us to pure SPM, no Tuist, no XcodeGen. Revisit only if cold build times exceed \~90s.

  

## 5.2 The Dependency Graph

Here's the graph we're heading toward by the end of this book:

  

flowchart TD

  

    App\[FuelWell App\]

  

    subgraph Features

  

        Dashboard

  

        Nutrition

  

        Workouts

  

        Vitamins

  

    end

  

    subgraph Packages

  

        AppCoordinator

  

        DesignSystem

  

        Core

  

        Networking

  

        Persistence

  

        HealthKitClient

  

        AIClient

  

    end

  

    App --\> AppCoordinator

  

    App --\> DesignSystem

  

    AppCoordinator --\> Dashboard

  

    AppCoordinator --\> Nutrition

  

    AppCoordinator --\> Workouts

  

    AppCoordinator --\> Vitamins

  

    Dashboard --\> DesignSystem

  

    Dashboard --\> Core

  

    Nutrition --\> DesignSystem

  

    Nutrition --\> Core

  

    Nutrition --\> Persistence

  

    Workouts --\> DesignSystem

  

    Workouts --\> Core

  

    Workouts --\> HealthKitClient

  

    Vitamins --\> DesignSystem

  

    Vitamins --\> Core

  

    Persistence --\> Core

  

    HealthKitClient --\> Core

  

    Networking --\> Core

  

    AIClient --\> Core

  

    AIClient --\> Networking

  

    DesignSystem --\> Core

  

Two rules govern the graph:

  

1.  **Features depend on Packages. Packages never depend on Features.**
2.  **Features never depend on other Features.**

  

That's it. If you find yourself wanting to import Nutrition from inside Workouts, stop — the thing they both need belongs in Core or one of the other packages. Shared *data* goes in Core. Shared *UI* goes in DesignSystem. Shared *behavior* gets extracted into its own package.

  

The second rule — features don't see each other — is what keeps the graph acyclic. Without it, everything silently becomes a ball of mud. With it, you can delete any feature and the rest of the app still compiles.

  

## 5.3 Access Control: the Three Levels You Actually Use

Swift has five access levels; you'll use three.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Keyword\*\* | \*\*Meaning\*\* | \*\*When to use\*\* |
| private | Visible only within the enclosing declaration | Default for struct/class fields |
| internal | Visible within the module (default) | Most types and functions |
| public | Visible to anyone who imports the module | Only the module's intentional API |

  

(fileprivate and open exist but are rarely needed — skip them until they're forced on you.)

  

The discipline: **public** **is expensive**. Every public type is an API commitment. Every public method is a surface you have to maintain compatibility with. Every public property is a field other code can read and bind to.

  

// ❌ Leaking internals

  

public struct MealEntry {

  

    public var rawCalories: Double      // Why can callers write this?

  

    public var internalStorage: \[String: Any\]  // Hell no

  

}

  

// ✅ Intentional API

  

public struct MealEntry: Equatable, Identifiable, Sendable {

  

    public let id: UUID

  

    public var name: String

  

    public var calories: Int

  

    // ... plus a public init — that's the whole API

  

}

  

The "Chapter 4 MealEntry" you wrote is already this shape. Good. When you write new types, ask: does the outside world *need* this to be public? If not, leave it internal.

### The package keyword

Swift 5.9 introduced package — visible to other targets within the same Swift package, but not to outside callers. We use it rarely in FuelWell because each of our packages has one main product anyway, but if you ever split one package into multiple internal targets, package is the right glue.

  

## 5.4 Rebuilding the Package.swift Files

Your Chapter 3 packages have bare-minimum Package.swift files. Let's bring them up to production shape. The pattern we want for every package:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "\<ModuleName\>",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "\<ModuleName\>", targets: \["\<ModuleName\>"\]),

  

    \],

  

    dependencies: \[

  

        // ...

  

    \],

  

    targets: \[

  

        .target(

  

            name: "\<ModuleName\>",

  

            dependencies: \[

  

                // explicit, narrow

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "\<ModuleName\>Tests",

  

            dependencies: \["\<ModuleName\>"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

// Shared settings — keeps the file readable.

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

Two new things here beyond Chapter 3:

  

  - **.enableUpcomingFeature("ExistentialAny")** — forces you to write any Protocol instead of bare Protocol when you mean "some value conforming to Protocol." Bare protocol types are a subtle performance trap; this flag makes them a compile error so you notice.
  - **swiftSettings** **extracted as a constant** — so you update the list once, not per target.

### Update Core

Packages/Core/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "Core",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "Core", targets: \["Core"\]),

  

    \],

  

    dependencies: \[

  

        .package(

  

            url: "https://github.com/pointfreeco/swift-composable-architecture",

  

            from: "1.15.0"

  

        ),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "Core",

  

            dependencies: \[

  

                .product(name: "ComposableArchitecture",

  

                         package: "swift-composable-architecture"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "CoreTests",

  

            dependencies: \["Core"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

### Update the feature packages

Features/Nutrition/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "Nutrition",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "Nutrition", targets: \["Nutrition"\]),

  

    \],

  

    dependencies: \[

  

        .package(path: "../../Packages/Core"),

  

        .package(path: "../../Packages/DesignSystem"),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "Nutrition",

  

            dependencies: \[

  

                .product(name: "Core", package: "Core"),

  

                .product(name: "DesignSystem", package: "DesignSystem"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "NutritionTests",

  

            dependencies: \["Nutrition"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

Apply the same pattern to Dashboard, Workouts, and the other Packages/\* Package.swift files. For now DesignSystem and the others only depend on Core.

  

Run /build — if you've enabled ExistentialAny and have bare protocol types anywhere, you'll see errors like use of protocol 'NutritionRepository' as a type must be written 'any NutritionRepository'. Fix them by adding any:

  

// In Dependencies.swift:

  

public var nutritionRepository: any NutritionRepository {  // already correct

  

    ...

  

}

  

## 5.5 @\_exported — Deliberate Use

In Chapter 4, Core re-exports TCA:

  

// Packages/Core/Sources/Core/Core.swift

  

@\_exported import ComposableArchitecture

  

This is a deliberate choice. Every feature package imports Core; none of them need to know that TCA comes from a separate SPM dependency. If we swapped TCA for something else tomorrow, feature packages wouldn't change a single import.

  

When to use @\_exported:

  

  - **Re-exporting a dependency** your module is built on top of (TCA for us, because every reducer needs it).
  - **Keeping import lists short** at call sites.

  

When **not** to use it:

  

  - To hide a dependency you're embarrassed about. If you hate having Alamofire as a dependency, the answer is to remove Alamofire, not to re-export it in a way that disguises it.
  - To paper over a design that should really expose the underlying module. If consumers of Networking need to directly use URLSession, don't @\_exported import Foundation from Networking — just expose the types you want them to use.

  

**⚠️ Common Pitfall —** **@\_exported** **everywhere**

  

The underscore is Swift's way of marking it as an underscored attribute — not officially supported, could change. Use it sparingly and never deeply nested. One level of re-export (Core → TCA) is fine. Three levels (App → Feature → Core → TCA, all @\_exported) is a debugging nightmare.

  

## 5.6 Promoting the Shared Types from Core

Your Core package currently holds MealEntry, NutritionRepository, and its dependency registration. Let's make sure it earns its position as the shared-types hub.

  

Core should hold:

  

  - **Pure domain models** — MealEntry, Workout, Vitamin, etc. Just data.
  - **Repository protocols** — the shapes of storage access. Implementations live in Persistence.
  - **Dependency registrations** — DependencyKey extensions. Default values should use in-memory or unimplemented test stand-ins.
  - **Cross-cutting types** — shared enums, errors, identifiers.
  - **The TCA re-export.**

  

Core should **not** hold:

  

  - SwiftUI views (DesignSystem).
  - Actual SQLite or network code (Persistence, Networking).
  - HealthKit code (HealthKitClient).
  - Any @Reducer — those are feature-specific.

  

Re-organize Packages/Core/Sources/Core/ to look like this:

  

Core/

  

├── Core.swift                   // Version + @\_exported import

  

├── Models/

  

│   └── MealEntry.swift          // (move from root)

  

├── Repositories/

  

│   └── NutritionRepository.swift  // Protocol only; the InMemory impl moves.

  

└── Dependencies/

  

    └── NutritionDependency.swift

  

Wait — where does InMemoryNutritionRepository go? It's an implementation, but a fake one, not a real one. It belongs in a shared test helper. We'll introduce that pattern formally in Chapter 13 (Dependency Injection). For now, leave it in Core but mark it clearly as a test/preview stand-in:

  

// Packages/Core/Sources/Core/Repositories/NutritionRepository.swift

  

import Foundation

  

public protocol NutritionRepository: Sendable {

  

    func entries(for date: Date) async throws -\> \[MealEntry\]

  

    func save(\_ entry: MealEntry) async throws

  

    func delete(id: MealEntry.ID) async throws

  

}

  

// MARK: - In-memory implementation (for tests and previews only)

  

public actor InMemoryNutritionRepository: NutritionRepository {

  

    private var storage: \[MealEntry\]

  

    public init(seed: \[MealEntry\] = MealEntry.mockList) {

  

        self.storage = seed

  

    }

  

    public func entries(for date: Date) async throws -\> \[MealEntry\] {

  

        let calendar = Calendar.current

  

        return storage.filter { calendar.isDate($0.loggedAt, inSameDayAs: date) }

  

    }

  

    public func save(\_ entry: MealEntry) async throws {

  

        if let i = storage.firstIndex(where: { $0.id == entry.id }) {

  

            storage\[i\] = entry

  

        } else {

  

            storage.append(entry)

  

        }

  

    }

  

    public func delete(id: MealEntry.ID) async throws {

  

        storage.removeAll { $0.id == id }

  

    }

  

}

  

And update NutritionDependency.swift to make the liveValue fail loudly when no real repository is registered — because once Persistence arrives in Chapter 11, the live value should come from there:

  

// Packages/Core/Sources/Core/Dependencies/NutritionDependency.swift

  

import Dependencies

  

extension DependencyValues {

  

    public var nutritionRepository: any NutritionRepository {

  

        get { self\[NutritionRepositoryKey.self\] }

  

        set { self\[NutritionRepositoryKey.self\] = newValue }

  

    }

  

}

  

private enum NutritionRepositoryKey: DependencyKey {

  

    // Live value is unimplemented until Chapter 11 registers the real one.

  

    public static var liveValue: any NutritionRepository {

  

        unimplemented(

  

            "NutritionRepository",

  

            placeholder: InMemoryNutritionRepository()

  

        )

  

    }

  

    public static var testValue: any NutritionRepository {

  

        InMemoryNutritionRepository()

  

    }

  

    public static var previewValue: any NutritionRepository {

  

        InMemoryNutritionRepository()

  

    }

  

}

  

unimplemented comes from the IssueReporting module that ships with swift-dependencies. It crashes loudly at test time if anyone reaches for a dependency that hasn't been registered, while still allowing the app to run via the fallback placeholder. This is the pattern: **let test failures be loud, let production have a safe default.**

  

## 5.7 Module-Private Helpers

Inside a feature module, you'll often want helpers that aren't part of the public API. internal (the default) is what you want.

  

Example: a formatter helper inside Nutrition:

  

// Features/Nutrition/Sources/Nutrition/Formatting.swift

  

import Foundation

  

// No \`public\` keyword — this is internal to the Nutrition module.

  

struct MacroFormatter {

  

    static func grams(\_ value: Double) -\> String {

  

        String(format: "%.0fg", value)

  

    }

  

    static func calories(\_ value: Int) -\> String {

  

        "\\(value) kcal"

  

    }

  

}

  

Other modules can't see MacroFormatter. That's correct — it's a formatting choice specific to how Nutrition displays its data. If Dashboard ever needs the same formatter, don't reach into Nutrition; extract the formatter to DesignSystem or Core first.

  

## 5.8 Preventing Cross-Feature Imports

Our rule says features never import features. SPM doesn't enforce this structurally — nothing stops you from adding .package(path: "../Dashboard") inside Nutrition's Package.swift. The discipline has to come from the team (you).

  

Two mitigations:

  

1.  **Code review habit.** When you're about to write import Dashboard inside Nutrition, stop. Ask: what do I actually need? Nine times out of ten, the thing you need is a shared *type* (which belongs in Core) or a shared *component* (which belongs in DesignSystem). Promote it there; both features consume it from the shared location.

  

1.  **A CI lint.** Danger Swift (which we'll wire in Chapter 17) can fail PRs that introduce feature-to-feature imports. For now, a simple grep works:

  

\# In scripts/check-feature-imports.sh

  

\#\!/usr/bin/env bash

  

set -e

  

for feature in Features/\*/Sources/\*/; do

  

    name=$(basename "$feature")

  

    \# Check for imports of other features.

  

    violations=$(grep -rE "^import (Dashboard|Nutrition|Workouts|Vitamins)" \\

  

        "$feature" | grep -v "import $name" || true)

  

    if \[ -n "$violations" \]; then

  

        echo "❌ Cross-feature import in $feature:"

  

        echo "$violations"

  

        exit 1

  

    fi

  

done

  

echo "✅ No cross-feature imports found."

  

Chapter 17 will wire this into GitHub Actions.

  

## 5.9 Diagnosing Common SPM Issues

### "Swift Package Manager cannot resolve the graph"

Usually a version conflict. Two of your packages depend on different versions of the same transitive dependency. Fix by pinning a version explicitly at the top-level Package.swift, or by letting SPM pick the latest compatible and deleting Package.resolved to re-resolve.

### Slow resolution

Symptoms: opening Xcode takes minutes before building. Causes:

  

  - Too many top-level SPM remotes (each is a git fetch).
  - Packages that depend on very broad version ranges (from: "1.0.0" instead of from: "1.15.0").

  

Fix: pin minimum versions tight. Prefer from: "1.15.0" over from: "1.0.0" — the former narrows the search space dramatically.

### Circular dependencies

SPM will error out. But if you see A → B → A implicitly through a third package, the fix is usually to extract the shared type *upward* — into Core — rather than downward.

### Tests can't see internal types

Use @testable import Nutrition at the top of your test file. This gives tests access to internal symbols. Don't make types public just to test them.

  

@testable import Nutrition

  

import Testing

  

@Test

  

func formatter\_formatsGrams() {

  

    \#expect(MacroFormatter.grams(23.7) == "24g")

  

}

  

## 5.10 Checking the Graph

Let's verify FuelWell's current graph. Run:

  

swift package show-dependencies --package-path Features/Nutrition

  

You should see:

  

.

  

└── Nutrition

  

    ├── Core

  

    │   └── swift-composable-architecture

  

    │       ├── swift-dependencies

  

    │       ├── swift-identified-collections

  

    │       └── ... (TCA transitives)

  

    └── DesignSystem

  

        └── Core (already visited)

  

Key observations:

  

  - No Nutrition → Workouts or any other feature dependency.
  - Core appears once (SPM dedupes).
  - TCA is a transitive dependency of Core; Nutrition doesn't list it directly.

  

That's the graph we want.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Making everything public "to be safe" | Default to internal; promote only when the outside world needs it |
| @\\\_exported used as a hiding mechanism | Re-export only when a dependency is structurally part of the module |
| Feature-to-feature imports | Extract the shared thing to Core or DesignSystem |
| Real implementations in Core | Core holds protocols and models; implementations live in their own packages |
| Wide version ranges in Package.swift | Pin from: "\\\<specific\\\>" to speed resolution |
| Forgetting swiftSettings on test targets | Tests need the same Swift 6 + strict concurrency flags as the target |
| unimplemented() absent from live dependency keys | Silent defaults hide the need to register the real dependency later |
| Bare Protocol type annotations | Enable ExistentialAny upcoming feature; write any Protocol |

  

## Hands-On Exercise

**Goal:** fix a contrived cross-feature dependency, then verify the graph is clean.

  

1.  **Introduce the anti-pattern deliberately.** Pretend that Workouts needs to show a recent meal in its post-workout summary. Inside Features/Workouts/Sources/Workouts/, create WorkoutSummary.swift:

  

import Foundation

  

// import Nutrition  // ← uncomment this and feel the pain

  

public struct WorkoutSummary: Sendable {

  

    public let workoutName: String

  

    public let recentMeal: String  // What if we want MealEntry here?

  

    public init(workoutName: String, recentMeal: String) {

  

        self.workoutName = workoutName

  

        self.recentMeal = recentMeal

  

    }

  

}

  

If you tried to store a MealEntry here by importing Nutrition, you'd create exactly the forbidden cycle.

  

1.  **Do it correctly.** MealEntry is already in Core. So instead, make WorkoutSummary depend on MealEntry from Core:

  

  - Update Features/Workouts/Package.swift to depend on Core (it probably already does).
  - Import Core in WorkoutSummary.swift.
  - Change recentMeal from String to MealEntry?.

  

import Core

  

public struct WorkoutSummary: Sendable {

  

    public let workoutName: String

  

    public let recentMeal: MealEntry?

  

    public init(workoutName: String, recentMeal: MealEntry? = nil) {

  

        self.workoutName = workoutName

  

        self.recentMeal = recentMeal

  

    }

  

}

  

This compiles. Workouts gets what it needs from Core without touching Nutrition. If Nutrition later changes how it stores meals internally, Workouts doesn't care.

  

1.  **Write the no-cross-feature-imports check.** Save the script from §5.8 as scripts/check-feature-imports.sh, make it executable (chmod +x), and run it:

  

./scripts/check-feature-imports.sh

  

You should see ✅ No cross-feature imports found.

  

1.  **Prove the graph is clean.** Run:

  

swift package show-dependencies --package-path Features/Workouts

  

Confirm Nutrition does not appear in the tree.

  

1.  **Refactor Core's folder layout** per §5.6:

  

Core/Sources/Core/

  

├── Core.swift

  

├── Models/

  

│   └── MealEntry.swift

  

├── Repositories/

  

│   └── NutritionRepository.swift

  

└── Dependencies/

  

    └── NutritionDependency.swift

  

Make sure /build and /test still pass after the reorganization.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 5: module structure hardened; no cross-feature deps"

  

git push

  

**Time budget:** 60–90 minutes. If the folder reorganization breaks imports, read the error carefully — the symbol names don't change when files move, so the fix is usually re-adding a file to its target membership in Xcode.

  

## What's Next

Chapter 6 — **Navigation: NavigationStack + TCACoordinators** — is where the features start to talk to each other. You'll build an AppCoordinator reducer that hosts Dashboard, Nutrition, and Workouts behind a tab bar, learn how to model navigation as state (so deep links work without special-casing), and see why imperative NavigationLink pushing falls apart at scale. By the end you'll have a three-tab app with a working deep link handler: fuelwell://meal/\<id\> opens the right detail screen from cold start.

  
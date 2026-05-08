# Chapter 4: Architecture: TCA for FuelWell

"Constraint is the feature."

## Learning Objectives

By the end of this chapter, you will:

  

1.  Have TCA and swift-dependencies installed via SPM
2.  Understand the State / Action / Reducer / Effect model that defines TCA
3.  Build the first feature reducer (DailyLogFeature) with a complete State, Action enum, and effect
4.  Scaffold the Repository protocol with an in-memory implementation
5.  Wire the reducer through the dependency injection system
6.  Write reducer tests using TestStore with exhaustive state assertions
7.  Run the new feature inside the FuelWell app shell

## Prerequisites

Chapters 1–3 complete. Xcode 26 project configured for Swift 6 with strict concurrency. Packages/Core exists and depends on nothing. Packages/DesignSystem exists with the generated Theme.generated.swift from Chapter 8 (or a stub theme if you're working through chapters in order).

  

## Why TCA

TCA (The Composable Architecture, by Point-Free) is the architecture pattern this guide commits to in consensus-stack.md. The reasoning is in reconciliation-matrix.md row 01. Briefly: TCA provides a state machine model where every state transition is a named action, every effect is a value, and every dependency is injected. The result is a codebase where:

  

  - Every feature is a self-contained reducer that can be reasoned about in isolation
  - Every state transition is testable without mocking
  - Every effect is debuggable by replaying actions
  - Every dependency has live, test, and preview values declared in one place

  

These properties matter at any scale, but they are *especially* important for solo + AI-first development. An AI agent can read a TCA reducer top to bottom, understand every state mutation, and propose changes that the type system enforces. The same agent reading a freeform @Observable codebase has to hold context that a TCA reducer makes explicit.

  

## Visual first: Claude Design before the reducer

Before April 2026, a TCA feature began with the State enum. You'd think about the data the feature held, write the State struct, then write Actions, then write the Reducer, and only at the end translate the result into a SwiftUI view.

  

After April 2026, the loop runs in reverse for any user-facing feature: the visual prototype comes first, and the State / Action / Reducer model gets fitted to it.

  

The reasoning: the visual prototype tells you what state actually exists. A DailyLogFeature mockup shows entries, an "add meal" button, an empty state, a loading state, perhaps an error state. Each of those is a piece of State. Designing the data first and the visuals second means re-fitting State once you see the screen. Designing the visual first means State falls out of it.

  

The pre-step:

  

\[Claude Design\]

  

Generate a daily log screen for FuelWell. Show today's logged meals with

  

calories and macros, an empty state when no meals have been logged, and

  

loading and error states. Include an "Add Meal" button at the top.

  

Use the existing design system. Three variations.

  

Pick a variation. Capture the URL. *Now* you have something concrete to fit the reducer to.

  

For non-user-facing features (a background sync reducer, a cache cleanup reducer), skip the Claude Design step. The visual-first rule applies to features that have a visible surface.

  

## Installing TCA

In Xcode: File → Add Package Dependencies. Add both URLs:

  

https://github.com/pointfreeco/swift-composable-architecture

  

https://github.com/pointfreeco/swift-dependencies

  

Version rule: Up to Next Major from 1.17. Add ComposableArchitecture to the FuelWell target. swift-dependencies is a transitive dependency, but you'll declare it explicitly in feature packages so the tooling treats it as first-class.

  

For Features/Nutrition/Package.swift, add to the dependencies array:

  

.package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.17.0"),

  

.package(url: "https://github.com/pointfreeco/swift-dependencies", from: "1.3.0"),

  

And to the target's dependencies:

  

.product(name: "ComposableArchitecture", package: "swift-composable-architecture"),

  

.product(name: "Dependencies", package: "swift-dependencies"),

  

Build. Should succeed.

  

## The DailyLogFeature reducer

Create Features/Nutrition/Sources/Nutrition/DailyLogFeature.swift:

  

import ComposableArchitecture

  

import Core

  

import Foundation

  

@Reducer

  

public struct DailyLogFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var entries: IdentifiedArrayOf\<MealEntry\> = \[\]

  

        public var selectedDate: Date = .now

  

        public var isLoading: Bool = false

  

        public var errorMessage: String?

  

        public init() {}

  

    }

  

    public enum Action: Equatable {

  

        case onAppear

  

        case entriesLoaded(\[MealEntry\])

  

        case loadFailed(String)

  

        case deleteSwiped(id: MealEntry.ID)

  

        case deleteFailed(id: MealEntry.ID, original: MealEntry)

  

    }

  

    @Dependency(\\.nutritionRepository) var repository

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .onAppear:

  

                state.isLoading = true

  

                state.errorMessage = nil

  

                return .run { \[date = state.selectedDate, repository\] send in

  

                    do {

  

                        let entries = try await repository.entries(for: date)

  

                        await send(.entriesLoaded(entries))

  

                    } catch {

  

                        await send(.loadFailed(error.localizedDescription))

  

                    }

  

                }

  

                .cancellable(id: CancelID.load, cancelInFlight: true)

  

            case let .entriesLoaded(entries):

  

                state.isLoading = false

  

                state.entries = IdentifiedArray(uniqueElements: entries)

  

                return .none

  

            case let .loadFailed(message):

  

                state.isLoading = false

  

                state.errorMessage = message

  

                return .none

  

            case let .deleteSwiped(id):

  

                guard let original = state.entries\[id: id\] else { return .none }

  

                state.entries.remove(id: id)

  

                return .run { \[repository\] send in

  

                    do {

  

                        try await repository.delete(id: id)

  

                    } catch {

  

                        await send(.deleteFailed(id: id, original: original))

  

                    }

  

                }

  

            case let .deleteFailed(\_, original):

  

                state.entries.append(original)

  

                return .none

  

            }

  

        }

  

    }

  

    private enum CancelID: Hashable { case load }

  

}

  

A few things to notice. The State is Equatable so TCA can detect changes. It's marked @ObservableState which gives SwiftUI views fine-grained observation. Every Action is Equatable and Codable-friendly so it's testable and replayable.

  

The @Dependency is a property wrapper that pulls a value from the dependency graph. We'll define nutritionRepository next.

  

The body is a single Reduce block. Each action is handled in a case. Actions that need to do something asynchronous return a .run effect. Effects are *values*, not direct calls — they describe what should happen, and TCA executes them.

  

The .cancellable(id:cancelInFlight:) pattern is important: if the user re-triggers onAppear (e.g., by switching tabs and switching back), the previous in-flight load is cancelled. Without this, racing loads can produce inconsistent state.

  

The optimistic delete pattern (deleteSwiped removes immediately, deleteFailed re-inserts on error) is a TCA idiom — show the user the result of their action immediately, and roll back only if the underlying operation fails.

  

## The Repository protocol

Create Packages/Core/Sources/Core/Repositories/NutritionRepository.swift:

  

import Foundation

  

public protocol NutritionRepository: Sendable {

  

    func entries(for date: Date) async throws -\> \[MealEntry\]

  

    func save(\_ entry: MealEntry) async throws

  

    func delete(id: MealEntry.ID) async throws

  

}

  

public struct MealEntry: Equatable, Identifiable, Sendable, Codable {

  

    public let id: UUID

  

    public var name: String

  

    public var calories: Int

  

    public var protein: Double

  

    public var carbs: Double

  

    public var fat: Double

  

    public var loggedAt: Date

  

    public init(

  

        id: UUID = UUID(),

  

        name: String,

  

        calories: Int,

  

        protein: Double,

  

        carbs: Double,

  

        fat: Double,

  

        loggedAt: Date = .now

  

    ) {

  

        self.id = id

  

        self.name = name

  

        self.calories = calories

  

        self.protein = protein

  

        self.carbs = carbs

  

        self.fat = fat

  

        self.loggedAt = loggedAt

  

    }

  

}

  

The protocol is Sendable because actors implementing it need to be safely shared. The MealEntry model is Codable so it can be persisted and serialized for analytics events without re-mapping.

  

## In-memory implementation

Create Packages/Core/Sources/Core/Repositories/InMemoryNutritionRepository.swift:

  

import Foundation

  

public actor InMemoryNutritionRepository: NutritionRepository {

  

    private var storage: \[UUID: MealEntry\] = \[:\]

  

    public init(seed: \[MealEntry\] = \[\]) {

  

        for entry in seed { storage\[entry.id\] = entry }

  

    }

  

    public func entries(for date: Date) async throws -\> \[MealEntry\] {

  

        let calendar = Calendar.current

  

        return storage.values

  

            .filter { calendar.isDate($0.loggedAt, inSameDayAs: date) }

  

            .sorted { $0.loggedAt \< $1.loggedAt }

  

    }

  

    public func save(\_ entry: MealEntry) async throws {

  

        storage\[entry.id\] = entry

  

    }

  

    public func delete(id: MealEntry.ID) async throws {

  

        storage.removeValue(forKey: id)

  

    }

  

}

  

This implementation uses an actor for thread-safe access to storage. Every method is async because the actor's isolation requires it.

  

The in-memory implementation isn't a placeholder — it's the implementation that's used in tests, in SwiftUI previews, and during early development. The LiveNutritionRepository (Chapter 11) is what runs in production; InMemoryNutritionRepository is what runs everywhere else.

  

## Dependency registration

Create Packages/Core/Sources/Core/Dependencies/NutritionRepositoryKey.swift:

  

import Dependencies

  

extension DependencyValues {

  

    public var nutritionRepository: any NutritionRepository {

  

        get { self\[NutritionRepositoryKey.self\] }

  

        set { self\[NutritionRepositoryKey.self\] = newValue }

  

    }

  

}

  

private enum NutritionRepositoryKey: DependencyKey {

  

    static var liveValue: any NutritionRepository {

  

        unimplemented("NutritionRepository", placeholder: InMemoryNutritionRepository())

  

    }

  

    static var testValue: any NutritionRepository {

  

        unimplemented("NutritionRepository")

  

    }

  

    static var previewValue: any NutritionRepository {

  

        InMemoryNutritionRepository(seed: \[

  

            .init(name: "Oatmeal", calories: 310, protein: 10, carbs: 55, fat: 6),

  

            .init(name: "Chicken", calories: 420, protein: 40, carbs: 12, fat: 22),

  

        \])

  

    }

  

}

  

Three values for three contexts:

  

  - liveValue is what runs in production. We mark it unimplemented(...) because the real implementation (Chapter 11) doesn't exist yet, and the in-memory one is the safe placeholder until then. When Chapter 11 arrives, this becomes LiveNutritionRepository().
  - testValue is what runs in tests. unimplemented(...) forces every test to explicitly provide its own value via withDependencies. This catches tests that accidentally hit a real dependency.
  - previewValue is what runs in SwiftUI previews. A realistic stub with seed data so previews look real, not empty.

  

Each is declared as static var { ... } (computed) rather than static let so each access produces a fresh instance. Shared let causes test bleed.

  

## Wiring the reducer at app launch

In FuelWellApp.swift (the @main app type), use prepareDependencies to register the live values that should override the unimplemented(...) defaults:

  

import ComposableArchitecture

  

import Core

  

import Nutrition

  

import SwiftUI

  

@main

  

struct FuelWellApp: App {

  

    init() {

  

        prepareDependencies {

  

            $0.nutritionRepository = InMemoryNutritionRepository()

  

        }

  

    }

  

    var body: some Scene {

  

        WindowGroup {

  

            DailyLogView(

  

                store: Store(initialState: DailyLogFeature.State()) {

  

                    DailyLogFeature()

  

                }

  

            )

  

            .theme(.light)

  

        }

  

    }

  

}

  

Until Chapter 11, the live value for nutritionRepository is InMemoryNutritionRepository. When Chapter 11 wires up LiveNutritionRepository, the registration changes here:

  

$0.nutritionRepository = LiveNutritionRepository()

  

That's the only line that changes. The reducer, the views, the tests — none of them know or care which implementation is running.

  

## Testing the reducer

Create Features/Nutrition/Tests/NutritionTests/DailyLogFeatureTests.swift:

  

import ComposableArchitecture

  

import Core

  

import Testing

  

@testable import Nutrition

  

@MainActor

  

struct DailyLogFeatureTests {

  

    @Test

  

    func onAppear\_loadsEntries() async {

  

        let entries = \[MealEntry(name: "Test", calories: 100, protein: 10, carbs: 10, fat: 5)\]

  

        let store = TestStore(initialState: DailyLogFeature.State()) {

  

            DailyLogFeature()

  

        } withDependencies: {

  

            $0.nutritionRepository = InMemoryNutritionRepository(seed: entries)

  

        }

  

        await store.send(.onAppear) {

  

            $0.isLoading = true

  

        }

  

        await store.receive(\\.entriesLoaded) {

  

            $0.isLoading = false

  

            $0.entries = IdentifiedArray(uniqueElements: entries)

  

        }

  

    }

  

    @Test

  

    func deleteSwipe\_removesOptimisticallyAndPersists() async {

  

        let entry = MealEntry(name: "Doomed", calories: 100, protein: 1, carbs: 1, fat: 1)

  

        let repo = InMemoryNutritionRepository(seed: \[entry\])

  

        var initialState = DailyLogFeature.State()

  

        initialState.entries = \[entry\]

  

        let store = TestStore(initialState: initialState) {

  

            DailyLogFeature()

  

        } withDependencies: {

  

            $0.nutritionRepository = repo

  

        }

  

        await store.send(.deleteSwiped(id: entry.id)) {

  

            $0.entries = \[\]

  

        }

  

    }

  

}

  

TestStore is the heart of TCA testing. It exhaustively tracks state mutations: every send must include a closure that describes the expected state change. If the actual state diverges from the expected state, the test fails with a precise diff.

  

The await store.receive(\\.entriesLoaded) pattern is how you assert on the *result* of an effect. send triggers the action; receive asserts on the action that the effect produces.

  

## When this feature has a UI

Chapter 7 covers the SwiftUI patterns. The view for DailyLogFeature is straightforward once the reducer exists:

  

public struct DailyLogView: View {

  

    @Bindable var store: StoreOf\<DailyLogFeature\>

  

    @Environment(\\.theme) private var theme

  

    public var body: some View {

  

        Group {

  

            if store.isLoading {

  

                ProgressView()

  

            } else if store.entries.isEmpty {

  

                MealLogEmptyState()

  

            } else {

  

                List {

  

                    ForEach(store.entries) { entry in

  

                        MealRow(entry: entry)

  

                            .swipeActions {

  

                                Button(role: .destructive) {

  

                                    store.send(.deleteSwiped(id: entry.id))

  

                                } label: { Label("Delete", systemImage: "trash") }

  

                            }

  

                    }

  

                }

  

                .listStyle(.plain)

  

            }

  

        }

  

        .navigationTitle("Today")

  

        .onAppear { store.send(.onAppear) }

  

        .alert("Couldn't load",

  

               isPresented: .constant(store.errorMessage \!= nil),

  

               actions: { Button("OK", role: .cancel) {} },

  

               message: { Text(store.errorMessage ?? "") })

  

    }

  

}

  

The view receives the store. It reads state via store.entries, store.isLoading, etc. It dispatches actions via store.send(...). There's no view model, no observable object, no manual binding code. The reducer owns the state; the view renders it.

  

## Common Pitfalls

|  |  |  |
| :-: | :-: | :-: |
| \*\*Pitfall\*\* | \*\*Why it happens\*\* | \*\*What to do instead\*\* |
| Putting the live implementation in liveValue before it exists | "I'll write the live impl later" | unimplemented(...) is the right default. The placeholder protects you from accidentally using uninitialized state |
| Using Array\\\<MealEntry\\\> instead of IdentifiedArrayOf\\\<MealEntry\\\> in State | Not knowing the IdentifiedArray type | TCA's foreach and observation rely on stable identity. IdentifiedArrayOf provides O(1) lookup and stable identity |
| Skipping the .cancellable(id:) on long-running effects | "It works fine" until two run in parallel | Every effect that loads or refreshes data needs a cancel id. The pattern is to cancelInFlight: true so re-triggers cancel the previous run |
| Mutating state outside the reducer | "Just this once" | This breaks the entire TCA model. State is mutated only inside Reduce { state, action in ... }. Not in views, not in models, not in extensions |
| Designing the State enum before generating the visual prototype | Code-first habit | For user-facing features, prototype with Claude Design first. The State falls out of the visual; the inverse is more work |
| Skipping TestStore in favor of "I'll write one integration test" | TestStore feels heavy | TestStore \*is\* the integration test surface. Every reducer change should have a TestStore test that exhaustively verifies state transitions |

  

## Hands-On Exercise

**Goal:** Take the FuelWell project from "TCA installed" to "first feature working with tests."

  

**Time budget:** 90 minutes.

  

**Steps:**

  

1.  (Optional but recommended) Generate a DailyLogFeature mockup via Claude Design with the prompt from this chapter. Capture the URL.
2.  Install TCA and swift-dependencies in Features/Nutrition/Package.swift.
3.  Create MealEntry model and NutritionRepository protocol in Packages/Core.
4.  Implement InMemoryNutritionRepository actor.
5.  Wire the dependency key with liveValue / testValue / previewValue.
6.  Implement DailyLogFeature reducer with all five actions.
7.  Wire prepareDependencies in FuelWellApp.swift.
8.  Implement a minimal DailyLogView (skip MealLogEmptyState for now if Chapter 7 isn't done; use a placeholder Text view).
9.  Write the two TestStore tests in Features/Nutrition/Tests/NutritionTests/.
10. Run xcodebuild test. Confirm green.
11. Run the app in the simulator. Confirm the daily log loads (with empty state if there are no entries).
12. Commit: git add . && git commit -m "Chapter 4: DailyLogFeature with repository and in-memory impl".

  

When the tests run green and the app shows the daily log, the architecture is in place. Every subsequent feature (AddMealFeature in Chapter 9, WeeklySummaryFeature, etc.) follows the same pattern: visual prototype, State, Action, Reducer, dependency, view, tests.

  

## What's Next

Chapter 5 covers the SPM topology — how the Features/ and Packages/ directories enforce module boundaries through the compiler. Chapter 6 wires TCACoordinators for navigation. Chapter 7 covers SwiftUI patterns and the Component Gallery. By the end of Chapter 7, you'll have an architecture, a module structure, navigation, and a UI library — the foundation that the remaining chapters build features and quality controls on top of.

  
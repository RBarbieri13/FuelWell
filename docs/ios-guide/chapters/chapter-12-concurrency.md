# Chapter 12: Concurrency in Production

*"Most concurrency bugs aren't bugs in concurrent code. They're bugs in code that didn't realize it was concurrent."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Apply a coherent isolation policy across UI, database, networking, and HealthKit layers.
2.  Use TaskGroup to run independent async work in parallel and aggregate results.
3.  Propagate cancellation through structured concurrency without leaking work.
4.  Build a HealthKit client as an actor with a clean async surface.
5.  Diagnose actor reentrancy and the "interleaving surprise" that comes with it.
6.  Wire all of the above into a Dashboard reducer that fetches three sources concurrently when the tab appears and cancels cleanly when it disappears.

## Prerequisites

  - Chapters 1–11 complete.
  - SQLiteData persistence is wired up; meals survive app restarts.
  - A real iPhone for HealthKit testing (HealthKit doesn't fully work in the simulator). If you don't have one, the exercise has a software-only fallback.

  

## 12.1 The Four Concurrency Domains in FuelWell

Every line of FuelWell code lives in exactly one of four concurrency domains:

  

flowchart TB

  

    subgraph MA\["@MainActor (UI)"\]

  

        Views\[SwiftUI Views\]

  

        Reducers\[TCA Reducers\]

  

        Stores\[Stores\]

  

    end

  

    subgraph DB\["FuelWellDatabase actor"\]

  

        SQLite\[SQLite reads/writes\]

  

    end

  

    subgraph HK\["HealthKitClient actor"\]

  

        HKQueries\[HKQuery executions\]

  

    end

  

    subgraph NS\["nonisolated (pure)"\]

  

        Network\[URLSession calls\]

  

        Pure\[Pure functions\]

  

        Models\[Value-type construction\]

  

    end

  

    Views --\>|await| DB

  

    Views --\>|await| HK

  

    Views --\>|await| NS

  

    Reducers --\>|.run effects| DB

  

    Reducers --\>|.run effects| HK

  

    Reducers --\>|.run effects| NS

  

The policy:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Domain\*\* | \*\*What lives here\*\* | \*\*Why\*\* |
| \*\*@MainActor\*\* | All SwiftUI views, all TCA reducers, all stores | Required for UI; reducers must mutate state on a single thread |
| \*\*Database actor\*\* | All SQLite reads and writes | Serialization is correctness, not performance |
| \*\*HealthKit actor\*\* | All HKQuery execution and result handling | HKHealthStore is thread-safe but its callbacks need orchestration |
| \*\*nonisolated\*\* | Network calls, pure transformations, value-type constructors | No shared mutable state — runs anywhere |

  

This isn't decoration. It's a contract. Every await in the codebase crosses one of these boundaries, and the compiler tells you when you've made a mistake.

  

## 12.2 The @MainActor Default

Approachable Concurrency makes top-level Swift code implicitly @MainActor. In our project, that means every SwiftUI View, every TCA @Reducer, and every TCA Store is automatically main-actor isolated without the annotation. If you've been wondering why we haven't been writing @MainActor everywhere, that's why — Xcode is doing it for us.

  

You'll write @MainActor explicitly only for non-view classes that need to touch UI state. We don't have any of those; in our architecture, anything UI-adjacent is a view or a reducer.

  

The opposite annotation, nonisolated, says "this thing isn't tied to any actor — call me from anywhere." Use it for pure functions and value-type constructors:

  

nonisolated func formatMacros(\_ entry: MealEntry) -\> String {

  

    "\\(entry.calories) kcal • \\(Int(entry.protein))g protein"

  

}

  

Pure formatters don't need @MainActor isolation — they don't touch shared state. Marking them nonisolated lets reducers call them from background tasks without an unnecessary main-thread hop.

  

**⚠️ Common Pitfall — Sprinkling** **@MainActor** **everywhere**

  

The @MainActor default already covers UI code. Adding the annotation manually to every file is noise. Reserve explicit @MainActor for the rare class that's not a view but needs main-thread safety (legacy UIKit bridges, mostly).

  

## 12.3 The HealthKit Client

HealthKit is the most concurrency-sensitive system in iOS. HKHealthStore is thread-safe in name but its query API is callback-based, with results delivered on background queues. Wrapping it in an actor gives us a clean async surface that fits the rest of the app.

  

Create the package's main client:

  

// Packages/HealthKitClient/Sources/HealthKitClient/HealthKitClient.swift

  

import Foundation

  

import HealthKit

  

public protocol HealthKitClient: Sendable {

  

    func requestAuthorization() async throws

  

    func todaySteps() async throws -\> Int

  

    func todayActiveCalories() async throws -\> Int

  

    func recentWorkouts(days: Int) async throws -\> \[WorkoutSummary\]

  

}

  

public struct WorkoutSummary: Equatable, Sendable, Identifiable {

  

    public let id: UUID

  

    public let activityName: String

  

    public let startDate: Date

  

    public let durationSeconds: TimeInterval

  

    public let activeCalories: Int

  

}

  

The protocol is the contract. Now the live implementation:

  

// Packages/HealthKitClient/Sources/HealthKitClient/LiveHealthKitClient.swift

  

import Foundation

  

import HealthKit

  

public actor LiveHealthKitClient: HealthKitClient {

  

    private let store: HKHealthStore

  

    public init() {

  

        self.store = HKHealthStore()

  

    }

  

    private static let stepCount = HKQuantityType(.stepCount)

  

    private static let activeEnergy = HKQuantityType(.activeEnergyBurned)

  

    private static let workoutType = HKObjectType.workoutType()

  

    public func requestAuthorization() async throws {

  

        guard HKHealthStore.isHealthDataAvailable() else {

  

            throw HealthKitError.notAvailable

  

        }

  

        let read: Set\<HKObjectType\> = \[

  

            Self.stepCount, Self.activeEnergy, Self.workoutType

  

        \]

  

        try await store.requestAuthorization(toShare: \[\], read: read)

  

    }

  

    public func todaySteps() async throws -\> Int {

  

        let calendar = Calendar.current

  

        let dayStart = calendar.startOfDay(for: .now)

  

        let predicate = HKQuery.predicateForSamples(

  

            withStart: dayStart, end: nil, options: .strictStartDate

  

        )

  

        let total: Double = try await withCheckedThrowingContinuation { cont in

  

            let query = HKStatisticsQuery(

  

                quantityType: Self.stepCount,

  

                quantitySamplePredicate: predicate,

  

                options: .cumulativeSum

  

            ) { \_, statistics, error in

  

                if let error {

  

                    cont.resume(throwing: HealthKitError.queryFailed(

  

                        error.localizedDescription

  

                    ))

  

                    return

  

                }

  

                let value = statistics?.sumQuantity()?.doubleValue(for: .count())

  

                    ?? 0

  

                cont.resume(returning: value)

  

            }

  

            store.execute(query)

  

        }

  

        return Int(total)

  

    }

  

    public func todayActiveCalories() async throws -\> Int {

  

        let calendar = Calendar.current

  

        let dayStart = calendar.startOfDay(for: .now)

  

        let predicate = HKQuery.predicateForSamples(

  

            withStart: dayStart, end: nil, options: .strictStartDate

  

        )

  

        let total: Double = try await withCheckedThrowingContinuation { cont in

  

            let query = HKStatisticsQuery(

  

                quantityType: Self.activeEnergy,

  

                quantitySamplePredicate: predicate,

  

                options: .cumulativeSum

  

            ) { \_, statistics, error in

  

                if let error {

  

                    cont.resume(throwing: HealthKitError.queryFailed(

  

                        error.localizedDescription

  

                    ))

  

                    return

  

                }

  

                let value = statistics?.sumQuantity()?.doubleValue(

  

                    for: .kilocalorie()

  

                ) ?? 0

  

                cont.resume(returning: value)

  

            }

  

            store.execute(query)

  

        }

  

        return Int(total)

  

    }

  

    public func recentWorkouts(days: Int) async throws -\> \[WorkoutSummary\] {

  

        let calendar = Calendar.current

  

        let start = calendar.date(byAdding: .day, value: -days, to: .now)\!

  

        let predicate = HKQuery.predicateForSamples(

  

            withStart: start, end: nil, options: .strictStartDate

  

        )

  

        let sort = NSSortDescriptor(

  

            key: HKSampleSortIdentifierStartDate, ascending: false

  

        )

  

        let workouts: \[HKWorkout\] = try await withCheckedThrowingContinuation { cont in

  

            let query = HKSampleQuery(

  

                sampleType: Self.workoutType,

  

                predicate: predicate,

  

                limit: HKObjectQueryNoLimit,

  

                sortDescriptors: \[sort\]

  

            ) { \_, samples, error in

  

                if let error {

  

                    cont.resume(throwing: HealthKitError.queryFailed(

  

                        error.localizedDescription

  

                    ))

  

                    return

  

                }

  

                cont.resume(returning: (samples as? \[HKWorkout\]) ?? \[\])

  

            }

  

            store.execute(query)

  

        }

  

        return workouts.map { workout in

  

            let calories = workout.statistics(for: Self.activeEnergy)?

  

                .sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0

  

            return WorkoutSummary(

  

                id: workout.uuid,

  

                activityName: workout.workoutActivityType.displayName,

  

                startDate: workout.startDate,

  

                durationSeconds: workout.duration,

  

                activeCalories: Int(calories)

  

            )

  

        }

  

    }

  

}

  

public enum HealthKitError: Error, Sendable, Equatable {

  

    case notAvailable

  

    case queryFailed(String)

  

}

  

private extension HKWorkoutActivityType {

  

    var displayName: String {

  

        switch self {

  

        case .running: return "Running"

  

        case .cycling: return "Cycling"

  

        case .walking: return "Walking"

  

        case .traditionalStrengthTraining: return "Strength"

  

        case .yoga: return "Yoga"

  

        default: return "Workout"

  

        }

  

    }

  

}

  

The pattern that runs through all three queries: **wrap the callback-based HealthKit API in** **withCheckedThrowingContinuation**. The continuation lets you bridge a callback world to async/await with a single seam.

  

A critical subtlety: cont.resume must be called **exactly once**. Calling it twice crashes. Forgetting to call it leaks the continuation forever. The pattern above calls it once on success and once on error, with mutually exclusive paths — that's the safe shape.

  

Add a stub for tests:

  

// Packages/HealthKitClient/Sources/HealthKitClient/StubHealthKitClient.swift

  

public struct StubHealthKitClient: HealthKitClient {

  

    public var steps: Int

  

    public var activeCalories: Int

  

    public var workouts: \[WorkoutSummary\]

  

    public var authorizationFails: Bool

  

    public init(

  

        steps: Int = 0,

  

        activeCalories: Int = 0,

  

        workouts: \[WorkoutSummary\] = \[\],

  

        authorizationFails: Bool = false

  

    ) {

  

        self.steps = steps

  

        self.activeCalories = activeCalories

  

        self.workouts = workouts

  

        self.authorizationFails = authorizationFails

  

    }

  

    public func requestAuthorization() async throws {

  

        if authorizationFails { throw HealthKitError.notAvailable }

  

    }

  

    public func todaySteps() async throws -\> Int { steps }

  

    public func todayActiveCalories() async throws -\> Int { activeCalories }

  

    public func recentWorkouts(days: Int) async throws -\> \[WorkoutSummary\] { workouts }

  

}

  

And register the dependency in Core, following the same pattern as nutritionRepository and apiClient.

  

## 12.4 The Info.plist Strings (Don't Skip)

HealthKit refuses to grant authorization without two Info.plist keys:

  

\<key\>NSHealthShareUsageDescription\</key\>

  

\<string\>FuelWell uses your activity and workout data to give you personalized nutrition and fitness recommendations.\</string\>

  

\<key\>NSHealthUpdateUsageDescription\</key\>

  

\<string\>FuelWell does not write to your Health data — this entry is required by Apple and reserved for future features.\</string\>

  

Add these to FuelWell/Info.plist (or in the project's Info tab if you don't have a separate file). The strings appear verbatim in the system permission prompt; write them like a thoughtful explanation, not legalese. App Review pays attention to these strings.

  

## 12.5 Parallel Fetching With TaskGroup

The Dashboard wants three independent things: today's nutrition totals, today's HealthKit metrics, and the recent workouts list. Done sequentially, they take time = sum of three. Done in parallel with TaskGroup, time = max of three.

  

Add a method to Dashboard's reducer that does this:

  

// Features/Dashboard/Sources/Dashboard/DashboardFeature.swift

  

import ComposableArchitecture

  

import Core

  

import Foundation

  

import HealthKitClient

  

@Reducer

  

public struct DashboardFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var userName: String = "Alex"

  

        public var calorieTarget: Int = 2000

  

        public var caloriesConsumed: Int = 0

  

        public var protein: Int = 0

  

        public var carbs: Int = 0

  

        public var fat: Int = 0

  

        public var steps: Int = 0

  

        public var activeCalories: Int = 0

  

        public var recentWorkouts: \[WorkoutSummary\] = \[\]

  

        public var isLoading: Bool = false

  

        public var loadError: String?

  

        public init() {}

  

    }

  

    public enum Action {

  

        case onAppear

  

        case dataLoaded(DashboardData)

  

        case loadFailed(String)

  

    }

  

    public struct DashboardData: Equatable, Sendable {

  

        public let entries: \[MealEntry\]

  

        public let steps: Int

  

        public let activeCalories: Int

  

        public let workouts: \[WorkoutSummary\]

  

    }

  

    @Dependency(\\.nutritionRepository) var nutritionRepo

  

    @Dependency(\\.healthKit) var healthKit

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .onAppear:

  

                state.isLoading = true

  

                state.loadError = nil

  

                return .run { \[nutritionRepo, healthKit\] send in

  

                    do {

  

                        let data = try await fetchDashboard(

  

                            nutritionRepo: nutritionRepo,

  

                            healthKit: healthKit

  

                        )

  

                        await send(.dataLoaded(data))

  

                    } catch {

  

                        await send(.loadFailed(error.localizedDescription))

  

                    }

  

                }

  

                .cancellable(id: CancelID.load, cancelInFlight: true)

  

            case let .dataLoaded(data):

  

                state.isLoading = false

  

                state.caloriesConsumed = data.entries.reduce(0) {

  

                    $0 + $1.calories

  

                }

  

                state.protein = Int(data.entries.reduce(0.0) {

  

                    $0 + $1.protein

  

                })

  

                state.carbs = Int(data.entries.reduce(0.0) {

  

                    $0 + $1.carbs

  

                })

  

                state.fat = Int(data.entries.reduce(0.0) {

  

                    $0 + $1.fat

  

                })

  

                state.steps = data.steps

  

                state.activeCalories = data.activeCalories

  

                state.recentWorkouts = data.workouts

  

                return .none

  

            case let .loadFailed(message):

  

                state.isLoading = false

  

                state.loadError = message

  

                return .none

  

            }

  

        }

  

    }

  

    private enum CancelID: Hashable { case load }

  

}

  

// Top-level so we can mark it \`nonisolated\` — it's pure orchestration.

  

private func fetchDashboard(

  

    nutritionRepo: any NutritionRepository,

  

    healthKit: any HealthKitClient

  

) async throws -\> DashboardFeature.DashboardData {

  

    try await withThrowingTaskGroup(of: PartialResult.self) { group in

  

        group.addTask {

  

            let entries = try await nutritionRepo.entries(for: .now)

  

            return .nutrition(entries)

  

        }

  

        group.addTask {

  

            let steps = try await healthKit.todaySteps()

  

            return .steps(steps)

  

        }

  

        group.addTask {

  

            let cals = try await healthKit.todayActiveCalories()

  

            return .activeCalories(cals)

  

        }

  

        group.addTask {

  

            let workouts = try await healthKit.recentWorkouts(days: 7)

  

            return .workouts(workouts)

  

        }

  

        var entries: \[MealEntry\] = \[\]

  

        var steps = 0

  

        var activeCalories = 0

  

        var workouts: \[WorkoutSummary\] = \[\]

  

        for try await result in group {

  

            switch result {

  

            case let .nutrition(e): entries = e

  

            case let .steps(s): steps = s

  

            case let .activeCalories(c): activeCalories = c

  

            case let .workouts(w): workouts = w

  

            }

  

        }

  

        return DashboardFeature.DashboardData(

  

            entries: entries,

  

            steps: steps,

  

            activeCalories: activeCalories,

  

            workouts: workouts

  

        )

  

    }

  

}

  

private enum PartialResult: Sendable {

  

    case nutrition(\[MealEntry\])

  

    case steps(Int)

  

    case activeCalories(Int)

  

    case workouts(\[WorkoutSummary\])

  

}

  

Three things make this work:

  

**withThrowingTaskGroup** spawns each child task in parallel. The first try await inside for try await result in group waits for whichever task finishes first; the loop continues until all are done.

  

**The** **PartialResult** **enum** is a typed channel for results. TaskGroup requires every child to return the same type, but our four queries return different types — wrapping them in a common enum solves this. After the loop, we destructure into typed variables.

  

**.cancellable(id: CancelID.load, cancelInFlight: true)** on the effect tells TCA: if .onAppear fires again while a previous load is still running, cancel the previous one and start fresh. This prevents stale results from clobbering newer ones.

  

## 12.6 Cancellation in Practice

Cancellation in Swift Concurrency is **cooperative**. When a parent task is cancelled, child tasks aren't killed — they're notified, and well-behaved code checks for cancellation and stops voluntarily.

  

URLSession.data(for:) and Task.sleep both honor cancellation automatically. Our HealthKit continuations don't — they'll keep running even after the surrounding task is cancelled. For most cases (HealthKit queries finish in milliseconds) this doesn't matter. For long-running operations, you'd add explicit cancellation:

  

public func recentWorkouts(days: Int) async throws -\> \[WorkoutSummary\] {

  

    try Task.checkCancellation()

  

    // ... start query ...

  

}

  

Task.checkCancellation() throws CancellationError if the surrounding task has been cancelled, immediately interrupting the function. Sprinkle it before expensive operations and at any reasonable suspension point.

  

In TCA, the .cancellable(id:) modifier handles cancellation of the entire effect when a new effect with the same ID arrives. Our Dashboard's cancelInFlight: true means: re-tapping the tab while a load is in flight cancels the in-flight load and starts a new one. That's the right behavior — the user expects fresh data, not whatever was queued from the last visit.

  

## 12.7 The Reentrancy Surprise

Here's the most subtle Swift Concurrency issue you will hit. Actors serialize methods, but they **don't** serialize *suspended* methods.

  

actor Cache {

  

    private var items: \[String: String\] = \[:\]

  

    func fetch(\_ key: String) async throws -\> String {

  

        if let cached = items\[key\] { return cached }

  

        let value = try await network.fetch(key)  // ← suspends here

  

        items\[key\] = value

  

        return value

  

    }

  

}

  

Two calls to fetch("foo") arriving simultaneously both pass the cache check (items\[key\] is nil), both await the network (in parallel — that's two requests, not one), and both write to items. Last write wins. The "race" isn't a data race in the classical sense — the actor protected the storage — but it's still wrong: we made two network calls when we wanted one.

  

The fix is to either (a) accept the duplicate request and let last-write-win be okay, or (b) coalesce in-flight requests with a separate dictionary of pending tasks:

  

actor Cache {

  

    private var items: \[String: String\] = \[:\]

  

    private var inFlight: \[String: Task\<String, Error\>\] = \[:\]

  

    func fetch(\_ key: String) async throws -\> String {

  

        if let cached = items\[key\] { return cached }

  

        if let pending = inFlight\[key\] { return try await pending.value }

  

        let task = Task\<String, Error\> {

  

            try await network.fetch(key)

  

        }

  

        inFlight\[key\] = task

  

        defer { inFlight\[key\] = nil }

  

        let value = try await task.value

  

        items\[key\] = value

  

        return value

  

    }

  

}

  

This pattern shows up enough that "actor reentrancy" is worth being a phrase you recognize. Whenever an actor method has an await between checking a condition and acting on it, ask: what happens if a second caller arrives during the await?

  

**⚠️ Common Pitfall — Trusting actors to serialize awaits**

  

Actors serialize *between* awaits, not *across* them. If correctness depends on "no other call can interleave," you need an explicit coordination mechanism (in-flight task dedup, lock, or task-local sequencing).

  

## 12.8 Sendable, Revisited

Sendable showed up in Chapter 2 as a compile-time conformance. By now you've felt where it bites: closures captured by .run { ... } effects must be @Sendable, dependencies must be Sendable, types crossing actor boundaries must be Sendable.

  

The rules that cover 95% of cases:

  

  - **Value types with** **Sendable** **properties** are automatically Sendable. MealEntry, WorkoutSummary — done.
  - **final class** **with only** **let** **properties** can be Sendable. Used for immutable config types.
  - **Actors are always** **Sendable****.** That's the whole point.
  - **Closures** are @Sendable if you annotate them — required for .run, Task, withTaskGroup.

  

The two patterns that confuse people:

  

1.  **Capturing** **self** **in a** **@Sendable** **closure.** If self is an actor or Sendable, you can. If it's a non-Sendable class, you can't — you have to capture a specific value out of it: \[name = self.name\].
2.  **Passing a non-Sendable type across an** **await****.** Even within the same actor, the compiler may flag this if the type isn't proven safe. The fix is usually to make the type a struct, mark a final class Sendable with let properties, or copy the data into a Sendable wrapper at the boundary.

  

When in doubt: prefer value types. They're Sendable for free.

  

## 12.9 Wiring It Into the Dashboard View

Update the Dashboard view to render the new data and trigger the parallel fetch:

  

// Features/Dashboard/Sources/Dashboard/DashboardView.swift

  

import ComposableArchitecture

  

import Core

  

import DesignSystem

  

import HealthKitClient

  

import SwiftUI

  

public struct DashboardView: View {

  

    let store: StoreOf\<DashboardFeature\>

  

    @Environment(\\.theme) private var theme

  

    public init(store: StoreOf\<DashboardFeature\>) { self.store = store }

  

    public var body: some View {

  

        NavigationStack {

  

            ScrollView {

  

                VStack(alignment: .leading, spacing: theme.spacing.xl) {

  

                    DailyGreeting(name: store.userName)

  

                    if store.isLoading && store.caloriesConsumed == 0 {

  

                        ProgressView().frame(maxWidth: .infinity)

  

                    }

  

                    HStack {

  

                        Spacer()

  

                        MacroRingView(

  

                            consumed: store.caloriesConsumed,

  

                            target: store.calorieTarget

  

                        )

  

                        Spacer()

  

                    }

  

                    SectionHeader(title: "Today")

  

                    LazyVGrid(

  

                        columns: \[.init(.flexible()), .init(.flexible())\],

  

                        spacing: theme.spacing.md

  

                    ) {

  

                        MetricTile(label: "Steps",

  

                                   value: "\\(store.steps)",

  

                                   icon: "figure.walk")

  

                        MetricTile(label: "Active kcal",

  

                                   value: "\\(store.activeCalories)",

  

                                   icon: "flame")

  

                        MetricTile(label: "Protein",

  

                                   value: "\\(store.protein)g",

  

                                   icon: "fork.knife")

  

                        MetricTile(label: "Carbs",

  

                                   value: "\\(store.carbs)g",

  

                                   icon: "leaf")

  

                    }

  

                    if \!store.recentWorkouts.isEmpty {

  

                        SectionHeader(title: "Recent Workouts")

  

                        ForEach(store.recentWorkouts) { workout in

  

                            workoutRow(workout)

  

                        }

  

                    }

  

                    if let error = store.loadError {

  

                        Text(error)

  

                            .font(theme.typography.caption)

  

                            .foregroundStyle(theme.colors.danger)

  

                    }

  

                }

  

                .padding(theme.spacing.lg)

  

            }

  

            .navigationTitle("Dashboard")

  

            .refreshable { store.send(.onAppear) }

  

        }

  

        .onAppear { store.send(.onAppear) }

  

    }

  

    @ViewBuilder

  

    private func workoutRow(\_ workout: WorkoutSummary) -\> some View {

  

        HStack {

  

            Image(systemName: "figure.run")

  

                .foregroundStyle(theme.colors.accent)

  

            VStack(alignment: .leading) {

  

                Text(workout.activityName).font(theme.typography.body)

  

                Text("\\(Int(workout.durationSeconds / 60)) min • \\(workout.activeCalories) kcal")

  

                    .font(theme.typography.caption)

  

                    .foregroundStyle(theme.colors.textSecondary)

  

            }

  

            Spacer()

  

        }

  

        .padding(theme.spacing.md)

  

        .background(theme.colors.surfaceSecondary,

  

                    in: .rect(cornerRadius: theme.radius.md))

  

    }

  

}

  

Run /run on a real device. The Dashboard fetches all four data sources concurrently. Pull-to-refresh re-runs the parallel load. Switch tabs and back — the cancelInFlight policy ensures no stale data lands.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Adding @MainActor to every file | Approachable Concurrency makes UI code main-actor by default |
| Calling cont.resume twice in a continuation | Single resume per path; mutually exclusive branches |
| Forgetting .cancellable(id:) on long effects | Stale data clobbers fresh data; always cancel in-flight |
| Actor reentrancy producing duplicate work | Coalesce in-flight tasks with a \\\[Key: Task\\\] dictionary |
| Sequential awaits where parallel would work | Use TaskGroup whenever calls are independent |
| Capturing non-Sendable self in .run effects | Capture specific values: \\\[value = self.field\\\] |
| Skipping HealthKit Info.plist strings | Authorization silently fails; read App Review will reject |
| Using class for shared state instead of actor | Compiler will refuse to make it Sendable; fix the design |

  

## Hands-On Exercise

**Goal:** add concurrent data fetching to a second feature and exercise cancellation.

  

1.  **Add a "weekly summary" panel to the Dashboard** that shows total steps and total active calories for the past 7 days. It needs two new HealthKit queries:

  

  - weekSteps() async throws -\> Int
  - weekActiveCalories() async throws -\> Int

  

Add them to HealthKitClient protocol, LiveHealthKitClient, and StubHealthKitClient. Wire them into fetchDashboard as additional task group children. Update DashboardFeature.State and the view to display them.

  

1.  **Verify cancellation works.** Add try Task.checkCancellation() in LiveHealthKitClient.todaySteps() between the predicate setup and the withCheckedThrowingContinuation. Then write a test:

  

  - Spawn a Task that calls healthKit.todaySteps().
  - Cancel the task.
  - Confirm the call throws CancellationError.

  

1.  **Diagnose a reentrancy bug deliberately.** Add a simple in-memory cache to LiveFoodDatabase (Chapter 10) that doesn't dedupe in-flight requests. Write a test that fires two simultaneous search(query: "oats", limit: 25) calls and counts how many actual queries reach Supabase. Then fix it with the in-flight-Task pattern from §12.7.

  

1.  **Stretch:** add a "stale state" indicator. If loadError \!= nil but the previous data is still in state, render the data with a small ⚠️ Last updated 2 minutes ago banner instead of replacing the screen with an error. This is the "graceful degradation" pattern that distinguishes production apps from prototypes.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 12: HealthKit actor, TaskGroup parallel fetch, cancellation"

  

git push

  

**Time budget:** 3 hours. The HealthKit setup on a real device (provisioning, capabilities, iCloud account, Apple Watch pairing for richer data) eats time the first time you do it. If you're working without a device, use StubHealthKitClient everywhere and skip the device-only steps; come back when you have hardware.

  

## What's Next

Chapter 13 — **Dependency Injection with swift-dependencies** — circles back to the dependency-registration pattern you've been using since Chapter 4, but now with the full picture: how to design new dependencies, how liveValue/testValue/previewValue interact with TCA and SwiftUI previews, and how to structure dependency graphs that Claude Code can extend without re-architecting. By the end you'll have a shared test helper that gives every test in FuelWell a clean, deterministic dependency setup in one line.

  
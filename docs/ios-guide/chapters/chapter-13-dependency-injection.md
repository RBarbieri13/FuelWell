# Chapter 13: Dependency Injection with swift-dependencies

*"Every singleton is a confession that you didn't know how to test the thing it points to."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Design new dependencies that fit cleanly into the swift-dependencies model.
2.  Choose correctly between liveValue, testValue, and previewValue for a given dependency.
3.  Override dependencies for a single test, a single preview, or an entire test suite.
4.  Build a shared test helper that gives every test in FuelWell a clean, deterministic setup.
5.  Use @Dependency(\\.continuousClock), @Dependency(\\.uuid), and @Dependency(\\.date) to make time- and randomness-dependent code testable.
6.  Diagnose the three most common DI failures: unimplemented liveValues, accidental real network in tests, and dependencies leaking between tests.

## Prerequisites

  - Chapters 1–12 complete.
  - You've registered at least four dependencies (nutritionRepository, apiClient, foodDatabase, healthKit) using the patterns from earlier chapters.
  - Tests run cleanly with /test.

  

## 13.1 Why Dependency Injection at All

Most code calls things directly. URLSession.shared.data(for:). HKHealthStore(). Date.now. These are convenient and they make the code look obvious. They also make it untestable — the test inherits the same global state the production code uses.

  

Dependency injection breaks that coupling. Instead of calling URLSession.shared directly, your reducer asks for an APIClient and uses whatever the runtime hands it. In production, that's a LiveAPIClient. In tests, it's a StubAPIClient. The reducer doesn't know or care.

  

The swift-dependencies library does three things that make this practical:

  

1.  **A typed registry** — every dependency has a key, a type, and three values (live, test, preview).
2.  **Lexical scoping** — overriding a dependency inside a withDependencies block applies only to code reached from that block, not globally.
3.  **TCA integration** — TestStore automatically applies test values; you override per-test only when you need something custom.

  

You've been using all three since Chapter 4. This chapter is the deeper take.

  

**Decision point** — the Reconciliation Matrix **Dependency injection** row commits us to swift-dependencies over Swinject, Factory, and manual init injection. The reasoning was zero-cost integration with TCA. By now you've felt that — every reducer naturally reaches for @Dependency, no extra wiring.

  

## 13.2 The Three Values

Every dependency exposes three flavors, and choosing each correctly is the whole skill:

  

flowchart LR

  

    Code\[Production code path\] --\> LV\[liveValue\<br/\>Real implementation\]

  

    Tests\[Test code path\] --\> TV\[testValue\<br/\>Loud failure or fixed stub\]

  

    Previews\[SwiftUI \#Preview\] --\> PV\[previewValue\<br/\>Realistic but instant\]

  

**liveValue** — what the actual app uses. Network, database, HealthKit. Fully real. Example: LiveAPIClient(baseURL: ...).

  

**testValue** — what XCTest and TestStore use unless explicitly overridden. The default should **fail loudly** if a test reaches a dependency it didn't think it would touch. Example: unimplemented("apiClient") from the IssueReporting module — the test crashes with a clear message naming the missing dependency.

  

**previewValue** — what SwiftUI \#Preview blocks use. Realistic enough that previews look good, instant enough that previews don't hang. Example: an in-memory repository pre-seeded with mock meals.

  

The mistake people make is using the same value for all three. previewValue: .live means previews hit your real network. testValue: liveValue means a forgotten dependency override silently makes a real API call from a unit test. The three values exist *because* the contexts are different.

  

## 13.3 Designing a New Dependency

The pattern, end to end. Suppose we need a new dependency: a Notifier that schedules local notifications for meal reminders. Walk through the design.

### Step 1 — Define the protocol

// Packages/Core/Sources/Core/Notifier/Notifier.swift

  

import Foundation

  

public protocol Notifier: Sendable {

  

    func requestPermission() async throws -\> Bool

  

    func scheduleMealReminder(at time: Date, message: String) async throws

  

    func cancelAllReminders() async

  

}

  

public enum NotifierError: Error, Sendable, Equatable {

  

    case permissionDenied

  

    case schedulingFailed(String)

  

}

  

The protocol describes *capabilities*, not implementation. A reducer calls notifier.scheduleMealReminder(...) without ever knowing whether the underlying implementation uses UNUserNotificationCenter, a third-party service, or a no-op stub.

### Step 2 — Build the live implementation

// Packages/Core/Sources/Core/Notifier/LiveNotifier.swift

  

import Foundation

  

import UserNotifications

  

public actor LiveNotifier: Notifier {

  

    private let center: UNUserNotificationCenter

  

    public init() {

  

        self.center = .current()

  

    }

  

    public func requestPermission() async throws -\> Bool {

  

        try await center.requestAuthorization(options: \[.alert, .sound, .badge\])

  

    }

  

    public func scheduleMealReminder(at time: Date, message: String) async throws {

  

        let content = UNMutableNotificationContent()

  

        content.title = "FuelWell"

  

        content.body = message

  

        content.sound = .default

  

        let triggerDate = Calendar.current.dateComponents(

  

            \[.hour, .minute\], from: time

  

        )

  

        let trigger = UNCalendarNotificationTrigger(

  

            dateMatching: triggerDate, repeats: true

  

        )

  

        let request = UNNotificationRequest(

  

            identifier: "meal-\\(UUID().uuidString)",

  

            content: content,

  

            trigger: trigger

  

        )

  

        do {

  

            try await center.add(request)

  

        } catch {

  

            throw NotifierError.schedulingFailed(error.localizedDescription)

  

        }

  

    }

  

    public func cancelAllReminders() async {

  

        await center.removeAllPendingNotificationRequests()

  

    }

  

}

  

An actor wrapping a thread-safe-ish system API, throwing a typed error, returning a Sendable-friendly result. The shape we've used three times now.

### Step 3 — Build the stub

// Packages/Core/Sources/Core/Notifier/StubNotifier.swift

  

public actor StubNotifier: Notifier {

  

    public var grantPermission: Bool

  

    public private(set) var scheduledReminders: \[(Date, String)\] = \[\]

  

    public init(grantPermission: Bool = true) {

  

        self.grantPermission = grantPermission

  

    }

  

    public func requestPermission() async throws -\> Bool {

  

        grantPermission

  

    }

  

    public func scheduleMealReminder(at time: Date, message: String) async throws {

  

        scheduledReminders.append((time, message))

  

    }

  

    public func cancelAllReminders() async {

  

        scheduledReminders.removeAll()

  

    }

  

}

  

The stub is interesting because it's **observable** — scheduledReminders is a public read-only property. Tests can assert: "after calling scheduleMealReminder, did the stub record the right time and message?" That's how you test side effects without observing the real OS.

### Step 4 — Register the dependency

// Packages/Core/Sources/Core/Dependencies/NotifierDependency.swift

  

import Dependencies

  

extension DependencyValues {

  

    public var notifier: any Notifier {

  

        get { self\[NotifierKey.self\] }

  

        set { self\[NotifierKey.self\] = newValue }

  

    }

  

}

  

private enum NotifierKey: DependencyKey {

  

    public static var liveValue: any Notifier {

  

        unimplemented(

  

            "Notifier",

  

            placeholder: StubNotifier()

  

        )

  

    }

  

    public static var testValue: any Notifier {

  

        unimplemented(

  

            "Notifier",

  

            placeholder: StubNotifier()

  

        )

  

    }

  

    public static var previewValue: any Notifier {

  

        StubNotifier(grantPermission: true)

  

    }

  

}

  

Notice the asymmetry:

  

  - **testValue** is unimplemented. Tests must explicitly provide one or the test fails with Unimplemented: Notifier. This is the default we want — tests should never accidentally talk to the real notification center.
  - **liveValue** is also unimplemented — because the *real* live value (LiveNotifier()) gets registered in FuelWellApp.init via prepareDependencies. Same pattern as nutritionRepository. If we ever forget to register the live value at startup, unimplemented fires loudly instead of silently doing nothing.
  - **previewValue** is a working stub — previews work without setup.

### Step 5 — Register the live value at app startup

// FuelWell/FuelWellApp.swift

  

@main

  

struct FuelWellApp: App {

  

    init() {

  

        prepareDependencies {

  

            $0.nutritionRepository = LiveNutritionRepository()

  

            $0.foodDatabase = LiveFoodDatabase(

  

                url: LocalConfig.supabaseURL,

  

                key: LocalConfig.supabaseAnonKey

  

            )

  

            $0.healthKit = LiveHealthKitClient()

  

            $0.notifier = LiveNotifier()

  

        }

  

    }

  

    // ...

  

}

  

prepareDependencies is the one place in the entire app where live implementations are wired. Adding a new dependency means: protocol → live → stub → key → register. Five steps, two minutes once you've done it once.

  

## 13.4 The Built-in Dependencies You'll Use

swift-dependencies ships several baked-in dependencies that solve recurring testability problems. Three matter for FuelWell:

  

**@Dependency(\\.continuousClock)** — for any code that uses Task.sleep(for:) or other delays. In production it's a real clock. In tests, you can substitute an ImmediateClock (no actual delay) or a TestClock (advances under test control).

  

**@Dependency(\\.uuid)** — for code that creates UUIDs. Production gives you UUID(). Tests can substitute a deterministic generator that returns UUID(0), UUID(1), UUID(2), ... so that test assertions are predictable.

  

**@Dependency(\\.date)** — for Date.now. Production returns the real current date. Tests substitute a fixed date so that "did this entry get logged at the right time?" tests don't depend on when they run.

  

Refactor AddMealFeature.buildEntry() from Chapter 9 to use these:

  

// Inside AddMealFeature

  

@Dependency(\\.uuid) var uuid

  

@Dependency(\\.date.now) var now

  

public func buildEntry() -\> MealEntry? {

  

    guard let calories, let protein, let carbs, let fat, isValid

  

    else { return nil }

  

    return MealEntry(

  

        id: uuid(),  // was UUID()

  

        name: name.trimmingCharacters(in: .whitespaces),

  

        calories: calories,

  

        protein: protein,

  

        carbs: carbs,

  

        fat: fat,

  

        loggedAt: now  // was .now

  

    )

  

}

  

Note: buildEntry() was a computed property reading from State. Switching to use @Dependency requires it to be a method on the *reducer*, not a computed property on State. Move it out of State, into the reducer, and call it from the .saveTapped case.

  

Tests can now assert exact values:

  

let store = TestStore(initialState: state) {

  

    AddMealFeature()

  

} withDependencies: {

  

    $0.uuid = .incrementing  // first call returns UUID(0), then UUID(1)...

  

    $0.date.now = Date(timeIntervalSince1970: 1\_700\_000\_000)

  

}

  

Determinism is the foundation of fast, reliable tests. If your tests use UUID() or Date() directly, they cannot be deterministic. The built-in dependencies are the fix.

  

**⚠️ Common Pitfall — Direct** **UUID()** **or** **Date.now** **in production code**

  

The first time you write a test that asserts on a UUID and it fails because the UUID changes every run, you'll feel this rule. Get ahead of it: every UUID and every Date in domain code goes through @Dependency.

  

## 13.5 Overriding Dependencies in Three Scopes

There are three scopes at which you override dependencies, and each has a different mechanism.

### Per-test override (TestStore)

let store = TestStore(initialState: SomeFeature.State()) {

  

    SomeFeature()

  

} withDependencies: {

  

    $0.notifier = StubNotifier(grantPermission: false)

  

}

  

Applies only to actions sent through this store. Most common form.

### Per-preview override

\#Preview {

  

    SomeView(

  

        store: Store(initialState: SomeFeature.State()) {

  

            SomeFeature()

  

        } withDependencies: {

  

            $0.foodDatabase = StubFoodDatabase(items: \[.mock\])

  

        }

  

    )

  

}

  

Same withDependencies: call, but on the preview's store. Useful when the default previewValue doesn't show off a particular state you want to render in the preview.

### Suite-wide override

For tests that all need the same setup, define a helper:

  

// Packages/Core/Tests/CoreTests/TestSupport/withFuelWellDeps.swift

  

import Dependencies

  

public func withFuelWellTestDependencies\<T\>(

  

    operation: () async throws -\> T

  

) async rethrows -\> T {

  

    try await withDependencies {

  

        $0.notifier = StubNotifier()

  

        $0.uuid = .incrementing

  

        $0.date.now = Date(timeIntervalSince1970: 1\_700\_000\_000)

  

        $0.continuousClock = ImmediateClock()

  

    } operation: {

  

        try await operation()

  

    }

  

}

  

Then in tests:

  

@Test

  

func someBehavior() async throws {

  

    try await withFuelWellTestDependencies {

  

        let store = TestStore(...) { ... }

  

        // ... store is initialized inside the block, so it inherits these.

  

    }

  

}

  

This is the helper Chapter 13's exercise has you build. It eliminates the per-test boilerplate of overriding common dependencies and ensures the whole test suite runs with a consistent baseline.

  

## 13.6 The "Real Network in Tests" Failure Mode

The single most expensive DI bug is one that doesn't crash. A test that quietly hits the real network, the real database, or the real HealthKit — passing locally because your machine has the right state, failing in CI because the runner doesn't.

  

Three defenses:

  

**Defense 1 —** **unimplemented** **testValues.** Already covered. If a test reaches an unregistered dependency, it fails immediately with the dependency name.

  

**Defense 2 — A CI environment variable.** In CI, set CI=true. In the live implementations of dangerous dependencies, refuse to operate when CI=true:

  

public init(baseURL: URL, ...) {

  

    if ProcessInfo.processInfo.environment\["CI"\] == "true" {

  

        fatalError("LiveAPIClient must not be constructed in CI")

  

    }

  

    // ...

  

}

  

This is harsh but appropriate. If a CI test is constructing a live API client, something is wrong with dependency setup, not with the code.

  

**Defense 3 — The integration-test ghetto.** Tests that genuinely need network or HealthKit go in a separate target named something like FuelWellIntegrationTests. The default swift test only runs unit tests. Integration tests are gated behind a CI flag and run on a slower cadence. This keeps the fast feedback loop fast.

  

For v0 of FuelWell, the first two defenses are enough.

  

## 13.7 Dependency Leaks Between Tests

Swift Testing runs tests in parallel by default. If a dependency holds shared state, two tests running concurrently can collide.

  

The classic example: StubAPIClient from Chapter 10 is an actor with a list of registered handlers. If two tests share an instance, they see each other's handlers. The fix is to construct a fresh stub per test, which you've been doing implicitly because each test creates its own store.

  

The hidden trap is when previewValue or testValue is a let liveValue: any Notifier = StubNotifier() — single shared instance across the whole test suite. Fix it with a computed var:

  

public static var testValue: any Notifier {

  

    StubNotifier()  // new instance every access

  

}

  

The difference between let and var { ... } is the difference between "one instance forever" and "a fresh instance every time the dependency is asked for." For test and preview values, always prefer the latter.

  

## 13.8 The Dependency Graph as Documentation

Once you have ten or twelve dependencies registered, the registration file becomes a useful piece of documentation. Glance at prepareDependencies { ... } in FuelWellApp and you can read off everything FuelWell needs to function:

  

prepareDependencies {

  

    $0.nutritionRepository = LiveNutritionRepository()

  

    $0.foodDatabase = LiveFoodDatabase(...)

  

    $0.healthKit = LiveHealthKitClient()

  

    $0.notifier = LiveNotifier()

  

    $0.apiClient = RetryingAPIClient(wrapped: LiveAPIClient(...))

  

    $0.analytics = LivePostHogAnalytics(...)  // Chapter 18

  

    $0.crashReporter = LiveSentryReporter(...)  // Chapter 18

  

    $0.featureFlags = LiveFeatureFlags(...)  // Chapter 18

  

}

  

That's the entire app's external surface. Every IO it does is registered here. Every dependency is mockable. Every one has a stub. Claude Code can read this single block and understand the system's boundaries.

  

This is one reason dependency injection is undervalued: the registry **doubles as architectural documentation**. The code matters; the discipline of having one place where it's all listed matters more.

  

## 13.9 What's Not a Dependency

Three things look like dependencies but aren't:

  

**Pure functions.** formatMacros(\_:) from Chapter 12 doesn't need DI — it has no IO, no clock, no randomness. Just call it. Adding it as a dependency adds noise without adding testability (it's already perfectly testable as a pure function).

  

**Value types that compute.** A MacroSummary struct that reduces an array of meals into totals isn't a dependency — it's a value. Construct it where you need it. Test it directly.

  

**Constants.** LocalConfig.supabaseURL from Chapter 10 isn't a dependency. It's a build-time configuration value. Treating it as a dependency means "the URL might change at runtime," which it can't.

  

The rule: if it has IO, randomness, or time-dependency, it's a dependency. Otherwise, it's just code.

  

## 13.10 Putting It All Together

A complete reducer using dependency injection in the FuelWell-mature style:

  

@Reducer

  

public struct OnboardingFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var permissionGranted: Bool?

  

        public var isRequesting: Bool = false

  

        public var error: String?

  

        public init() {}

  

    }

  

    public enum Action {

  

        case requestNotificationsTapped

  

        case permissionResponded(Result\<Bool, NotifierError\>)

  

        case scheduleDefaultRemindersTapped

  

        case schedulingResponded(Result\<Void, NotifierError\>)

  

    }

  

    @Dependency(\\.notifier) var notifier

  

    @Dependency(\\.continuousClock) var clock

  

    @Dependency(\\.date.now) var now

  

    @Dependency(\\.uuid) var uuid

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .requestNotificationsTapped:

  

                state.isRequesting = true

  

                return .run { \[notifier\] send in

  

                    do {

  

                        let granted = try await notifier.requestPermission()

  

                        await send(.permissionResponded(.success(granted)))

  

                    } catch let e as NotifierError {

  

                        await send(.permissionResponded(.failure(e)))

  

                    } catch {

  

                        await send(.permissionResponded(.failure(

  

                            .schedulingFailed(error.localizedDescription)

  

                        )))

  

                    }

  

                }

  

            case let .permissionResponded(.success(granted)):

  

                state.isRequesting = false

  

                state.permissionGranted = granted

  

                return .none

  

            case let .permissionResponded(.failure(error)):

  

                state.isRequesting = false

  

                state.error = String(describing: error)

  

                return .none

  

            case .scheduleDefaultRemindersTapped:

  

                let breakfast = startOfDay(adding: 8)   // 8 AM

  

                let lunch = startOfDay(adding: 12)      // noon

  

                let dinner = startOfDay(adding: 18)     // 6 PM

  

                return .run { \[notifier\] send in

  

                    do {

  

                        try await notifier.scheduleMealReminder(

  

                            at: breakfast, message: "Time for breakfast\!"

  

                        )

  

                        try await notifier.scheduleMealReminder(

  

                            at: lunch, message: "Lunch time."

  

                        )

  

                        try await notifier.scheduleMealReminder(

  

                            at: dinner, message: "Dinner reminder."

  

                        )

  

                        await send(.schedulingResponded(.success(())))

  

                    } catch let e as NotifierError {

  

                        await send(.schedulingResponded(.failure(e)))

  

                    } catch {

  

                        await send(.schedulingResponded(.failure(

  

                            .schedulingFailed(error.localizedDescription)

  

                        )))

  

                    }

  

                }

  

            case .schedulingResponded:

  

                return .none

  

            }

  

        }

  

    }

  

    private func startOfDay(adding hours: Int) -\> Date {

  

        let dayStart = Calendar.current.startOfDay(for: now)

  

        return Calendar.current.date(

  

            byAdding: .hour, value: hours, to: dayStart

  

        )\!

  

    }

  

}

  

Five dependencies declared at the top of the reducer. Every IO operation goes through one of them. Every clock-dependent computation uses now. Every UUID would come from uuid(). The reducer is fully deterministic given a set of dependency values — which means it's fully testable.

  

A test for this reducer:

  

@MainActor

  

struct OnboardingFeatureTests {

  

    @Test

  

    func requestPermission\_granted\_recordsResult() async {

  

        let store = TestStore(initialState: OnboardingFeature.State()) {

  

            OnboardingFeature()

  

        } withDependencies: {

  

            $0.notifier = StubNotifier(grantPermission: true)

  

        }

  

        await store.send(.requestNotificationsTapped) {

  

            $0.isRequesting = true

  

        }

  

        await store.receive(\\.permissionResponded.success, true) {

  

            $0.isRequesting = false

  

            $0.permissionGranted = true

  

        }

  

    }

  

    @Test

  

    func scheduleDefaults\_scheduleAtCorrectTimes() async throws {

  

        let stub = StubNotifier()

  

        let store = TestStore(initialState: OnboardingFeature.State()) {

  

            OnboardingFeature()

  

        } withDependencies: {

  

            $0.notifier = stub

  

            $0.date.now = Date(timeIntervalSince1970: 1\_700\_000\_000)

  

        }

  

        await store.send(.scheduleDefaultRemindersTapped)

  

        await store.receive(\\.schedulingResponded.success)

  

        let scheduled = await stub.scheduledReminders

  

        \#expect(scheduled.count == 3)

  

        \#expect(scheduled.contains { $0.1 == "Time for breakfast\!" })

  

    }

  

}

  

The stub's observable scheduledReminders lets us assert what would have been sent to iOS without ever talking to the real notification center.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Using UUID() or Date.now in domain code | @Dependency(\\\\.uuid) and @Dependency(\\\\.date) |
| testValue set to the live implementation | Set to unimplemented(...) so missing overrides fail loudly |
| previewValue that hits real network | Use a stub with realistic seed data |
| testValue declared as let staticInstance | Use static var { … } so each access gets a fresh instance |
| Forgetting to register liveValue at app launch | prepareDependencies must list every live implementation |
| Promoting pure functions to dependencies | If it has no IO, it's not a dependency |
| Per-test withDependencies boilerplate | Build a withFuelWellTestDependencies helper |
| Tests that depend on machine state to pass | Override the time, randomness, and IO; eliminate variance |

  

## Hands-On Exercise

**Goal:** finish wiring Notifier end-to-end, build the shared test helper, and refactor one existing reducer to use the built-in dependencies.

  

1.  **Add** **Notifier** **for real.** Create the protocol, live implementation, stub, and dependency key per §13.3. Register the live implementation in FuelWellApp.init. Build and verify nothing breaks.

  

1.  **Build the shared test helper.** Create Packages/Core/Tests/CoreTests/TestSupport/withFuelWellTestDependencies.swift with the fixture from §13.5. Refactor at least two existing tests to use it.

  

1.  **Refactor** **AddMealFeature.buildEntry()** to use @Dependency(\\.uuid) and @Dependency(\\.date.now). This requires:

  

  - Moving buildEntry() from a State computed property to a reducer method.
  - Updating the .saveTapped reducer case to call it.
  - Updating tests to set $0.uuid and $0.date.now so assertions can check the resulting MealEntry.id and loggedAt.

  

1.  **Add a deterministic Onboarding test.** Build the OnboardingFeature from §13.10 (state, actions, reducer). Write tests that:

  

  - Verify requestPermission granted updates state correctly.
  - Verify scheduleDefaultRemindersTapped schedules three reminders with specific times derived from a fixed date.now.

  

1.  **Stretch:** add a test that catches the "real network in tests" failure mode. Construct a TestStore *without* overriding apiClient and assert that any reducer action triggering a network call fails with the Unimplemented: APIClient message.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 13: full DI patterns, Notifier, test helper, deterministic time/UUID"

  

git push

  

**Time budget:** 2 hours. The Notifier itself is straightforward; the refactor of AddMealFeature to use injected UUID/Date is where you'll feel the value of the chapter — a previously-non-deterministic computation becomes fully assertable.

  

## What's Next

Chapter 14 — **Testing Strategy** — pulls together everything you've been doing piecemeal in tests across the last nine chapters and gives it shape: the test pyramid as it applies to FuelWell, when to use Swift Testing's parameterized tests, how to snapshot-test the Component Gallery without per-screen fragility, and where XCUITest's tiny budget should be spent. By the end you'll have a CI-ready test suite that catches the kinds of regressions that actually break apps — and skips the kinds that just make the suite slow.

  
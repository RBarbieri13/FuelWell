# Chapter 2: Swift 6 Essentials & Approachable Concurrency

*"The compiler is not your adversary. It is the first reviewer of every line of code you write, and it never gets tired."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Read and write Swift 6 code using structs, classes, protocols, generics, optionals, closures, and the property wrappers you'll meet throughout this book (@State, @Observable, @Dependency).
2.  Explain the difference between value types and reference types, and choose between them correctly.
3.  Use async/await to write asynchronous code that reads top-to-bottom.
4.  Apply @MainActor, actors, and Sendable to make code provably free of data races.
5.  Understand what "Approachable Concurrency" changes and why it's the right on-ramp.
6.  Resolve the three most common Sendable warnings without using @unchecked.

## Prerequisites

  - Chapter 1 complete.
  - Xcode 26.x open with a Swift Playground (File → New → Playground → iOS → Blank) for experimenting.

  

## 2.1 Swift in Fifteen Minutes

Swift is a statically-typed, compiled language. Every value has a known type at compile time. You'll spend 80% of your Swift life working with four kinds of things: **values** (structs, enums), **objects** (classes, actors), **protocols** (interfaces), and **closures** (functions you pass around).

### Values: structs and enums

A struct holds data by value. When you assign it, you get a copy.

  

struct Meal {

  

    let id: UUID

  

    var name: String

  

    var calories: Int

  

}

  

var breakfast = Meal(id: UUID(), name: "Oatmeal", calories: 300)

  

var copy = breakfast            // This is a copy, not a reference

  

copy.name = "Granola"

  

print(breakfast.name)           // Still "Oatmeal"

  

let means immutable; var means mutable. Use let by default.

  

An enum lists a fixed set of cases. Swift enums are powerful — each case can carry associated data:

  

enum LoadState {

  

    case idle

  

    case loading

  

    case loaded(\[Meal\])

  

    case failed(Error)

  

}

  

This single type captures every state a loading screen can be in. We'll use enums heavily as TCA Action types.

### Objects: classes and actors

A class holds data by reference. Assigning shares the same instance.

  

class MealStore {

  

    var meals: \[Meal\] = \[\]

  

}

  

let store1 = MealStore()

  

let store2 = store1             // Same instance

  

store2.meals.append(breakfast)

  

print(store1.meals.count)       // 1 — they share state

  

Classes are powerful but dangerous: two places writing to store1.meals at the same time from different threads is a data race. That's the problem Swift 6 concurrency solves — we'll get there in §2.3.

  

An actor is a class whose state can only be touched one task at a time. We'll use actors for anything thread-sensitive (database, HealthKit, caches).

  

actor MealCache {

  

    private var meals: \[Meal\] = \[\]

  

    func add(\_ meal: Meal) {

  

        meals.append(meal)        // Safe: only one caller at a time

  

    }

  

}

### Optionals: Swift's answer to null

Swift has no "null pointer." Instead, a value that might be missing is wrapped in Optional\<T\>, written T?:

  

var name: String = "Alex"         // Always has a value

  

var nickname: String? = nil       // Might be missing

  

// Safely unwrap with if-let

  

if let nickname {

  

    print("Hi, \\(nickname)\!")

  

} else {

  

    print("Hi, \\(name)\!")

  

}

  

// Or use nil-coalescing

  

print("Hi, \\(nickname ?? name)\!")

  

You'll see ? (optional) and \! (force-unwrap) throughout Swift code.

  

**⚠️ Common Pitfall — Force-unwrapping**

  

nickname\! crashes if nickname is nil. Never write \! unless you genuinely cannot continue if the value is missing (and even then, prefer guard let … else { fatalError() } with an explanatory message).

### Protocols: the "what" without the "how"

A protocol declares requirements. Types conform to protocols. This is how we build testable code in this book:

  

protocol NutritionRepository {

  

    func entries(for date: Date) async throws -\> \[MealEntry\]

  

    func save(\_ entry: MealEntry) async throws

  

}

  

struct LiveNutritionRepository: NutritionRepository {

  

    func entries(for date: Date) async throws -\> \[MealEntry\] {

  

        // Real SQLite query

  

        \[\]

  

    }

  

    func save(\_ entry: MealEntry) async throws {

  

        // Real save

  

    }

  

}

  

struct MockNutritionRepository: NutritionRepository {

  

    func entries(for date: Date) async throws -\> \[MealEntry\] {

  

        \[.mock\]                   // Instant, deterministic

  

    }

  

    func save(\_ entry: MealEntry) async throws { }

  

}

  

Anything that needs nutrition data asks for a NutritionRepository, not a specific implementation. Tests pass MockNutritionRepository. Production passes LiveNutritionRepository. This is how we get exhaustive testability in later chapters.

### Generics: code that works for any type

Array\<Element\> is a generic type — it works for Array\<Int\>, Array\<Meal\>, etc. You'll define your own occasionally:

  

struct Cached\<Value\> {

  

    let value: Value

  

    let timestamp: Date

  

}

  

let cachedMeals = Cached(value: \[breakfast\], timestamp: .now)

  

let cachedUser = Cached(value: "alex@example.com", timestamp: .now)

  

Swift infers the type from the argument (Cached\<\[Meal\]\>, Cached\<String\>). You rarely have to write the angle brackets yourself.

### Closures: functions as values

A closure is an anonymous function you can pass around.

  

let meals = \[breakfast, Meal(id: UUID(), name: "Salad", calories: 450)\]

  

let highCalorie = meals.filter { meal in

  

    meal.calories \> 400

  

}

  

// or equivalently, using the $0 shorthand:

  

let highCalorie2 = meals.filter { $0.calories \> 400 }

  

The { meal in … } is a closure — a little function defined inline. Closures are everywhere in SwiftUI (Button("Save") { save() }).

### Property wrappers: the @ annotations

You've already seen @Observable, @State, @Dependency, @Reducer. These are **property wrappers** — code that modifies how a property works. You don't need to write your own for a long time. You just need to recognize that when you write:

  

struct ContentView: View {

  

    @State private var count = 0

  

    var body: some View {

  

        Button("Tapped \\(count) times") { count += 1 }

  

    }

  

}

  

…the @State is doing work: it owns the storage for count, triggers a view rebuild when count changes, and keeps its value across view recreations. Property wrappers are the magic glue of SwiftUI and TCA.

  

## 2.2 Value vs Reference — a Decision You Make Often

Prefer struct unless you need reference semantics. That's the Swift convention and it's also what the compiler optimizes best.

  

Use class or actor when:

  

  - You need shared mutable state (rare in our architecture — we minimize this).
  - You're interfacing with an Apple framework that demands a class (HKHealthStore, URLSession).
  - You need object identity (two instances that are "the same" even with identical values).

  

Everything else — models, view state, TCA State, configuration — is a struct.

  

flowchart TD

  

    Start\[New type\] --\> Q1{Needs shared\<br/\>mutable state?}

  

    Q1 --\>|No| Struct\["Use struct\<br/\>(default)"\]

  

    Q1 --\>|Yes| Q2{Accessed from\<br/\>multiple tasks?}

  

    Q2 --\>|No| Class\["Use class\<br/\>(rare in our stack)"\]

  

    Q2 --\>|Yes| Actor\["Use actor\<br/\>(thread-safe)"\]

  

## 2.3 The Concurrency Problem

Here's a subtle bug, written in pre-concurrency Swift:

  

class Counter {

  

    var value = 0

  

    func increment() { value += 1 }

  

}

  

let counter = Counter()

  

DispatchQueue.global().async { counter.increment() }

  

DispatchQueue.global().async { counter.increment() }

  

// value is sometimes 1, sometimes 2. Classic data race.

  

Two threads read value, both see 0, both write 1. You "lost" an increment. In production, this manifests as inexplicable crashes, corrupt state, and bug reports you can never reproduce.

  

Swift 6's **strict concurrency** makes the compiler refuse to let this compile. But to do that, it needs to know which code runs where. That's where three concepts enter: async/await, @MainActor, and actors.

### async and await: writing async code top-to-bottom

An async function can suspend — pause, let other work happen, resume when a result is ready. You call it with await:

  

func fetchMeals(for date: Date) async throws -\> \[Meal\] {

  

    let url = URL(string: "https://api.fuelwell.app/meals")\!

  

    let (data, \_) = try await URLSession.shared.data(from: url)

  

    let meals = try JSONDecoder().decode(\[Meal\].self, from: data)

  

    return meals

  

}

  

// Call site:

  

Task {

  

    do {

  

        let meals = try await fetchMeals(for: .now)

  

        print("Got \\(meals.count) meals")

  

    } catch {

  

        print("Failed: \\(error)")

  

    }

  

}

  

Read that top-to-bottom. No callbacks. No completion handlers. No Combine publishers chained three levels deep. That's the point.

  

await is always explicit — if you see it, you know a suspension *might* happen there. Other tasks can run during the suspension. When the function resumes, it may do so on a different thread. That is where the data-race danger hides, and that is what Swift 6 checks.

### @MainActor: code that must run on the main thread

UI code must run on the main thread. In Swift 6, you express this by marking it @MainActor:

  

@MainActor

  

final class DashboardViewModel {

  

    var meals: \[Meal\] = \[\]

  

    func refresh() async throws {

  

        let fresh = try await fetchMeals(for: .now)

  

        meals = fresh             // Safe — we're on main

  

    }

  

}

  

The compiler enforces that every call to refresh() and every access to meals happens on the main thread. If you try to mutate meals from a background task, you get a compile error.

  

**The** **@MainActor** **default in Approachable Concurrency.** Xcode 26's default for new projects makes top-level code (SwiftUI views, your App struct, and most view-model code) implicitly @MainActor. You don't have to type it everywhere. You'll only write @MainActor when you want to be explicit about a class that isn't a view.

  

**Decision point** — the Reconciliation Matrix **Concurrency model** row commits us to Swift 6 + Approachable Concurrency + @MainActor-by-default. Do not override this setting.

### Actors: code that protects its own state

Actors serialize access. One task at a time, enforced by the compiler:

  

actor NutritionCache {

  

    private var cached: \[Date: \[Meal\]\] = \[:\]

  

    func meals(for date: Date) -\> \[Meal\]? {

  

        cached\[date\]

  

    }

  

    func store(\_ meals: \[Meal\], for date: Date) {

  

        cached\[date\] = meals

  

    }

  

}

  

// Call site — note the \`await\`:

  

let cache = NutritionCache()

  

Task {

  

    await cache.store(\[breakfast\], for: .now)

  

    let meals = await cache.meals(for: .now)

  

}

  

Every method on an actor is implicitly async from the outside. That await is the compiler telling you: *you're crossing an isolation boundary; I've made sure it's safe.*

  

Use actors for:

  

  - Database handles and connection pools (Chapter 11).
  - HealthKit wrappers (Chapter 12).
  - In-memory caches.
  - Network cookie jars, auth token holders.

  

Don't use actors for plain data (use a struct). Don't use actors for UI (use @MainActor).

### Sendable: values that can cross boundaries safely

When you hand a value from one isolation domain to another — main thread to background task, actor to actor — the compiler needs to know it's safe. Safe means: either immutable, or protected by its own synchronization.

  

// ✅ Sendable: all stored properties are value types and Sendable

  

struct Meal: Sendable {

  

    let id: UUID

  

    let name: String

  

    let calories: Int

  

}

  

// ✅ Sendable: enums with Sendable associated values

  

enum LoadState: Sendable {

  

    case idle

  

    case loaded(\[Meal\])

  

}

  

// ❌ Not Sendable: reference type with mutable state

  

class MealStore {

  

    var meals: \[Meal\] = \[\]

  

}

  

Most of the time, Swift figures Sendable out for you. You write struct Meal and it's automatically Sendable because all its fields are. You write class MealStore and it isn't, which means you can't send it across concurrency boundaries. That's usually correct — the fix is to make MealStore an actor, or to redesign so you only pass its immutable data around.

  

## 2.4 The Three Sendable Warnings You'll Actually Hit

Here are the patterns Claude Code (and you) will trip on, with the right fix for each.

### Pattern 1: "Capture of 'self' in a closure that outlives the actor"

@MainActor

  

final class DashboardViewModel {

  

    var meals: \[Meal\] = \[\]

  

    func refresh() {

  

        Task {

  

            let fresh = try await fetchMeals(for: .now)

  

            self.meals = fresh    // ⚠️ Warning in strict mode

  

        }

  

    }

  

}

  

The Task {} might run across isolation boundaries. **Fix:** make the closure explicit about its actor:

  

func refresh() {

  

    Task { @MainActor in

  

        let fresh = try await fetchMeals(for: .now)

  

        self.meals = fresh        // ✅ Compiler knows we're on main

  

    }

  

}

### Pattern 2: "Non-Sendable type used in an async function"

class Logger {                    // Not Sendable

  

    func log(\_ message: String) { print(message) }

  

}

  

func doWork(logger: Logger) async {

  

    // ⚠️ Passing Logger across an await boundary

  

    await someAsyncWork()

  

    logger.log("done")

  

}

  

**Fix:** make Logger a final class with immutable state and mark it Sendable, OR make it an actor, OR pass only the data you need across the boundary:

  

final class Logger: Sendable {    // All properties must be \`let\`

  

    let prefix: String

  

    init(prefix: String) { self.prefix = prefix }

  

    func log(\_ message: String) { print("\\(prefix): \\(message)") }

  

}

### Pattern 3: "Cannot mutate captured variable in concurrent context"

func downloadAll() async throws -\> \[Meal\] {

  

    var results: \[Meal\] = \[\]       // ⚠️ Shared mutable state

  

    await withTaskGroup(of: Meal.self) { group in

  

        for date in last7Days {

  

            group.addTask { try await fetchMeals(for: date).first\! }

  

        }

  

        for await meal in group {

  

            results.append(meal)

  

        }

  

    }

  

    return results

  

}

  

**Fix:** collect results via the task group's return channel, don't mutate an outer variable from inside concurrent tasks:

  

func downloadAll() async throws -\> \[Meal\] {

  

    try await withThrowingTaskGroup(of: Meal.self) { group in

  

        for date in last7Days {

  

            group.addTask { try await fetchMeals(for: date).first\! }

  

        }

  

        return try await group.reduce(into: \[\]) { $0.append($1) }

  

    }

  

}

  

## 2.5 Approachable Concurrency: What It Actually Changes

"Approachable Concurrency" is a set of Xcode 26 defaults that make strict Swift 6 less punishing for new projects. The three things it does:

  

1.  **@MainActor** **default for top-level code.** You don't annotate every view. Concurrency boundaries shrink.
2.  **Upgrades some errors to warnings.** Migrating code from Swift 5 isn't a hard stop; the compiler nudges.
3.  **Allows implicit** **nonisolated** **inference** in more places — the compiler figures out that a pure function doesn't need isolation.

  

The net effect: **you write Swift 6 that compiles.** You get Sendable and actor benefits without the 2024-era pain.

  

**Decision point** — we enable Approachable Concurrency (Xcode's default) **and** set strict concurrency to "Complete" as a *warning* initially, escalating to *error* before v1.0. The flag lives at Build Settings → Swift Compiler - Upcoming Features → Strict Concurrency Checking. Chapter 17 will wire this into CI.

  

## 2.6 Putting It Together: a Small Async Feature

Here's a complete file showing how the pieces fit. Type this into a playground and see it compile:

  

import Foundation

  

// MARK: - Model (value type, Sendable)

  

struct Meal: Sendable, Identifiable {

  

    let id: UUID

  

    let name: String

  

    let calories: Int

  

    static let mock = Meal(id: UUID(), name: "Oatmeal", calories: 300)

  

}

  

// MARK: - Protocol (abstraction for testing)

  

protocol MealService: Sendable {

  

    func fetch(for date: Date) async throws -\> \[Meal\]

  

}

  

// MARK: - Live implementation (hits network)

  

struct LiveMealService: MealService {

  

    func fetch(for date: Date) async throws -\> \[Meal\] {

  

        // Simulate a network call with Task.sleep

  

        try await Task.sleep(for: .milliseconds(200))

  

        return \[.mock, Meal(id: UUID(), name: "Salad", calories: 450)\]

  

    }

  

}

  

// MARK: - Mock implementation (for tests and previews)

  

struct MockMealService: MealService {

  

    let meals: \[Meal\]

  

    func fetch(for date: Date) async throws -\> \[Meal\] { meals }

  

}

  

// MARK: - UI-facing state holder (MainActor isolated)

  

@MainActor

  

@Observable

  

final class DashboardModel {

  

    private(set) var meals: \[Meal\] = \[\]

  

    private(set) var isLoading = false

  

    private let service: MealService

  

    init(service: MealService) { self.service = service }

  

    func load(for date: Date) async {

  

        isLoading = true

  

        defer { isLoading = false }

  

        do {

  

            meals = try await service.fetch(for: date)

  

        } catch {

  

            meals = \[\]

  

        }

  

    }

  

}

  

Every concept from this chapter appears there: value types, protocols, async/await, @MainActor, Sendable, property wrappers (@Observable, which we'll deepen in Chapter 9). This is the shape of code you'll be writing by Chapter 4.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Reaching for class by default | Start with struct; class only when you need reference semantics |
| Force-unwrapping optionals (value\\\!) | Use if let, guard let, or ?? — almost always |
| Writing @unchecked Sendable to silence warnings | Fix the underlying issue: let immutability, actor, or redesign |
| Spawning Task {} without @MainActor in UI code | Use Task { @MainActor in … } explicitly |
| Actor methods called without await | Actors serialize — all external calls are implicitly async |
| Using DispatchQueue.main.async alongside @MainActor | Pick one — @MainActor everywhere in new code |
| Class with var fields marked Sendable | Use let fields, or make it an actor, or don't mark Sendable |

  

## Hands-On Exercise

**Goal:** internalize Sendable, actors, and async/await by fixing deliberately-broken code.

  

1.  **Create a new Swift Playground** (File → New → Playground → iOS → Blank). Save it as Chapter2.playground.

  

1.  **Paste this broken code** into the playground:

  

import Foundation

  

// ❌ Three intentional problems below. Fix them.

  

class WorkoutLog {                                  // Problem 1

  

    var entries: \[String\] = \[\]

  

    func add(\_ entry: String) { entries.append(entry) }

  

}

  

func logWorkouts(names: \[String\]) async {

  

    let log = WorkoutLog()

  

    await withTaskGroup(of: Void.self) { group in

  

        for name in names {

  

            group.addTask {

  

                log.add(name)                        // Problem 2

  

            }

  

        }

  

    }

  

    print(log.entries)

  

}

  

struct User {

  

    let name: String

  

    var lastWorkout: Date?

  

}

  

func updateUser(\_ user: User) async {

  

    var copy = user

  

    Task {

  

        try? await Task.sleep(for: .milliseconds(100))

  

        copy.lastWorkout = .now                      // Problem 3

  

        print(copy)

  

    }

  

}

  

1.  **Turn on strict concurrency warnings** in the playground:

  

  - Editor → Playground Settings → Strict Concurrency Checking → Complete
  - (If your Xcode version hides this, ignore — the warnings will appear when you paste into a real project in Chapter 3.)

  

1.  **Fix each problem.** The goals:

  

  - Problem 1: WorkoutLog must be safely accessible from concurrent tasks.
  - Problem 2: the call inside addTask must not produce a Sendable warning.
  - Problem 3: updateUser should return the updated User to its caller instead of mutating a captured variable inside a Task.

  

1.  **Check your answers** against these fixes (don't peek until you've tried):

  

actor WorkoutLog {                                  // Fix 1: actor

  

    private(set) var entries: \[String\] = \[\]

  

    func add(\_ entry: String) { entries.append(entry) }

  

}

  

func logWorkouts(names: \[String\]) async {

  

    let log = WorkoutLog()

  

    await withTaskGroup(of: Void.self) { group in

  

        for name in names {

  

            group.addTask {

  

                await log.add(name)                  // Fix 2: await

  

            }

  

        }

  

    }

  

    print(await log.entries)                         // await here too

  

}

  

func updateUser(\_ user: User) async -\> User {       // Fix 3: return

  

    try? await Task.sleep(for: .milliseconds(100))

  

    var copy = user

  

    copy.lastWorkout = .now

  

    return copy

  

}

  

1.  **Stretch goal:** add a Sendable conformance to User (it should auto-synthesize because all fields are already Sendable; if it doesn't, find out why).

  

**Time budget:** 45–60 minutes. If you're completely stuck after 30 minutes on one problem, read that problem's fix, type it in, then try to re-explain in your own words why the original was wrong.

  

## What's Next

Chapter 3 — **Toolchain & Project Setup** — is where we bootstrap the actual FuelWell project. You'll install the MCP servers that wire Claude Code into Xcode, create the SPM package skeleton, author your first CLAUDE.md, and run a "hello build" loop end-to-end. By the end of Chapter 3 you'll have a repository that Claude Code can build, install, launch, and screenshot — no human in the loop for the compile cycle.

  

Bring a fresh terminal.

  
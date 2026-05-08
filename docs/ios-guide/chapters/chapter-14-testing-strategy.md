# Chapter 14: Testing Strategy

*"A test suite is a savings account. Every test you write is a deposit. Every test that misfires is an overdraft fee. Optimize for return on time, not test count."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Apply the FuelWell test pyramid: unit → reducer → snapshot → UI, with the right time budget at each level.
2.  Use Swift Testing's @Test, \#expect, parameterized tests, and traits to write expressive tests with low ceremony.
3.  Snapshot-test the Component Gallery as the primary visual regression surface.
4.  Write a small set of XCUITest golden-path tests that survive UI refactors.
5.  Decide what NOT to test — the categories that drag down the suite without catching real bugs.
6.  Wire test execution into a fast feedback loop locally, with the structure CI will pick up in Chapter 17.

## Prerequisites

  - Chapters 1–13 complete.
  - You've written tests using TestStore and pure-state assertions throughout earlier chapters.
  - swift-snapshot-testing is not yet added to your project — we add it in §14.5.

  

## 14.1 The FuelWell Pyramid

Every healthy test suite is shaped like a pyramid: many fast tests at the bottom, fewer slow tests at the top. For FuelWell, the layers are:

  

flowchart TD

  

    UI\["XCUITest\<br/\>\~5 tests\<br/\>\~30 seconds each"\]

  

    Snap\["Snapshot tests\<br/\>\~1 per gallery state\<br/\>\~50ms each"\]

  

    Reducer\["TCA TestStore tests\<br/\>\~3-10 per feature\<br/\>\~10-50ms each"\]

  

    Pure\["Pure unit tests\<br/\>\~unlimited\<br/\>\~1ms each"\]

  

    Pure --\> Reducer

  

    Reducer --\> Snap

  

    Snap --\> UI

  

    style Pure fill:\#cce5ff

  

    style Reducer fill:\#aaccff

  

    style Snap fill:\#88aaff

  

    style UI fill:\#ff8888

  

The shape matters. Inverted pyramids — many slow UI tests and few unit tests — are the most common failure pattern in iOS testing. The suite takes 20 minutes to run, breaks every UI refactor, and yet still misses real bugs because UI tests can't see into reducer logic.

  

The right shape:

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Layer\*\* | \*\*What it covers\*\* | \*\*Time budget per test\*\* | \*\*Total tests in v0\*\* |
| \*\*Pure unit\*\* | Pure functions, derived state, formatters, mappers | \\\~1ms | Hundreds, easily |
| \*\*Reducer (TestStore)\*\* | State transitions, effect orchestration, child-parent flows | 10–50ms | 30–80 by v1.0 |
| \*\*Snapshot\*\* | Component gallery rendering across themes and Dynamic Type | \\\~50ms | 10–30 by v1.0 |
| \*\*UI (XCUITest)\*\* | The 3–5 flows whose breakage is unacceptable | 30s+ | 3–5, no more |

  

The whole suite should run locally in **under 30 seconds**. If it ever exceeds 60 seconds, something is wrong and you fix it before adding new tests. A slow suite stops being run.

  

## 14.2 Swift Testing in Depth

You've been using @Test and \#expect since Chapter 4. The full toolbox is bigger than that.

### Parameterized tests

When you want to run the same test logic against multiple inputs:

  

import Testing

  

@testable import Nutrition

  

@Suite("Calorie validation")

  

struct CalorieValidationTests {

  

    @Test(arguments: \[

  

        ("",     "Calories required"),

  

        ("0",    "Calories must be between 1 and 5000"),

  

        ("5001", "Calories must be between 1 and 5000"),

  

        ("abc",  "Calories required"),  // Int(text) returns nil

  

    \])

  

    func invalidInputs\_produceExpectedError(input: String, expected: String) {

  

        var state = AddMealFeature.State()

  

        state.caloriesText = input

  

        \#expect(state.caloriesError == expected)

  

    }

  

    @Test(arguments: \["1", "100", "2000", "5000"\])

  

    func validInputs\_haveNoError(input: String) {

  

        var state = AddMealFeature.State()

  

        state.caloriesText = input

  

        \#expect(state.caloriesError == nil)

  

    }

  

}

  

One @Test runs four assertions. Failure messages tell you exactly which input failed — Swift Testing prints (input: "5001", expected: "...") on the failing case. Better than a single test with four \#expect lines, where the first failure hides the rest.

### Suites and traits

Group related tests with @Suite. Apply traits like .tags, .timeLimit, or .serialized for tests that need special handling:

  

@Suite("Live database integration", .tags(.integration))

  

struct LiveDatabaseTests {

  

    // These take longer than unit tests; tag them so we can run them

  

    // selectively in CI.

  

}

  

extension Tag {

  

    @Tag static var integration: Self

  

}

  

Then in CI you can run swift test --filter ".tags(integration)" for the slow suite or skip it for fast feedback.

### \#expect versus \#require

\#expect records a failure but lets the test continue. \#require throws if the condition fails, halting the test. Use \#require when later assertions depend on something earlier being true:

  

@Test

  

func loaded\_entries\_are\_sorted() async throws {

  

    let result = try await repository.entries(for: .now)

  

    try \#require(\!result.isEmpty)  // No point asserting order on empty array

  

    \#expect(result == result.sorted { $0.loggedAt \< $1.loggedAt })

  

}

  

Most of the time \#expect is what you want. Reach for \#require only when continuing would crash or produce noise.

  

## 14.3 The Anatomy of a Good Reducer Test

You've seen TestStore tests since Chapter 4. The shape that scales:

  

@MainActor

  

struct DailyLogFeatureTests {

  

    // 1. One test, one behavior. Name says what behavior.

  

    @Test

  

    func deleteSwipe\_removesEntry\_andCallsRepository() async {

  

        // 2. Build a stub that records what's done to it.

  

        let repo = RecordingRepository(seed: \[.mock\])

  

        // 3. Build the store with the stub injected.

  

        let store = TestStore(initialState: stateWithMock()) {

  

            DailyLogFeature()

  

        } withDependencies: {

  

            $0.nutritionRepository = repo

  

        }

  

        // 4. Send the action; assert exact state mutations.

  

        await store.send(.deleteSwiped(id: MealEntry.mock.id)) {

  

            $0.entries = \[\]

  

        }

  

        // 5. Assert side-effect observations on the stub.

  

        await Task.yield()  // give the effect a moment to run

  

        await \#expect(repo.deleteCallIDs.contains(MealEntry.mock.id))

  

    }

  

    private func stateWithMock() -\> DailyLogFeature.State {

  

        var s = DailyLogFeature.State()

  

        s.entries = \[.mock\]

  

        return s

  

    }

  

}

  

private actor RecordingRepository: NutritionRepository {

  

    private var entries: \[MealEntry\]

  

    private(set) var deleteCallIDs: \[MealEntry.ID\] = \[\]

  

    init(seed: \[MealEntry\]) { self.entries = seed }

  

    func entries(for date: Date) async throws -\> \[MealEntry\] { entries }

  

    func save(\_ entry: MealEntry) async throws { entries.append(entry) }

  

    func delete(id: MealEntry.ID) async throws {

  

        deleteCallIDs.append(id)

  

        entries.removeAll { $0.id == id }

  

    }

  

}

  

Five things to notice:

  

1.  **Test names describe behavior.** Read the test name — you should know what it proves before reading the body.
2.  **Custom stubs are fine.** When the in-memory implementation can't tell you "did this method get called?", build a small recording stub for that test. It's not a violation of DRY; it's clarity.
3.  **One behavior per test.** This test proves "deletion mutates state and calls the repo." A second test would prove "deletion failure rolls state back." Not the same test.
4.  **Exhaustive state assertions.** The closure on .send lists every state field that changes. TCA fails the test if anything else changes that you didn't list.
5.  **Side-effect observations are verified separately.** The state assertion proves what's in state. The deleteCallIDs assertion proves what was sent to the world. Both matter.

  

## 14.4 What Not to Test in a Reducer

A common over-test pattern: testing that the reducer correctly invokes a TCA primitive. For example:

  

// ❌ Don't write this test.

  

@Test

  

func onAppear\_returnsCancellableEffect() async {

  

    // This is testing TCA, not your code.

  

}

  

TCA has its own test suite that verifies .cancellable(id:) works. Trust it. Test your business logic — what state changes, what effects you orchestrate, what data you transform — not the framework.

  

Similarly, don't test:

  

  - That @Bindable works (Apple tests this).
  - That @Dependency looks up the right value (swift-dependencies tests this).
  - That Codable decodes basic types correctly (Foundation tests this).
  - That SwiftUI re-renders when state changes (the framework tests this).

  

You're testing your code, not your dependencies. If a test would still pass after you replaced your reducer with a TCA tutorial example, the test isn't valuable.

  

## 14.5 Snapshot Testing the Component Gallery

For visual regressions, snapshot testing renders a view to an image and compares against a saved baseline. Differences fail the test. The Reconciliation Matrix's testing row commits us to **pointfreeco/swift-snapshot-testing** — actively maintained, integrates with Swift Testing, and the de facto standard.

  

Add it to the Persistence package's tests... actually, snapshot tests want to live close to the views they test. Let's add it to the DesignSystem package since the Component Gallery lives there.

  

Edit Packages/DesignSystem/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "DesignSystem",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "DesignSystem", targets: \["DesignSystem"\]),

  

    \],

  

    dependencies: \[

  

        .package(path: "../Core"),

  

        .package(

  

            url: "https://github.com/pointfreeco/swift-snapshot-testing",

  

            from: "1.18.0"

  

        ),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "DesignSystem",

  

            dependencies: \[

  

                .product(name: "Core", package: "Core"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "DesignSystemTests",

  

            dependencies: \[

  

                "DesignSystem",

  

                .product(name: "SnapshotTesting", package: "swift-snapshot-testing"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

Now write the gallery snapshot tests:

  

// Packages/DesignSystem/Tests/DesignSystemTests/ComponentGallerySnapshotTests.swift

  

import SnapshotTesting

  

import SwiftUI

  

import Testing

  

@testable import DesignSystem

  

@MainActor

  

@Suite("Component Gallery snapshots")

  

struct ComponentGallerySnapshotTests {

  

    @Test

  

    func gallery\_lightTheme() {

  

        let view = ComponentGallery()

  

            .theme(.light)

  

            .frame(width: 390, height: 1400)  // iPhone 17 width

  

        assertSnapshot(of: view, as: .image)

  

    }

  

    @Test

  

    func gallery\_darkTheme() {

  

        let view = ComponentGallery()

  

            .theme(.dark)

  

            .preferredColorScheme(.dark)

  

            .frame(width: 390, height: 1400)

  

        assertSnapshot(of: view, as: .image)

  

    }

  

    @Test

  

    func gallery\_xxlDynamicType() {

  

        let view = ComponentGallery()

  

            .theme(.light)

  

            .environment(\\.dynamicTypeSize, .accessibility3)

  

            .frame(width: 390, height: 1800)

  

        assertSnapshot(of: view, as: .image)

  

    }

  

}

  

Run /test once. The first run produces no comparison — the snapshot baselines are written to disk in \_\_Snapshots\_\_ next to the test file. Commit those baselines.

  

From now on, any change that affects the rendering of any component in the gallery fails the test. The diff is rendered as a side-by-side image so you can see exactly what changed.

### The "snapshot the gallery, not screens" decision

A common mistake is to snapshot every screen of the app. This is brittle and slow. Every time a screen layout changes for a legitimate reason — adding a new button, repositioning a label — the test fails. You spend five minutes deciding "is this expected or a regression?" for every screen, every PR.

  

Instead, snapshot the **Component Gallery** — a single view that renders every component in every interesting state. When you change MacroRingView's appearance, every preview that includes it (one in the gallery) fails. When you add a new screen using existing components, no snapshot test fails because no component changed. The test surface is small and the failures are focused.

  

If a screen's *layout* matters enough to test (the Dashboard's specific arrangement, say), snapshot the Dashboard separately. But default to gallery snapshots, not screen snapshots.

  

**⚠️ Common Pitfall — Snapshots that depend on the simulator**

  

Snapshots taken on iPhone 15 will fail on iPhone 17 because the rendering differs subtly. Pin the simulator your snapshots were generated on, or use .image(layout: .device(.iPhone15Pro)) to make the comparison size-explicit. CI must use the same setup or every PR will see false-positive failures.

### Updating snapshots

When a change is intentional, regenerate baselines:

  

assertSnapshot(of: view, as: .image, record: true)

  

Run once with record: true, the new snapshot writes to disk, then remove record: true and commit the new baselines.

  

## 14.6 The XCUITest Budget

XCUITest is slow, flaky, and doesn't see inside your reducers. It's also the only way to test that the *whole app* — install, launch, navigate, tap, see the right thing — actually works.

  

Spend its budget carefully. For FuelWell v0, the budget is **three to five tests**, each covering a flow whose failure would mean the app is genuinely broken:

  

1.  **Cold launch shows the Dashboard.** If this fails, the app doesn't start.
2.  **Add a meal end-to-end.** Tap +, fill out the form, save, see the meal in the list.
3.  **Edit a meal.** Tap meal, tap Edit, change a field, save, see updated meal.
4.  **Delete a meal.** Swipe-to-delete, confirm row is gone.
5.  **Deep-link opens the right screen.** Use XCUIDevice.shared.system.open to fire fuelwell://meal/\<id\>, assert the right view appears.

  

That's it. Don't test "form validation prevents save with empty name" — that's a unit test on AddMealFeature.State.isValid. Don't test "the loading indicator appears" — that's a reducer test on state.isLoading.

  

A skeleton XCUITest for the add-meal flow:

  

// FuelWellUITests/AddMealUITests.swift

  

import XCTest

  

final class AddMealUITests: XCTestCase {

  

    func testAddMealEndToEnd() throws {

  

        let app = XCUIApplication()

  

        app.launchArguments.append("--ui-test-mode")

  

        app.launch()

  

        // Navigate to the Nutrition tab.

  

        app.tabBars.buttons\["Nutrition"\].tap()

  

        // Tap the + button.

  

        app.navigationBars\["Today"\].buttons\["Add Meal"\].tap()

  

        // Fill out the form.

  

        let nameField = app.textFields\["Name"\]

  

        nameField.tap()

  

        nameField.typeText("Test Oatmeal")

  

        let calsField = app.textFields\["Calories"\]

  

        calsField.tap()

  

        calsField.typeText("310")

  

        // Tap Save.

  

        app.navigationBars\["Add Meal"\].buttons\["Save"\].tap()

  

        // Assert the row appears in the list.

  

        XCTAssertTrue(

  

            app.staticTexts\["Test Oatmeal"\].waitForExistence(timeout: 3)

  

        )

  

    }

  

}

  

The --ui-test-mode launch argument lets your app's init method recognize "I'm being driven by UI tests, use a fresh in-memory database" — so tests don't pollute or depend on the user's real data.

  

// In FuelWellApp.init

  

if ProcessInfo.processInfo.arguments.contains("--ui-test-mode") {

  

    prepareDependencies {

  

        $0.nutritionRepository = InMemoryNutritionRepository(seed: \[\])

  

        // ... other test-mode overrides

  

    }

  

} else {

  

    // ... live setup

  

}

  

UI tests pass against the in-memory repo, run fast, and don't require Supabase or HealthKit to be set up.

  

## 14.7 Local Test Workflow

Goal: edit code, get test feedback in under five seconds. The workflow:

  

1.  **Use Claude Code's** **/test** **command.** XcodeBuildMCP runs xcodebuild test with the right destination and pipes results back.
2.  **Write the test before the code** for non-trivial logic. Watch it fail. Make it pass.
3.  **Filter to one test while iterating.** swift test --filter SomeFeatureTests/specificTest runs just one.
4.  **Run the full suite before committing.** /test with no filter.
5.  **Snapshot-failure triage.** When a snapshot test fails, /run the app to see the change in context. Decide: regression or intentional. Update or revert.

  

Don't let CI be the first time you run the full suite. The point of local tests is the loop is fast enough that you run them constantly.

  

## 14.8 Coverage Goals (and Why They're Mostly Wrong)

It's tempting to set a coverage threshold ("90% line coverage required") and let CI enforce it. Don't. Three reasons:

  

1.  **Coverage measures lines, not behaviors.** A test that calls a function once with one input gets full coverage and proves nothing.
2.  **Coverage encourages bad tests.** Developers add weak tests just to clear the threshold. The suite grows; quality drops.
3.  **Coverage misses what isn't there.** Code that doesn't exist yet but should — error handling for an edge case you didn't think of — won't show up as "uncovered" because it's not there at all.

  

Better targets:

  

  - **Every reducer action has at least one test.** Easy to enforce; meaningful to read.
  - **Every public API on a repository or client protocol has at least one test.** Same.
  - **Every snapshot in the gallery has a test.** Same.

  

These are floors, not ceilings. Once they're met, write the next test only when the next test would catch a real bug. Don't write tests to grow a number.

  

## 14.9 The Categories You Skip

To be explicit about what FuelWell v0 doesn't test:

  

|  |  |
| :-: | :-: |
| \*\*Skip\*\* | \*\*Why\*\* |
| Pure SwiftUI views (without snapshots) | Rendering is what snapshots cover; logic is in reducers |
| \\\#Preview blocks | Previews are dev tools, not behavior contracts |
| TCA framework primitives (Reduce, Effect, Scope) | Tested by Point-Free; trust |
| Apple framework APIs (Codable, URLSession) | Tested by Apple; trust |
| Random-data generators that drive other tests | Adds variance for no benefit |
| Wallpaper assertions like XCTAssertNotNil(self) | These are noise |
| Performance until a concrete budget exists | Premature; covered in Chapter 16 |

  

Skipping these isn't laziness. It's discipline. Every test that doesn't catch a real bug is paying for itself in maintenance forever.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Per-screen snapshot tests | Snapshot the gallery; component changes propagate |
| Ten XCUITests covering form validation | Validation goes in reducer/state tests; UI tests cover end-to-end paths only |
| Coverage threshold as a quality proxy | Replace with "every action and every public method has a test" |
| Tests that depend on the wall clock | @Dependency(\\\\.date) from Chapter 13 |
| Test names that describe what, not why | "deleteSwipe\\\_removesEntry\\\_andCallsRepository" beats "testDelete" |
| Shared mutable state between tests | New stub instances per test; var { … } for testValue providers |
| Snapshot baselines committed without inspection | Always look at the diff before committing a regenerated baseline |
| Local "it works" without running tests | /test should be in your muscle memory before every commit |

  

## Hands-On Exercise

**Goal:** add the snapshot suite, ensure every reducer in FuelWell so far has at least one TestStore test, and write the three core XCUITests.

  

1.  **Wire up swift-snapshot-testing.** Update DesignSystem/Package.swift per §14.5. Write the three gallery snapshot tests (light, dark, XXL Dynamic Type). Run /test to generate baselines, inspect them by opening the \_\_Snapshots\_\_ folder, commit them.

  

1.  **Audit existing reducer coverage.** For each feature reducer (DailyLogFeature, AddMealFeature, EditMealFeature, MealDetailFeature, FoodSearchFeature, OnboardingFeature, DashboardFeature), confirm at least one TestStore test exists for each Action case. Add the missing ones. The pattern from §14.3 is your template.

  

1.  **Write three XCUITests** covering:

  

  - Cold launch shows Dashboard with greeting.
  - Add meal end-to-end.
  - Delete meal via swipe.

  

Add the --ui-test-mode launch argument plumbing per §14.6. Test on a simulator, not a real device.

  

1.  **Add one parameterized test** for AddMealFeature.State.caloriesError. Cover at least four invalid inputs and three valid ones with expected outcomes.

  

1.  **Time the suite.** Run time /test (or just observe Claude Code's output). Note total wall-clock seconds. Goal: under 30. If you're over, find the slow tests with Xcode's test report and decide whether they earn their cost.

  

1.  **Stretch:** add the .tags(.integration) pattern from §14.2. Tag the live LiveNutritionRepositoryTests from Chapter 11 as integration tests. Confirm the default swift test skips them.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 14: snapshot suite, reducer coverage, core XCUITests"

  

git push

  

**Time budget:** 3 hours. Most of it goes to the XCUITest plumbing the first time — the launch argument, the test-mode dependency switch, the XCUIElement queries. After that, adding new XCUITests is mechanical.

  

## What's Next

Chapter 15 — **Accessibility** — takes the components and screens you've built and ensures they work for the 30% of users who rely on assistive technology to varying degrees. You'll audit FuelWell with VoiceOver, fix the labels and traits that don't communicate, layout-adapt for Dynamic Type at the largest accessibility sizes, and use Xcode's Accessibility Inspector to find the issues you can't see by eye. By the end, the Dashboard and Nutrition flows pass an accessibility review and the patterns extend to every future feature.

  
# Chapter 6: Navigation — NavigationStack + TCACoordinators

*"If you can't serialize your navigation, you don't have navigation — you have a pile of animations."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Explain why "navigation as data" beats imperative NavigationLink pushing once an app has more than one flow.
2.  Use NavigationStack and NavigationPath with TCA's StackState and StackAction to model routes as enum values.
3.  Build a three-tab AppFeature reducer that hosts Dashboard, Nutrition, and Workouts.
4.  Handle sheet and full-screen-cover presentations declaratively.
5.  Parse a URL into a route and restore a full navigation stack from cold start.
6.  Diagnose the three most common TCA navigation bugs.

## Prerequisites

  - Chapters 1–5 complete.
  - DailyLogFeature builds and passes its tests.
  - Core, Nutrition, and (still-skeleton) Dashboard and Workouts feature packages wired into Xcode.

  

## 6.1 Why Navigation Is Hard

Navigation looks trivial in tutorials. "Here's a NavigationLink, tap it, a new view pushes." But every real app hits the same wall around its third flow:

  

  - A deep link arrives while the app is backgrounded on a different tab. You need to switch tabs *and* push two views.
  - A push-notification tap needs to open a detail screen that doesn't exist yet in the stack.
  - State restoration from the last session should land the user exactly where they left off.
  - A sheet presented from inside a sheet needs to dismiss both in the right order.

  

NavigationLink(destination: …) can't handle any of these cleanly. It entangles navigation with view rendering — the push happens because a view exists, and the view exists because the push happened. Circular. Untestable. Impossible to restore.

  

The alternative — **navigation as data** — inverts this. Navigation state is just a value. A tab index. An array of route enum cases. A presented-sheet variant. Views render that value; they don't drive it. Actions mutate it; effects can inspect it; tests can assert on it.

  

flowchart LR

  

    subgraph Bad\["Imperative (don't)"\]

  

        NL\[NavigationLink\] -.pushes.-\> V1\[View 1\]

  

        V1 -.contains.-\> NL2\[NavigationLink\] -.pushes.-\> V2\[View 2\]

  

    end

  

    subgraph Good\["Navigation as data (do)"\]

  

        State\["path: \[.detail(id1), .edit(id2)\]"\] --\>|renders| Stack\[NavigationStack\]

  

        Stack -.pushes automatically.-\> V1b\[View 1\]

  

        Stack -.pushes automatically.-\> V2b\[View 2\]

  

        Action\["send(.push(.detail(id3)))"\] --\>|appends to path| State

  

    end

  

Once navigation is data, everything works: deep links become "parse URL → set path array." State restoration becomes "persist path array → restore on launch." Tests become "send action, assert path."

  

**Decision point** — the Reconciliation Matrix **Navigation** row commits us to NavigationStack + TCACoordinators. Imperative NavigationLink(destination:) is explicitly rejected for flow-level navigation.

  

## 6.2 The Three Pieces of TCA Navigation

TCA ships three navigation primitives you'll use constantly:

  

1.  **StackState\<Element\>** **+** **StackAction\<State, Action\>** — models a NavigationStack's push/pop as an array of child feature states. This is "TCACoordinators" in the ecosystem; it's built into TCA 1.x.

  

1.  **@Presents** **property wrapper** — models an optional sheet or full-screen cover. When the optional is non-nil, the sheet is presented.

  

1.  **.ifLet** **and** **.forEach** **reducer operators** — hook the parent reducer to child reducers for presented/stacked states.

  

Understanding those three unlocks every navigation pattern.

  

## 6.3 Modeling Routes as Enums

Define the shape of every screen that can be pushed onto a NavigationStack as an enum. For FuelWell's Nutrition tab, the stack might hold a meal detail, an edit form, or a food search screen. Create Features/Nutrition/Sources/Nutrition/NutritionRoute.swift:

  

import Core

  

import ComposableArchitecture

  

import Foundation

  

@Reducer

  

public struct NutritionRoute {

  

    @ObservableState

  

    public enum State: Equatable {

  

        case mealDetail(MealDetailFeature.State)

  

        case editMeal(EditMealFeature.State)

  

    }

  

    public enum Action {

  

        case mealDetail(MealDetailFeature.Action)

  

        case editMeal(EditMealFeature.Action)

  

    }

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Scope(state: \\.mealDetail, action: \\.mealDetail) {

  

            MealDetailFeature()

  

        }

  

        Scope(state: \\.editMeal, action: \\.editMeal) {

  

            EditMealFeature()

  

        }

  

    }

  

}

  

A few things to notice:

  

  - **@Reducer** **on an enum.** This is a TCA macro feature: enum-based reducers automatically generate the routing boilerplate. Each case is a child feature.
  - **@ObservableState** on the State enum lets SwiftUI observe which case is currently active.
  - **Scope** wires each enum case to its child reducer. The key path \\.mealDetail uses the CasePath machinery that @Reducer generates.

  

You'll need minimal implementations of MealDetailFeature and EditMealFeature for this to compile. Create them as small stubs — we'll flesh them out in exercises:

  

// Features/Nutrition/Sources/Nutrition/MealDetailFeature.swift

  

import Core

  

import ComposableArchitecture

  

@Reducer

  

public struct MealDetailFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public let entry: MealEntry

  

        public init(entry: MealEntry) { self.entry = entry }

  

    }

  

    public enum Action {

  

        case editTapped

  

    }

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .editTapped:

  

                return .none  // Parent will handle navigation.

  

            }

  

        }

  

    }

  

}

  

// Features/Nutrition/Sources/Nutrition/EditMealFeature.swift

  

import Core

  

import ComposableArchitecture

  

@Reducer

  

public struct EditMealFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var entry: MealEntry

  

        public init(entry: MealEntry) { self.entry = entry }

  

    }

  

    public enum Action: BindableAction {

  

        case binding(BindingAction\<State\>)

  

        case saveTapped

  

    }

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        BindingReducer()

  

        Reduce { state, action in

  

            switch action {

  

            case .binding, .saveTapped:

  

                return .none

  

            }

  

        }

  

    }

  

}

  

BindingReducer and BindableAction are TCA's glue for two-way bindings in SwiftUI forms. We'll use them properly in the exercise.

  

## 6.4 Adding a Stack to DailyLogFeature

Now upgrade DailyLogFeature to own a navigation stack. When a user taps a meal row, we push a MealDetailFeature onto the stack. Tapping "Edit" in the detail pushes an EditMealFeature.

  

Edit Features/Nutrition/Sources/Nutrition/DailyLogFeature.swift:

  

import Core

  

import Foundation

  

@Reducer

  

public struct DailyLogFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var entries: \[MealEntry\] = \[\]

  

        public var selectedDate: Date = .now

  

        public var isLoading: Bool = false

  

        public var errorMessage: String?

  

        public var path = StackState\<NutritionRoute.State\>()    // NEW

  

        public init() {}

  

    }

  

    public enum Action {

  

        case onAppear

  

        case refreshRequested

  

        case deleteSwiped(id: MealEntry.ID)

  

        case entryTapped(MealEntry)                              // NEW

  

        case entriesLoaded(\[MealEntry\])

  

        case loadFailed(String)

  

        case entryDeleted(id: MealEntry.ID)

  

        case path(StackActionOf\<NutritionRoute\>)                 // NEW

  

    }

  

    @Dependency(\\.nutritionRepository) var repository

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .onAppear, .refreshRequested:

  

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

  

            case let .entriesLoaded(entries):

  

                state.isLoading = false

  

                state.entries = entries

  

                return .none

  

            case let .loadFailed(message):

  

                state.isLoading = false

  

                state.errorMessage = message

  

                return .none

  

            case let .deleteSwiped(id):

  

                state.entries.removeAll { $0.id == id }

  

                return .run { \[repository\] \_ in

  

                    try await repository.delete(id: id)

  

                }

  

            case .entryDeleted:

  

                return .none

  

            case let .entryTapped(entry):

  

                // Push the detail screen onto the nav stack.

  

                state.path.append(.mealDetail(MealDetailFeature.State(entry: entry)))

  

                return .none

  

            // Listen for child-initiated navigation requests.

  

            case let .path(.element(id: id, action: .mealDetail(.editTapped))):

  

                // When the user taps "Edit" inside a detail screen, push edit.

  

                guard case let .mealDetail(detailState) = state.path\[id: id\]

  

                else { return .none }

  

                state.path.append(.editMeal(EditMealFeature.State(entry: detailState.entry)))

  

                return .none

  

            case .path:

  

                return .none

  

            }

  

        }

  

        .forEach(\\.path, action: \\.path) {

  

            NutritionRoute()

  

        }

  

    }

  

}

  

The critical additions:

  

  - **var path = StackState\<NutritionRoute.State\>()** — the navigation state, an array of enum cases.
  - **case path(StackActionOf\<NutritionRoute\>)** — the action that pushes/pops the stack and forwards child actions.
  - **.forEach(\\.path, action: \\.path) { NutritionRoute() }** — runs the child reducer for each stacked screen.
  - **The pattern-match** **case let .path(.element(id: id, action: .mealDetail(.editTapped)))** — lets the parent intercept a specific action from a specific child feature. This is how parents respond to child events without children knowing about the parent.

  

This pattern — child emits an action, parent decides what to do with it — is how all cross-feature navigation works. Children never know they're being pushed onto a stack. They just emit "edit was tapped" and the parent decides to append an editMeal state.

  

## 6.5 The View Side

Update DailyLogView to render the stack:

  

// Features/Nutrition/Sources/Nutrition/DailyLogView.swift

  

import Core

  

import SwiftUI

  

public struct DailyLogView: View {

  

    @Bindable var store: StoreOf\<DailyLogFeature\>

  

    public init(store: StoreOf\<DailyLogFeature\>) {

  

        self.store = store

  

    }

  

    public var body: some View {

  

        NavigationStack(path: $store.scope(state: \\.path, action: \\.path)) {

  

            rootList

  

                .navigationTitle("Today")

  

        } destination: { store in

  

            switch store.case {

  

            case let .mealDetail(store):

  

                MealDetailView(store: store)

  

            case let .editMeal(store):

  

                EditMealView(store: store)

  

            }

  

        }

  

    }

  

    @ViewBuilder

  

    private var rootList: some View {

  

        List {

  

            if store.isLoading && store.entries.isEmpty {

  

                ProgressView().frame(maxWidth: .infinity)

  

            }

  

            if let message = store.errorMessage {

  

                Text(message).foregroundStyle(.red).font(.footnote)

  

            }

  

            ForEach(store.entries) { entry in

  

                Button {

  

                    store.send(.entryTapped(entry))

  

                } label: {

  

                    MealRow(entry: entry)

  

                }

  

                .buttonStyle(.plain)

  

                .swipeActions {

  

                    Button(role: .destructive) {

  

                        store.send(.deleteSwiped(id: entry.id))

  

                    } label: {

  

                        Label("Delete", systemImage: "trash")

  

                    }

  

                }

  

            }

  

        }

  

        .refreshable { store.send(.refreshRequested) }

  

        .onAppear { store.send(.onAppear) }

  

    }

  

}

  

private struct MealRow: View {

  

    let entry: MealEntry

  

    var body: some View {

  

        VStack(alignment: .leading, spacing: 4) {

  

            Text(entry.name).font(.body)

  

            Text("\\(entry.calories) kcal • \\(Int(entry.protein))g protein")

  

                .font(.caption)

  

                .foregroundStyle(.secondary)

  

        }

  

        .padding(.vertical, 4)

  

    }

  

}

  

The key line:

  

NavigationStack(path: $store.scope(state: \\.path, action: \\.path)) { root } destination: { store in ... }

  

  - $store.scope(state: \\.path, action: \\.path) — a TCA helper that converts the parent's StackState into a binding that NavigationStack understands.
  - The destination: closure receives a store scoped to whichever route enum case is active, and you pattern-match to pick the right view.

  

You'll also need minimal MealDetailView and EditMealView stubs:

  

// Features/Nutrition/Sources/Nutrition/MealDetailView.swift

  

import Core

  

import SwiftUI

  

public struct MealDetailView: View {

  

    let store: StoreOf\<MealDetailFeature\>

  

    public var body: some View {

  

        Form {

  

            LabeledContent("Name", value: store.entry.name)

  

            LabeledContent("Calories", value: "\\(store.entry.calories)")

  

            LabeledContent("Protein", value: "\\(Int(store.entry.protein))g")

  

        }

  

        .navigationTitle("Meal")

  

        .toolbar {

  

            Button("Edit") { store.send(.editTapped) }

  

        }

  

    }

  

}

  

// Features/Nutrition/Sources/Nutrition/EditMealView.swift

  

import Core

  

import SwiftUI

  

public struct EditMealView: View {

  

    @Bindable var store: StoreOf\<EditMealFeature\>

  

    public var body: some View {

  

        Form {

  

            TextField("Name", text: $store.entry.name)

  

            Stepper("Calories: \\(store.entry.calories)",

  

                    value: $store.entry.calories, in: 0...5000)

  

        }

  

        .navigationTitle("Edit")

  

        .toolbar {

  

            Button("Save") { store.send(.saveTapped) }

  

        }

  

    }

  

}

  

Run /run in Claude Code. You should be able to tap a meal, see the detail, tap Edit, and edit it. The back buttons work automatically because NavigationStack observes the state array.

  

## 6.6 The AppFeature — Three Tabs

Now build the root coordinator. Create a new feature package for it:

  

mkdir -p Features/AppCoordinator/Sources/AppCoordinator

  

cd Features/AppCoordinator && swift package init --type library --name AppCoordinator

  

Update its Package.swift to depend on Core plus every feature tab:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "AppCoordinator",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "AppCoordinator", targets: \["AppCoordinator"\]),

  

    \],

  

    dependencies: \[

  

        .package(path: "../../Packages/Core"),

  

        .package(path: "../Dashboard"),

  

        .package(path: "../Nutrition"),

  

        .package(path: "../Workouts"),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "AppCoordinator",

  

            dependencies: \[

  

                .product(name: "Core", package: "Core"),

  

                .product(name: "Dashboard", package: "Dashboard"),

  

                .product(name: "Nutrition", package: "Nutrition"),

  

                .product(name: "Workouts", package: "Workouts"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "AppCoordinatorTests",

  

            dependencies: \["AppCoordinator"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

**Note on a subtlety of our architecture rule.** Remember §5.2: "Features never depend on other Features." AppCoordinator is the one exception — it's the feature that composes features. Think of it as the app's root reducer, not a peer feature. Some teams call this kind of module the "Composition Root." We keep the rule with a single, explicit carve-out, and AppCoordinator is that carve-out.

  

Now create the reducer. Make sure you have minimal Dashboard and Workouts features to compose; if you haven't started them yet, stub them with tiny reducers:

  

// Features/Dashboard/Sources/Dashboard/DashboardFeature.swift

  

import Core

  

import ComposableArchitecture

  

@Reducer

  

public struct DashboardFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public init() {}

  

    }

  

    public enum Action { case onAppear }

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Reduce { \_, \_ in .none }

  

    }

  

}

  

Do the same for WorkoutsFeature. Now the root coordinator:

  

// Features/AppCoordinator/Sources/AppCoordinator/AppFeature.swift

  

import Core

  

import Dashboard

  

import Nutrition

  

import Workouts

  

@Reducer

  

public struct AppFeature {

  

    public enum Tab: Equatable, Hashable, Sendable {

  

        case dashboard

  

        case nutrition

  

        case workouts

  

    }

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var selectedTab: Tab = .dashboard

  

        public var dashboard = DashboardFeature.State()

  

        public var nutrition = DailyLogFeature.State()

  

        public var workouts = WorkoutsFeature.State()

  

        public init() {}

  

    }

  

    public enum Action {

  

        case tabSelected(Tab)

  

        case dashboard(DashboardFeature.Action)

  

        case nutrition(DailyLogFeature.Action)

  

        case workouts(WorkoutsFeature.Action)

  

        case deepLink(URL)

  

    }

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        Scope(state: \\.dashboard, action: \\.dashboard) {

  

            DashboardFeature()

  

        }

  

        Scope(state: \\.nutrition, action: \\.nutrition) {

  

            DailyLogFeature()

  

        }

  

        Scope(state: \\.workouts, action: \\.workouts) {

  

            WorkoutsFeature()

  

        }

  

        Reduce { state, action in

  

            switch action {

  

            case let .tabSelected(tab):

  

                state.selectedTab = tab

  

                return .none

  

            case let .deepLink(url):

  

                return handleDeepLink(url, state: \&state)

  

            case .dashboard, .nutrition, .workouts:

  

                return .none

  

            }

  

        }

  

    }

  

    private func handleDeepLink(

  

        \_ url: URL,

  

        state: inout State

  

    ) -\> Effect\<Action\> {

  

        // Format: fuelwell://meal/\<UUID\>

  

        guard url.scheme == "fuelwell",

  

              url.host == "meal",

  

              let idString = url.pathComponents.dropFirst().first,

  

              let id = UUID(uuidString: idString)

  

        else { return .none }

  

        // Switch to the nutrition tab.

  

        state.selectedTab = .nutrition

  

        // Push the meal detail onto the nutrition stack.

  

        // We use a placeholder entry; Chapter 11 will load the real one.

  

        let placeholder = MealEntry(

  

            id: id, name: "Loading…",

  

            calories: 0, protein: 0, carbs: 0, fat: 0

  

        )

  

        state.nutrition.path.append(

  

            .mealDetail(MealDetailFeature.State(entry: placeholder))

  

        )

  

        return .none

  

    }

  

}

  

And the view:

  

// Features/AppCoordinator/Sources/AppCoordinator/AppView.swift

  

import Core

  

import Dashboard

  

import Nutrition

  

import SwiftUI

  

import Workouts

  

public struct AppView: View {

  

    @Bindable var store: StoreOf\<AppFeature\>

  

    public init(store: StoreOf\<AppFeature\>) { self.store = store }

  

    public var body: some View {

  

        TabView(selection: $store.selectedTab.sending(\\.tabSelected)) {

  

            NavigationStack {

  

                Text("Dashboard coming in chapter 7")

  

            }

  

            .tabItem { Label("Home", systemImage: "house.fill") }

  

            .tag(AppFeature.Tab.dashboard)

  

            DailyLogView(

  

                store: store.scope(state: \\.nutrition, action: \\.nutrition)

  

            )

  

            .tabItem { Label("Nutrition", systemImage: "leaf") }

  

            .tag(AppFeature.Tab.nutrition)

  

            NavigationStack {

  

                Text("Workouts coming in chapter 11")

  

            }

  

            .tabItem { Label("Workouts", systemImage: "figure.run") }

  

            .tag(AppFeature.Tab.workouts)

  

        }

  

    }

  

}

  

Finally, update the app entry point:

  

// FuelWell/FuelWellApp.swift

  

import AppCoordinator

  

import Core

  

import SwiftUI

  

@main

  

struct FuelWellApp: App {

  

    @State private var store = Store(initialState: AppFeature.State()) {

  

        AppFeature()

  

    }

  

    var body: some Scene {

  

        WindowGroup {

  

            AppView(store: store)

  

                .onOpenURL { url in

  

                    store.send(.deepLink(url))

  

                }

  

        }

  

    }

  

}

  

Run /run. You should see a three-tab app. The Nutrition tab has the same push/detail/edit flow you built earlier.

  

## 6.7 Testing Deep Links

This is where the "navigation as data" investment pays off. Testing that a deep link lands in the right place is a matter of sending an action and asserting on state:

  

// Features/AppCoordinator/Tests/AppCoordinatorTests/DeepLinkTests.swift

  

import AppCoordinator

  

import Core

  

import Nutrition

  

import Testing

  

@MainActor

  

struct DeepLinkTests {

  

    @Test

  

    func mealDeepLink\_switchesTab\_andPushesDetail() async {

  

        let mealID = UUID()

  

        let store = TestStore(initialState: AppFeature.State()) {

  

            AppFeature()

  

        }

  

        store.exhaustivity = .off  // We only care about navigation state.

  

        await store.send(.deepLink(URL(string: "fuelwell://meal/\\(mealID)")\!)) {

  

            $0.selectedTab = .nutrition

  

            $0.nutrition.path.append(

  

                .mealDetail(MealDetailFeature.State(

  

                    entry: MealEntry(

  

                        id: mealID, name: "Loading…",

  

                        calories: 0, protein: 0, carbs: 0, fat: 0

  

                    )

  

                ))

  

            )

  

        }

  

    }

  

}

  

store.exhaustivity = .off is TCA's way of saying "I only want to assert on the state I mentioned; ignore other changes." For navigation tests specifically, this is appropriate — we care that the tab switched and the stack got a detail; we don't care about every other field.

  

For regular feature tests (like DailyLogFeatureTests), keep exhaustivity on — the strictness catches real bugs.

  

## 6.8 Sheets and Covers

Push navigation is not the only flow. Sheets (modal cards) and full-screen covers use a different primitive: @Presents.

  

A sketch, not in our codebase yet:

  

@Reducer

  

struct SomeFeature {

  

    @ObservableState

  

    struct State {

  

        @Presents var addMeal: AddMealFeature.State?

  

    }

  

    enum Action {

  

        case addMealTapped

  

        case addMeal(PresentationAction\<AddMealFeature.Action\>)

  

    }

  

    var body: some ReducerOf\<Self\> {

  

        Reduce { state, action in

  

            switch action {

  

            case .addMealTapped:

  

                state.addMeal = AddMealFeature.State()

  

                return .none

  

            case .addMeal(.dismiss):

  

                return .none

  

            case .addMeal:

  

                return .none

  

            }

  

        }

  

        .ifLet(\\.$addMeal, action: \\.addMeal) {

  

            AddMealFeature()

  

        }

  

    }

  

}

  

And the view side:

  

.sheet(item: $store.scope(state: \\.addMeal, action: \\.addMeal)) { store in

  

    AddMealView(store: store)

  

}

  

The pattern is the same: optional state, presentation action, .ifLet operator, sheet-item modifier. We'll exercise this in Chapter 9 when we build the "add meal" flow.

  

## 6.9 The Three Navigation Bugs You'll Hit

**Bug 1: State mutation after pop.** You pop a view, but the parent reducer still tries to read its state.

  

// ❌ Crash

  

case .path(.element(id: id, action: .editMeal(.saveTapped))):

  

    let edited = state.path\[id: id\]\!  // ← might have popped

  

Fix: pattern-match defensively with guard case let.

  

// ✅

  

case let .path(.element(id: id, action: .editMeal(.saveTapped))):

  

    guard case let .editMeal(editState) = state.path\[id: id\]

  

    else { return .none }

  

    // use editState safely

  

**Bug 2: Sheet won't dismiss.** You set the @Presents optional to nil, but the sheet stays on screen. Usually caused by sending the dismissal action *after* a state mutation that nils out the optional.

  

Fix: use PresentationAction.dismiss to let TCA handle the order.

  

**Bug 3: Deep link arrives before root state is ready.** Cold launch from a URL triggers deepLink before the scene is visible. If you push onto a stack that NavigationStack hasn't rendered yet, the push can be lost.

  

Fix: always append to the stack in an action, never in init. TCA's store buffers actions correctly as long as you send them through the store.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| NavigationLink(destination:) for flow-level navigation | Use NavigationStack(path:) + StackState |
| Forgetting .forEach(\\\\.path, action: \\\\.path) in the reducer | The stack won't run child reducers without it |
| Reducing on a specific child action with == | Use pattern matching: case let .path(.element(id:, action: .child(.event))) |
| Feature-to-feature import for composition | Compose only in AppCoordinator (the carve-out) |
| @Presents used alongside push-navigation for the same flow | Pick one — pushes for drill-down, sheets for modal |
| Forgetting store.exhaustivity = .off for navigation tests | Alternatively, assert on every state field — tedious but sometimes worthwhile |
| Deep link parsing without a guard | URL parsing is fragile; defensive guards beat pretty code |

  

## Hands-On Exercise

**Goal:** extend the navigation tree and prove deep linking with a test.

  

1.  **Add a food search screen** to the Nutrition stack.

  

  - Create FoodSearchFeature (State: search query, results; Action: queryChanged, resultTapped).
  - Add a foodSearch(FoodSearchFeature.State) case to NutritionRoute.
  - Add a button in DailyLogView's toolbar that pushes food search.
  - Wire the new case in NutritionRoute's body and in DailyLogView's destination closure.

  

1.  **Add a second deep link format:** **fuelwell://search?q=\<query\>****.** Extend handleDeepLink in AppFeature to parse this URL, switch to the nutrition tab, and push the food search screen with the query pre-filled.

  

1.  **Write tests for both navigation paths:**

  

  - Sending .entryTapped pushes a mealDetail onto the nutrition path.
  - Tapping edit from inside mealDetail pushes an editMeal.
  - The new deep link pushes a foodSearch with the query populated.

  

1.  **Stretch goal:** add a sheet for "Add Meal" using @Presents. Tapping a + toolbar button presents AddMealFeature as a sheet. Dismissing saves if the form is valid.

  

1.  **Verify in the simulator.** Use xcrun simctl openurl to test deep links without rebuilding:

  

xcrun simctl openurl \<UDID\> "fuelwell://meal/12345678-1234-1234-1234-123456789012"

  

xcrun simctl openurl \<UDID\> "fuelwell://search?q=oatmeal"

  

Both should land in the right place.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 6: TCA navigation with stack, tabs, and deep links"

  

git push

  

**Time budget:** 2 hours. If the NavigationStack(path:) binding feels finicky, it is — the TCA helpers are subtle. Lean on the Point-Free docs and don't hesitate to ask Claude Code to explain a specific line.

  

## What's Next

Chapter 7 — **SwiftUI Patterns & View Composition** — is where the UI work accelerates. You'll build the reusable building blocks for every screen ahead: MacroRingView (animated, matched-geometry), MetricTile, SectionHeader, and a proper ComponentGallery preview. By the end your Dashboard tab won't be empty anymore — it'll have real, preview-driven SwiftUI components that later chapters style, test, and snapshot.

  
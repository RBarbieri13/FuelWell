# Chapter 9: State Management in Practice

*"The right question isn't 'where should this state live?' It's 'who is going to be surprised if this state changes?' That set of listeners is your answer."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Classify any piece of state into one of three tiers: view-local, feature, or app-level.
2.  Build a form-driven sheet using TCA's BindingReducer and @Bindable.
3.  Implement field-level validation with derived state instead of stored booleans.
4.  Apply the optimistic-UI pattern: mutate state immediately, roll back on failure.
5.  Handle a parent-child presentation flow using @Presents and PresentationAction.
6.  Decide when derived state should be a computed property versus a cached field.

## Prerequisites

  - Chapters 1–8 complete.
  - The Nutrition tab renders meal rows, supports push navigation to detail/edit, and uses theme tokens.
  - Comfortable editing a TCA reducer and matching parent/child actions.

  

## 9.1 The Three Tiers of State

Every piece of state in a SwiftUI + TCA app belongs to exactly one of three tiers. Misplacing state is the most common architectural mistake, and the three-tier model is the fix.

  

flowchart TD

  

    subgraph Tier1\["Tier 1: View-local"\]

  

        V1\[Text field focus\]

  

        V2\[Expanded/collapsed toggle\]

  

        V3\[Active tab within a carousel\]

  

    end

  

    subgraph Tier2\["Tier 2: Feature"\]

  

        F1\[List of meals for today\]

  

        F2\[Loading/error state\]

  

        F3\[Currently-edited meal draft\]

  

    end

  

    subgraph Tier3\["Tier 3: App-level"\]

  

        A1\[Selected tab\]

  

        A2\[Signed-in user\]

  

        A3\[Feature flags\]

  

    end

  

    Tier1 -.promote if.-\> Tier2

  

    Tier2 -.promote if.-\> Tier3

  

**Tier 1 — View-local.** State that exists to render a single view and that no one else cares about. Lives in @State. Dies with the view. Examples: a form field's focus, a menu's expanded state, a swipe progress value.

  

**Tier 2 — Feature.** State that multiple views within a feature share, or that needs to survive view rebuilds. Lives in TCA State. Managed by the feature's reducer. Examples: the list of meal entries, whether a fetch is in flight, validation errors on a draft.

  

**Tier 3 — App-level.** State that transcends any single feature. Lives in the root AppFeature.State. Examples: which tab is active, the signed-in user, remote feature flags loaded once per session.

  

The rule for deciding: **promote state only when the lower tier can't satisfy the requirement.** If @State works, use it. If it doesn't (because another view needs to read it, or it needs to survive navigation), promote to feature state. Only promote to app state if cross-feature coordination genuinely requires it.

  

**⚠️ Common Pitfall — "Let's put it in app state to be safe"**

  

App-level state is the most expensive tier. Every piece of it has to be considered for persistence, for sync, for test setup. When in doubt, start lower and promote when forced. The opposite ("I'll just put it up there for now") creates app-state bloat that costs you for the life of the project.

  

## 9.2 The Feature We're Building

The Nutrition tab can list and delete meals but it can't add one yet. By the end of this chapter:

  

  - A + toolbar button on DailyLogView opens an **Add Meal** sheet.
  - The sheet is a form: name, calories, protein, carbs, fat.
  - Fields validate as the user types (name required, calories in 1–5000 range).
  - The **Save** button is disabled until the form is valid.
  - On save, the app optimistically appends the entry to the list, dismisses the sheet, then persists via the repository.
  - On failure, the optimistic entry is removed and a toast appears.

  

This one flow exercises every pattern that matters for state management at scale.

  

## 9.3 The AddMeal Feature

Create a new file for the sheet's reducer. This is a *feature* (it owns form state) so it lives inside the Nutrition package:

  

// Features/Nutrition/Sources/Nutrition/AddMealFeature.swift

  

import Core

  

import Foundation

  

@Reducer

  

public struct AddMealFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var name: String = ""

  

        public var caloriesText: String = ""

  

        public var proteinText: String = ""

  

        public var carbsText: String = ""

  

        public var fatText: String = ""

  

        public var isSaving: Bool = false

  

        public var errorMessage: String?

  

        public init() {}

  

        // MARK: Derived validation

  

        public var calories: Int? { Int(caloriesText) }

  

        public var protein: Double? { Double(proteinText) }

  

        public var carbs: Double? { Double(carbsText) }

  

        public var fat: Double? { Double(fatText) }

  

        public var nameError: String? {

  

            name.trimmingCharacters(in: .whitespaces).isEmpty

  

                ? "Name is required"

  

                : nil

  

        }

  

        public var caloriesError: String? {

  

            guard \!caloriesText.isEmpty else { return "Calories required" }

  

            guard let c = calories, c \> 0, c \<= 5000 else {

  

                return "Calories must be between 1 and 5000"

  

            }

  

            return nil

  

        }

  

        public var isValid: Bool {

  

            nameError == nil

  

                && caloriesError == nil

  

                && protein \!= nil

  

                && carbs \!= nil

  

                && fat \!= nil

  

        }

  

        public func buildEntry() -\> MealEntry? {

  

            guard let calories, let protein, let carbs, let fat, isValid

  

            else { return nil }

  

            return MealEntry(

  

                name: name.trimmingCharacters(in: .whitespaces),

  

                calories: calories,

  

                protein: protein,

  

                carbs: carbs,

  

                fat: fat

  

            )

  

        }

  

    }

  

    public enum Action: BindableAction {

  

        case binding(BindingAction\<State\>)

  

        case saveTapped

  

        case cancelTapped

  

        case saveCompleted(Result\<MealEntry, SaveError\>)

  

        // Delegate actions — messages the parent listens for.

  

        public enum Delegate: Equatable {

  

            case savedEntry(MealEntry)

  

            case cancelled

  

        }

  

        case delegate(Delegate)

  

    }

  

    public struct SaveError: Error, Equatable {

  

        public let message: String

  

    }

  

    @Dependency(\\.nutritionRepository) var repository

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        BindingReducer()

  

        Reduce { state, action in

  

            switch action {

  

            case .binding:

  

                return .none

  

            case .cancelTapped:

  

                return .send(.delegate(.cancelled))

  

            case .saveTapped:

  

                guard let entry = state.buildEntry() else { return .none }

  

                state.isSaving = true

  

                state.errorMessage = nil

  

                return .run { \[repository\] send in

  

                    do {

  

                        try await repository.save(entry)

  

                        await send(.saveCompleted(.success(entry)))

  

                    } catch {

  

                        await send(.saveCompleted(.failure(

  

                            SaveError(message: error.localizedDescription)

  

                        )))

  

                    }

  

                }

  

            case let .saveCompleted(.success(entry)):

  

                state.isSaving = false

  

                return .send(.delegate(.savedEntry(entry)))

  

            case let .saveCompleted(.failure(error)):

  

                state.isSaving = false

  

                state.errorMessage = error.message

  

                return .none

  

            case .delegate:

  

                return .none

  

            }

  

        }

  

    }

  

}

  

Three things are worth slowing down on here.

### Derived state vs stored state

Notice nameError, caloriesError, isValid, and buildEntry() are all computed properties — not stored. Every time the view reads store.nameError, it's recomputing from the current name. That's fine — these computations are trivial.

  

The alternative is dangerous: storing nameError: String? as a field and updating it in the reducer on every keystroke. That works, but it creates a second source of truth that can get out of sync with name. Derived state can't lie about its inputs because it's a function of them.

  

**Rule:** if something can be computed from existing state in under a few microseconds, make it computed. Reach for stored state only when the computation is expensive and worth caching.

### The Delegate action pattern

The Delegate sub-enum is how children talk to parents in TCA. The parent listens for delegate(.savedEntry(...)) and decides what to do (append to the list, dismiss the sheet). The child doesn't know the parent exists — it just emits an outbound message.

  

This is the cleanest way to handle "child finished, parent needs to react" without entangling them. We'll see the other side in §9.5.

### BindableAction and BindingReducer

BindableAction is a TCA protocol. Conforming it means your action enum has a .binding(BindingAction\<State\>) case. That case — handled by the BindingReducer() that runs first in your reducer body — is what lets SwiftUI write to state fields through $store.name-style bindings.

  

Without these two pieces, $store.name = "newValue" from a TextField wouldn't compile. With them, it just works.

  

## 9.4 The Sheet View

Build the view that drives this feature. The form uses @Bindable to create bindings into the store, and reads derived errors to gate the Save button:

  

// Features/Nutrition/Sources/Nutrition/AddMealView.swift

  

import Core

  

import DesignSystem

  

import SwiftUI

  

public struct AddMealView: View {

  

    @Bindable var store: StoreOf\<AddMealFeature\>

  

    @Environment(\\.theme) private var theme

  

    public init(store: StoreOf\<AddMealFeature\>) {

  

        self.store = store

  

    }

  

    public var body: some View {

  

        NavigationStack {

  

            Form {

  

                Section("Meal") {

  

                    TextField("Name", text: $store.name)

  

                    if let err = store.nameError, \!store.name.isEmpty {

  

                        fieldError(err)

  

                    }

  

                }

  

                Section("Nutrition") {

  

                    numericField("Calories", text: $store.caloriesText,

  

                                 error: store.caloriesError,

  

                                 show: \!store.caloriesText.isEmpty)

  

                    numericField("Protein (g)", text: $store.proteinText)

  

                    numericField("Carbs (g)", text: $store.carbsText)

  

                    numericField("Fat (g)", text: $store.fatText)

  

                }

  

                if let message = store.errorMessage {

  

                    Section {

  

                        Text(message)

  

                            .font(theme.typography.caption)

  

                            .foregroundStyle(theme.colors.danger)

  

                    }

  

                }

  

            }

  

            .navigationTitle("Add Meal")

  

            .navigationBarTitleDisplayMode(.inline)

  

            .toolbar {

  

                ToolbarItem(placement: .cancellationAction) {

  

                    Button("Cancel") { store.send(.cancelTapped) }

  

                }

  

                ToolbarItem(placement: .confirmationAction) {

  

                    Button("Save") { store.send(.saveTapped) }

  

                        .disabled(\!store.isValid || store.isSaving)

  

                }

  

            }

  

            .disabled(store.isSaving)

  

            .overlay {

  

                if store.isSaving {

  

                    ProgressView().scaleEffect(1.2)

  

                }

  

            }

  

        }

  

    }

  

    @ViewBuilder

  

    private func numericField(

  

        \_ label: String,

  

        text: Binding\<String\>,

  

        error: String? = nil,

  

        show: Bool = false

  

    ) -\> some View {

  

        TextField(label, text: text)

  

            .keyboardType(.decimalPad)

  

        if let error, show {

  

            fieldError(error)

  

        }

  

    }

  

    private func fieldError(\_ message: String) -\> some View {

  

        Text(message)

  

            .font(theme.typography.caption)

  

            .foregroundStyle(theme.colors.danger)

  

    }

  

}

  

\#Preview {

  

    AddMealView(

  

        store: Store(initialState: AddMealFeature.State()) {

  

            AddMealFeature()

  

        }

  

    )

  

}

  

Things to notice:

  

  - **@Bindable var store** lets us write $store.name to get a Binding\<String\>.
  - **.disabled(\!store.isValid || store.isSaving)** on the Save button is a pure read of derived state. No flags, no mirror booleans.
  - **Errors only display once the user has typed something** (\!store.name.isEmpty). You don't scold a user for not having filled in a field they haven't tapped yet.
  - **The overlay spinner** covers the form while saving. Combined with .disabled(store.isSaving), it prevents double-taps.

  

## 9.5 Presenting the Sheet from DailyLogFeature

Now the parent side. DailyLogFeature needs to optionally present AddMealFeature as a sheet. TCA's @Presents property wrapper is the tool.

  

Edit DailyLogFeature.swift:

  

// Features/Nutrition/Sources/Nutrition/DailyLogFeature.swift

  

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

  

        public var path = StackState\<NutritionRoute.State\>()

  

        @Presents public var addMeal: AddMealFeature.State?   // NEW

  

        public init() {}

  

    }

  

    public enum Action {

  

        case onAppear

  

        case refreshRequested

  

        case deleteSwiped(id: MealEntry.ID)

  

        case entryTapped(MealEntry)

  

        case addMealTapped                                      // NEW

  

        case entriesLoaded(\[MealEntry\])

  

        case loadFailed(String)

  

        case entryDeleted(id: MealEntry.ID)

  

        case path(StackActionOf\<NutritionRoute\>)

  

        case addMeal(PresentationAction\<AddMealFeature.Action\>) // NEW

  

        case saveRolledBack(id: MealEntry.ID, message: String)  // NEW

  

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

  

                state.path.append(

  

                    .mealDetail(MealDetailFeature.State(entry: entry))

  

                )

  

                return .none

  

            case .addMealTapped:

  

                state.addMeal = AddMealFeature.State()

  

                return .none

  

            // Listen for the child's delegate actions.

  

            case let .addMeal(.presented(.delegate(.savedEntry(entry)))):

  

                // Optimistic update: show the meal immediately.

  

                state.entries.append(entry)

  

                state.addMeal = nil

  

                return .none

  

            case .addMeal(.presented(.delegate(.cancelled))):

  

                state.addMeal = nil

  

                return .none

  

            // If the sheet's own save fails, the sheet stays open.

  

            // If we somehow get a rollback (e.g. from an offline write that

  

            // later fails), remove the optimistic entry.

  

            case let .saveRolledBack(id, message):

  

                state.entries.removeAll { $0.id == id }

  

                state.errorMessage = message

  

                return .none

  

            case let .path(.element(id: id, action: .mealDetail(.editTapped))):

  

                guard case let .mealDetail(detailState) = state.path\[id: id\]

  

                else { return .none }

  

                state.path.append(

  

                    .editMeal(EditMealFeature.State(entry: detailState.entry))

  

                )

  

                return .none

  

            case .path, .addMeal:

  

                return .none

  

            }

  

        }

  

        .ifLet(\\.$addMeal, action: \\.addMeal) {

  

            AddMealFeature()

  

        }

  

        .forEach(\\.path, action: \\.path) {

  

            NutritionRoute()

  

        }

  

    }

  

}

  

The key additions:

  

  - **@Presents public var addMeal: AddMealFeature.State?** — optional state. When it becomes non-nil, the sheet is "presented."
  - **case addMeal(PresentationAction\<AddMealFeature.Action\>)** — the wrapping action type. .presented(childAction) when the sheet is up, .dismiss when SwiftUI tells us the sheet closed itself.
  - **.ifLet(\\.$addMeal, action: \\.addMeal) { AddMealFeature() }** — the reducer operator that runs the child reducer when state is non-nil.
  - **Pattern-matching on** **.delegate(.savedEntry(\_))** — this is how we react to the child's "I saved successfully" message, optimistically updating the list.

### A subtle sequencing detail

Look at this branch:

  

case let .addMeal(.presented(.delegate(.savedEntry(entry)))):

  

    state.entries.append(entry)

  

    state.addMeal = nil

  

    return .none

  

We mutate entries *and* set addMeal = nil in the same synchronous reduction. SwiftUI renders both changes atomically — the meal appears and the sheet dismisses in one animation frame. If we did these in separate actions, you could see an awkward flash where the sheet is gone but the list hasn't updated yet.

  

## 9.6 The View Side of the Sheet

Add the sheet modifier to DailyLogView and a toolbar button. Edit DailyLogView.swift:

  

// Features/Nutrition/Sources/Nutrition/DailyLogView.swift

  

import Core

  

import DesignSystem

  

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

  

                .toolbar {

  

                    ToolbarItem(placement: .primaryAction) {

  

                        Button {

  

                            store.send(.addMealTapped)

  

                        } label: {

  

                            Label("Add Meal", systemImage: "plus")

  

                        }

  

                    }

  

                }

  

                .sheet(

  

                    item: $store.scope(state: \\.addMeal, action: \\.addMeal)

  

                ) { mealStore in

  

                    AddMealView(store: mealStore)

  

                }

  

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

  

        // ... unchanged from chapter 6

  

    }

  

}

  

The critical line is:

  

.sheet(item: $store.scope(state: \\.addMeal, action: \\.addMeal)) { mealStore in

  

    AddMealView(store: mealStore)

  

}

  

$store.scope(state: \\.addMeal, action: \\.addMeal) produces a Binding\<StoreOf\<AddMealFeature\>?\> — non-nil when the sheet should be up, nil when it shouldn't. SwiftUI's .sheet(item:) presents when the binding is non-nil, dismisses when it becomes nil, and passes the unwrapped store to your content closure. TCA does the unwrapping work for you.

  

Run /run in Claude Code. Tap the +. Fill in a meal. Tap Save. The meal should appear in the list and the sheet should dismiss atomically. Tap + again with an empty name — the Save button stays disabled.

  

## 9.7 The Optimistic UI Pattern

What you just built is a version of the optimistic UI pattern. Summarized:

  

sequenceDiagram

  

    participant User

  

    participant View

  

    participant Reducer

  

    participant Repo

  

    User-\>\>View: tap Save

  

    View-\>\>Reducer: .saveTapped

  

    Reducer-\>\>Repo: save(entry) \[effect\]

  

    Reducer--\>\>View: isSaving = true

  

    Repo--\>\>Reducer: success

  

    Reducer--\>\>View: delegate.savedEntry

  

    Note over View,Reducer: Parent appends entry,\<br/\>dismisses sheet

  

    Reducer--\>\>View: entries += \[entry\]\<br/\>addMeal = nil

  

The pattern has three important properties:

  

1.  **Progress is visible.** The user sees isSaving = true (spinner, disabled buttons) so they know work is happening.
2.  **Success updates local state atomically.** The meal appears and the sheet dismisses in the same frame. No "success → wait → list updates" jitter.
3.  **Failure surfaces in context.** If save fails, the sheet stays up with an inline error message. The user can retry without losing their work.

  

For true optimistic UI — "show the change immediately, roll back if the server fails" — you'd append to entries before the save effect returns, and remove it on failure. The pattern here is subtly different: we append on success, not on request. That's the safer starting point. The fully optimistic version is worth adopting when you have offline-first requirements (Chapter 11).

  

## 9.8 Testing the Flow

The add-meal feature deserves exhaustive tests. A minimum viable suite:

  

// Features/Nutrition/Tests/NutritionTests/AddMealFeatureTests.swift

  

import Core

  

import Testing

  

@testable import Nutrition

  

@MainActor

  

struct AddMealFeatureTests {

  

    @Test

  

    func emptyForm\_isNotValid() {

  

        let state = AddMealFeature.State()

  

        \#expect(state.isValid == false)

  

        \#expect(state.nameError == "Name is required")

  

        \#expect(state.caloriesError == "Calories required")

  

    }

  

    @Test

  

    func filledValidForm\_validatesAndBuildsEntry() {

  

        var state = AddMealFeature.State()

  

        state.name = "Oatmeal"

  

        state.caloriesText = "320"

  

        state.proteinText = "10"

  

        state.carbsText = "55"

  

        state.fatText = "6"

  

        \#expect(state.isValid)

  

        \#expect(state.buildEntry()?.name == "Oatmeal")

  

        \#expect(state.buildEntry()?.calories == 320)

  

    }

  

    @Test

  

    func caloriesOutOfRange\_showsError() {

  

        var state = AddMealFeature.State()

  

        state.caloriesText = "9999"

  

        \#expect(state.caloriesError?.contains("1 and 5000") == true)

  

        \#expect(state.isValid == false)

  

    }

  

    @Test

  

    func saveTapped\_whenValid\_emitsSavedEntryDelegate() async {

  

        let store = TestStore(

  

            initialState: {

  

                var s = AddMealFeature.State()

  

                s.name = "Oatmeal"

  

                s.caloriesText = "320"

  

                s.proteinText = "10"

  

                s.carbsText = "55"

  

                s.fatText = "6"

  

                return s

  

            }()

  

        ) {

  

            AddMealFeature()

  

        } withDependencies: {

  

            $0.nutritionRepository = InMemoryNutritionRepository(seed: \[\])

  

        }

  

        await store.send(.saveTapped) {

  

            $0.isSaving = true

  

            $0.errorMessage = nil

  

        }

  

        await store.receive(\\.saveCompleted.success) {

  

            $0.isSaving = false

  

        }

  

        await store.receive(\\.delegate.savedEntry)

  

    }

  

}

  

Two kinds of tests here:

  

  - **Pure state tests** (no TestStore) for derived computations. Fast, no async, just compute and assert.
  - **Reducer tests** (with TestStore) for effect-driven flows. Exhaustive state assertions at each step.

  

Split your tests this way. Derived properties are pure functions and deserve pure-function tests.

  

## 9.9 When to Cache vs Compute

Back to the question from §9.3. You've seen derived state everywhere in this chapter. When should derived state be *stored* instead?

  

**Store it (as a** **let** **or cached property) when:**

  

  - The computation is non-trivially expensive (sorting thousands of items, parsing large JSON).
  - The same value is read dozens of times per render cycle.
  - You need it to be stable across time (a cached totals snapshot for undo/redo).

  

**Compute it (property getter) when:**

  

  - It's a predicate, a count, a concatenation, a formatted string.
  - The inputs are small.
  - You want it always consistent with the latest state.

  

FuelWell's isValid, nameError, buildEntry() — all computed. They're cheap and the cost of a stale cached value far exceeds the cost of recomputing.

  

## 9.10 The Pattern Recap

You've now seen every state-management pattern FuelWell will use:

  

|  |  |
| :-: | :-: |
| \*\*Pattern\*\* | \*\*When to use\*\* |
| @State | View-local ephemeral state |
| TCA @ObservableState | Feature-level state owned by a reducer |
| @Bindable + $store.field | Two-way bindings into a store |
| BindingReducer + BindingAction | Enables the above on reducer state |
| Derived computed properties | Validation, summaries, predicates |
| @Presents + PresentationAction | Modal presentation (sheet, cover, alert) |
| StackState + StackAction | Push navigation (from Chapter 6) |
| Delegate sub-enum on actions | Child-to-parent messaging |
| Optimistic UI (append on success) | Responsive list mutations |

  

Every future feature in this book — Workouts, Vitamins, etc. — composes these pieces. No new primitives. If a new feature seems to need a new pattern, pause; you're probably reinventing one of these.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Storing nameError: String? and maintaining it in reducer | Make it a computed property on State |
| Child calling into a parent's function directly | Emit a delegate(.event) action; parent listens |
| Using two separate actions for "append + dismiss" | Combine into one reduction; render atomically |
| Showing validation errors before user has typed | Gate display behind \\\!field.isEmpty |
| Putting form state in app-level state | Form state is feature state, dies with sheet |
| Pre-validating in reducer on every keystroke | Let BindingReducer update the field; read validation as derived |
| Forgetting .ifLet on presented state | Child reducer won't run; sheet actions no-op silently |
| Separate @State booleans mirroring isValid, isEmpty | Derive, don't duplicate |

  

## Hands-On Exercise

**Goal:** add a second form — editing an existing meal — reusing the patterns from this chapter.

  

1.  **Extend** **EditMealFeature** (the stub from Chapter 6) with:

  

  - The same fields as AddMealFeature (name, calories text, protein text, etc.)
  - An initializer that takes a MealEntry and pre-populates the text fields.
  - Validation via derived properties (reuse the AddMeal logic).
  - saveTapped, cancelTapped, and a Delegate sub-enum (editedEntry(MealEntry), cancelled).
  - A save effect that calls repository.save(\_:).

  

1.  **Update** **EditMealView** to render a real form with fields, validation errors, and a disabled-until-valid Save button. Mirror AddMealView's structure.

  

1.  **Wire the delegate into** **DailyLogFeature****.** When EditMealFeature emits .delegate(.editedEntry(entry)):

  

  - Update the matching entry in state.entries.
  - Pop the editMeal screen from state.path.

  

1.  **Write tests for the edited-entry flow:**

  

  - Initializing with an existing MealEntry populates all text fields.
  - Saving emits the correct delegate.
  - The parent reducer correctly updates the list on receiving the delegate.

  

1.  **Stretch:** add a "delete this meal" button to EditMealView's toolbar. It should call repository.delete(id:), emit delegate.deletedEntry(id), and cause the parent to remove the entry and pop the stack.

  

1.  **Commit:**

  

git add .

  

git commit -m "Chapter 9: add/edit meal flows with optimistic UI"

  

git push

  

**Time budget:** 2 hours. The first form (AddMeal) took longer because the patterns were new; the edit form should go faster because you're reusing the same shape. If it doesn't feel faster the second time, you're either fighting the patterns or inventing new ones — pause and check.

  

## What's Next

Chapter 10 — **Networking: URLSession, async/await, APIClient** — takes us off-device for the first time. You'll build a typed APIClient protocol with live and mock implementations, integrate Supabase's Swift SDK for auth and queries, and design a request/response error taxonomy that Claude Code can work with cleanly. By the end, FuelWell will fetch a seeded food database from Supabase and you'll have the networking layer that Chapter 11 (persistence) and Chapter 18 (AI proxying) build on.

  
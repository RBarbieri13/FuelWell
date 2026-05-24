import ComposableArchitecture
import Core
import Foundation
import NutritionDomain

@Reducer
public struct DailyLogFeature {
    @ObservableState
    public struct State: Equatable {
        public var entries: IdentifiedArrayOf<MealEntry>
        public var selectedDate: Date
        public var isLoading: Bool
        public var errorMessage: String?
        public var target: MacroTarget
        public var macroSnapshot: MacroDaySnapshot

        public init(
            entries: IdentifiedArrayOf<MealEntry> = [],
            selectedDate: Date = .now,
            isLoading: Bool = false,
            errorMessage: String? = nil,
            target: MacroTarget = MacroTarget(
                calories: 2_100,
                macros: MacroGrams(protein: 150, carbs: 220, fat: 70)
            )
        ) {
            self.entries = entries
            self.selectedDate = selectedDate
            self.isLoading = isLoading
            self.errorMessage = errorMessage
            self.target = target
            self.macroSnapshot = Self.snapshot(entries: entries, target: target)
        }

        public static func snapshot(
            entries: IdentifiedArrayOf<MealEntry>,
            target: MacroTarget,
            nextMeal: MealSlot = .lunch
        ) -> MacroDaySnapshot {
            let intake = entries.reduce(MacroIntake.empty) { partial, entry in
                MacroIntake(
                    calories: partial.calories + entry.calories,
                    macros: MacroGrams(
                        protein: partial.macros.protein + entry.protein,
                        carbs: partial.macros.carbs + entry.carbs,
                        fat: partial.macros.fat + entry.fat
                    )
                )
            }

            return MacroDecisionEngine.evaluate(target: target, intake: intake, nextMeal: nextMeal)
        }
    }

    public enum Action: Equatable {
        case onAppear
        case entriesLoaded([MealEntry])
        case loadFailed(String)
        case deleteSwiped(id: MealEntry.ID)
        case deleteFailed(original: MealEntry)
    }

    @Dependency(\.nutritionRepository) private var repository

    public init() {}

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.isLoading = true
                state.errorMessage = nil
                return .run { [date = state.selectedDate, repository = self.repository] send in
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
                state.macroSnapshot = State.snapshot(entries: state.entries, target: state.target)
                return .none

            case let .loadFailed(message):
                state.isLoading = false
                state.errorMessage = message
                return .none

            case let .deleteSwiped(id):
                guard let original = state.entries[id: id] else { return .none }
                state.entries.remove(id: id)
                state.macroSnapshot = State.snapshot(entries: state.entries, target: state.target)
                return .run { [repository = self.repository] send in
                    do {
                        try await repository.delete(id: id)
                    } catch {
                        await send(.deleteFailed(original: original))
                    }
                }

            case let .deleteFailed(original):
                state.entries.append(original)
                state.macroSnapshot = State.snapshot(entries: state.entries, target: state.target)
                return .none
            }
        }
    }

    private enum CancelID: Hashable {
        case load
    }
}

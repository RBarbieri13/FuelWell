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
        public var isAddMealPresented: Bool
        public var addMealDraft: AddMealDraft

        public init(
            entries: IdentifiedArrayOf<MealEntry> = [],
            selectedDate: Date = .now,
            isLoading: Bool = false,
            errorMessage: String? = nil,
            isAddMealPresented: Bool = false,
            addMealDraft: AddMealDraft = AddMealDraft(),
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
            self.isAddMealPresented = isAddMealPresented
            self.addMealDraft = addMealDraft
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
        case addMealTapped
        case addMealDismissed
        case addMealModeSelected(AddMealMode)
        case addMealNameChanged(String)
        case addMealCaloriesChanged(String)
        case addMealProteinChanged(String)
        case addMealCarbsChanged(String)
        case addMealFatChanged(String)
        case addMealPhotoButtonTapped
        case addMealPhotoLibraryLoaded(Data?)
        case addMealCameraDismissed
        case addMealCameraCaptured(Data)
        case addMealPhotoCleared
        case saveAddMealTapped
        case saveAddMealSucceeded(MealEntry)
        case saveAddMealFailed(String)
        case deleteSwiped(id: MealEntry.ID)
        case deleteFailed(original: MealEntry)
    }

    @Dependency(\.nutritionRepository) private var repository
    @Dependency(\.uuid) private var uuid
    @Dependency(\.date.now) private var now

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

            case .addMealTapped:
                state.isAddMealPresented = true
                state.addMealDraft = AddMealDraft()
                return .none

            case .addMealDismissed:
                state.isAddMealPresented = false
                state.addMealDraft = AddMealDraft()
                return .none

            case let .addMealModeSelected(mode):
                state.addMealDraft.mode = mode
                return .none

            case let .addMealNameChanged(name):
                state.addMealDraft.name = name
                return .none

            case let .addMealCaloriesChanged(calories):
                state.addMealDraft.calories = calories
                return .none

            case let .addMealProteinChanged(protein):
                state.addMealDraft.protein = protein
                return .none

            case let .addMealCarbsChanged(carbs):
                state.addMealDraft.carbs = carbs
                return .none

            case let .addMealFatChanged(fat):
                state.addMealDraft.fat = fat
                return .none

            case .addMealPhotoButtonTapped:
                state.addMealDraft.mode = .photo
                state.addMealDraft.isCameraPresented = true
                return .none

            case let .addMealPhotoLibraryLoaded(data):
                guard let data else { return .none }
                state.addMealDraft.mode = .photo
                state.addMealDraft.photoData = data
                return .none

            case .addMealCameraDismissed:
                state.addMealDraft.isCameraPresented = false
                return .none

            case let .addMealCameraCaptured(data):
                state.addMealDraft.mode = .photo
                state.addMealDraft.photoData = data
                state.addMealDraft.isCameraPresented = false
                return .none

            case .addMealPhotoCleared:
                state.addMealDraft.photoData = nil
                return .none

            case .saveAddMealTapped:
                guard state.addMealDraft.canSave else {
                    state.errorMessage = "Add a meal name and calories before saving."
                    return .none
                }
                guard let entry = state.addMealDraft.entry(id: self.uuid(), loggedAt: self.now) else {
                    return .none
                }
                state.errorMessage = nil
                state.entries.append(entry)
                state.macroSnapshot = State.snapshot(entries: state.entries, target: state.target)
                state.isAddMealPresented = false
                state.addMealDraft = AddMealDraft()
                return .run { [repository = self.repository] send in
                    do {
                        try await repository.save(entry)
                        await send(.saveAddMealSucceeded(entry))
                    } catch {
                        await send(.saveAddMealFailed(error.localizedDescription))
                    }
                }

            case .saveAddMealSucceeded:
                return .none

            case let .saveAddMealFailed(message):
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

public enum AddMealMode: String, CaseIterable, Equatable, Identifiable {
    case photo = "Photo"
    case search = "Search"
    case scan = "Scan"

    public var id: String { self.rawValue }
}

public struct AddMealDraft: Equatable {
    public var mode: AddMealMode
    public var name: String
    public var calories: String
    public var protein: String
    public var carbs: String
    public var fat: String
    public var photoData: Data?
    public var isCameraPresented: Bool

    public init(
        mode: AddMealMode = .photo,
        name: String = "",
        calories: String = "",
        protein: String = "",
        carbs: String = "",
        fat: String = "",
        photoData: Data? = nil,
        isCameraPresented: Bool = false
    ) {
        self.mode = mode
        self.name = name
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.photoData = photoData
        self.isCameraPresented = isCameraPresented
    }

    public var canSave: Bool {
        !self.trimmedName.isEmpty && self.caloriesValue != nil
    }

    public func entry(id: UUID, loggedAt: Date) -> MealEntry? {
        guard let calories = self.caloriesValue else { return nil }
        let name = self.trimmedName
        guard !name.isEmpty else { return nil }

        return MealEntry(
            id: id,
            name: name,
            calories: calories,
            protein: Int(self.protein) ?? 0,
            carbs: Int(self.carbs) ?? 0,
            fat: Int(self.fat) ?? 0,
            loggedAt: loggedAt
        )
    }

    private var trimmedName: String {
        self.name.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var caloriesValue: Int? {
        Int(self.calories).flatMap { $0 > 0 ? $0 : nil }
    }
}

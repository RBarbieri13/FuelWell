import Dependencies
import Foundation

public protocol NutritionRepository: Sendable {
    func entries(for date: Date) async throws -> [MealEntry]
    func save(_ entry: MealEntry) async throws
    func delete(id: MealEntry.ID) async throws
}

public actor InMemoryNutritionRepository: NutritionRepository {
    private var storage: [MealEntry]

    public init(seed: [MealEntry] = []) {
        self.storage = seed
    }

    public func entries(for date: Date) -> [MealEntry] {
        let calendar = Calendar.current
        return self.storage
            .filter { calendar.isDate($0.loggedAt, inSameDayAs: date) }
            .sorted { $0.loggedAt < $1.loggedAt }
    }

    public func save(_ entry: MealEntry) {
        if let index = self.storage.firstIndex(where: { $0.id == entry.id }) {
            self.storage[index] = entry
        } else {
            self.storage.append(entry)
        }
    }

    public func delete(id: MealEntry.ID) {
        self.storage.removeAll { $0.id == id }
    }
}

extension DependencyValues {
    public var nutritionRepository: any NutritionRepository {
        get { self[NutritionRepositoryKey.self] }
        set { self[NutritionRepositoryKey.self] = newValue }
    }
}

private enum NutritionRepositoryKey: DependencyKey {
    static var liveValue: any NutritionRepository {
        InMemoryNutritionRepository()
    }

    static var testValue: any NutritionRepository {
        InMemoryNutritionRepository()
    }

    static var previewValue: any NutritionRepository {
        InMemoryNutritionRepository(seed: [
            MealEntry(name: "Oatmeal", calories: 310, protein: 10, carbs: 55, fat: 6),
            MealEntry(name: "Chicken bowl", calories: 520, protein: 42, carbs: 48, fat: 18)
        ])
    }
}

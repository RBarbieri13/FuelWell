import Foundation

public struct MealEntry: Codable, Equatable, Identifiable, Sendable {
    public let id: UUID
    public var name: String
    public var calories: Int
    public var protein: Int
    public var carbs: Int
    public var fat: Int
    public var loggedAt: Date

    public init(
        id: UUID = UUID(),
        name: String,
        calories: Int,
        protein: Int,
        carbs: Int,
        fat: Int,
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

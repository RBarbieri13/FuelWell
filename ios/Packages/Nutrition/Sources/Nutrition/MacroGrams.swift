public struct MacroGrams: Equatable, Sendable {
    public var protein: Int
    public var carbs: Int
    public var fat: Int

    public init(protein: Int, carbs: Int, fat: Int) {
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
    }

    public static let zero = MacroGrams(protein: 0, carbs: 0, fat: 0)

    public static func - (lhs: MacroGrams, rhs: MacroGrams) -> MacroGrams {
        MacroGrams(
            protein: lhs.protein - rhs.protein,
            carbs: lhs.carbs - rhs.carbs,
            fat: lhs.fat - rhs.fat
        )
    }

    public var displayClamped: MacroGrams {
        MacroGrams(
            protein: max(0, self.protein),
            carbs: max(0, self.carbs),
            fat: max(0, self.fat)
        )
    }
}

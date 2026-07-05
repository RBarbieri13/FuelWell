public struct MacroRemaining: Equatable, Sendable {
    public var calories: Int
    public var macros: MacroGrams

    public init(calories: Int, macros: MacroGrams) {
        self.calories = calories
        self.macros = macros
    }

    public var displayClamped: MacroRemaining {
        MacroRemaining(
            calories: max(0, self.calories),
            macros: self.macros.displayClamped
        )
    }
}

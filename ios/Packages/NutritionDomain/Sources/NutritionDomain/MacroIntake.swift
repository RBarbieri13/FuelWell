public struct MacroIntake: Equatable, Sendable {
    public var calories: Int
    public var macros: MacroGrams

    public init(calories: Int, macros: MacroGrams) {
        self.calories = calories
        self.macros = macros
    }

    public static let empty = MacroIntake(calories: 0, macros: .zero)
}

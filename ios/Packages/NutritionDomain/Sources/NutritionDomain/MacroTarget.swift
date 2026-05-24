public struct MacroTarget: Equatable, Sendable {
    public var calories: Int
    public var macros: MacroGrams

    public init(calories: Int, macros: MacroGrams) {
        self.calories = calories
        self.macros = macros
    }
}

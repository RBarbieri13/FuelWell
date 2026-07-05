#if canImport(UIKit)
import DesignSystem
import Foundation

@MainActor
func registerFuelWellFontsForTests(filePath: String = #filePath) {
    let fontsDirectory = URL(fileURLWithPath: filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .appendingPathComponent("FuelWellApp/Resources/Fonts")

    FuelWellFontRegistry.registerBundledFonts(from: fontsDirectory)
}
#endif

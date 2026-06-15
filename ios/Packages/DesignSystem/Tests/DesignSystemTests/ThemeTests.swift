#if canImport(Testing)
import DesignSystem
import Testing

@Test func generatedThemeContainsCanonicalBrandMark() {
    #expect(Theme.app.color.primary.green.hex == "#1EAE84")
    #expect(Theme.app.color.primary.orange.hex == "#F0795B")
    #expect(Theme.app.color.primary.accent.hex == "#15916C")
    #expect(Theme.app.color.semantic.info.hex == "#3E92C9")
}

@Test func generatedThemeContainsFoundationTokens() {
    #expect(Theme.app.spacing.md == 16)
    #expect(Theme.app.radius.pill == 999)
    #expect(Theme.app.motion.button == 0.15)
    #expect(Theme.app.text.display.size == 32)
    #expect(Theme.app.font.numeric == "DM Sans")
}

@Test func brandFontRegistryMatchesThemeFamilies() {
    #expect(Theme.app.font.display == "Outfit")
    #expect(Theme.app.font.body == "Inter")
    #expect(Theme.app.font.numeric == "DM Sans")

    #expect(FuelWellFontRegistry.bundledFontFiles == [
        "Outfit-Variable.ttf",
        "Inter-Variable.ttf",
        "DMSans-Variable.ttf"
    ])
}
#endif

#if canImport(Testing)
import DesignSystem
import Testing

@Test func generatedThemeContainsCanonicalBrandMark() {
    #expect(Theme.app.color.primary.green.hex == "#47E7B0")
    #expect(Theme.app.color.primary.accent.hex == "#00D278")
}

@Test func generatedThemeContainsFoundationTokens() {
    #expect(Theme.app.spacing.md == 16)
    #expect(Theme.app.radius.pill == 999)
    #expect(Theme.app.motion.button == 0.15)
    #expect(Theme.app.text.display.size == 32)
    #expect(Theme.app.font.numeric == "DM Sans")
}
#endif

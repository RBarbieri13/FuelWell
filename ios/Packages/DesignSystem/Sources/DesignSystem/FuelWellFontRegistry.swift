import CoreText
import Foundation

public enum FuelWellFontRegistry {
    public static let bundledFontFiles = [
        "Outfit-Variable.ttf",
        "Inter-Variable.ttf",
        "DMSans-Variable.ttf"
    ]

    @MainActor private static var didRegister = false

    @MainActor
    public static func registerBundledFonts(in bundle: Bundle = .main) {
        guard let resourceURL = bundle.resourceURL else {
            assertionFailure("Missing FuelWell font resource directory")
            return
        }

        guard !self.didRegister else { return }
        self.didRegister = true

        for fileName in self.bundledFontFiles {
            let nestedURL = resourceURL.appendingPathComponent("Fonts").appendingPathComponent(fileName)
            let rootURL = resourceURL.appendingPathComponent(fileName)
            let fontURL = FileManager.default.fileExists(atPath: nestedURL.path) ? nestedURL : rootURL

            guard FileManager.default.fileExists(atPath: fontURL.path) else {
                assertionFailure("Missing bundled FuelWell font: \(fileName)")
                continue
            }

            self.registerFont(at: fontURL)
        }
    }

    @MainActor
    public static func registerBundledFonts(from fontsDirectory: URL) {
        guard !self.didRegister else { return }
        self.didRegister = true

        for fileName in self.bundledFontFiles {
            let fontURL = fontsDirectory.appendingPathComponent(fileName)
            guard FileManager.default.fileExists(atPath: fontURL.path) else {
                assertionFailure("Missing bundled FuelWell font: \(fileName)")
                continue
            }

            self.registerFont(at: fontURL)
        }
    }

    private static func registerFont(at fontURL: URL) {
        var error: Unmanaged<CFError>?
        if !CTFontManagerRegisterFontsForURL(fontURL as CFURL, .process, &error) {
            _ = error?.takeRetainedValue()
        }
    }
}

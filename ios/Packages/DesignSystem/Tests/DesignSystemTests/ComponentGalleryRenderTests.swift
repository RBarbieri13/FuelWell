#if canImport(Testing) && canImport(UIKit)
import DesignSystem
import SwiftUI
import Testing
import UIKit

@MainActor
@Test func componentGalleryRendersStandardVisualContract() throws {
    registerFuelWellFontsForTests()

    let image = try render(
        ComponentGallery()
            .frame(width: 390, height: 1_600)
    )

    #expect(image.size.width == 390)
    #expect(image.size.height == 1_600)
}

@MainActor
@Test func componentGalleryRendersAccessibilityWorstCase() throws {
    registerFuelWellFontsForTests()

    let image = try render(
        ComponentGallery()
            .environment(\.dynamicTypeSize, .accessibility5)
            .frame(width: 390, height: 2_800)
    )

    #expect(image.size.width == 390)
    #expect(image.size.height == 2_800)
}

@MainActor
@Test func componentGalleryRendersCompactWidth() throws {
    registerFuelWellFontsForTests()

    let image = try render(
        ComponentGallery()
            .frame(width: 320, height: 1_800)
    )

    #expect(image.size.width == 320)
    #expect(image.size.height == 1_800)
}

@MainActor
private func render(_ view: some View) throws -> UIImage {
    let renderer = ImageRenderer(content: view)
    renderer.scale = 1

    guard let image = renderer.uiImage else {
        throw ComponentGalleryRenderError.missingImage
    }

    return image
}

private enum ComponentGalleryRenderError: Error {
    case missingImage
}
#endif

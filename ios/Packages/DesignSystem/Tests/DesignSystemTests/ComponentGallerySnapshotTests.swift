#if canImport(SnapshotTesting) && canImport(UIKit)
import DesignSystem
import SnapshotTesting
import SwiftUI
import XCTest

@MainActor
final class ComponentGallerySnapshotTests: XCTestCase {
    func testComponentGalleryStandardSnapshot() {
        registerFuelWellFontsForTests()

        assertSnapshot(
            of: ComponentGallery(),
            as: .image(layout: .fixed(width: 390, height: 1_600))
        )
    }

    func testComponentGalleryCompactSnapshot() {
        registerFuelWellFontsForTests()

        assertSnapshot(
            of: ComponentGallery(),
            as: .image(layout: .fixed(width: 320, height: 1_800))
        )
    }

    func testComponentGalleryAccessibilitySnapshot() {
        registerFuelWellFontsForTests()

        assertSnapshot(
            of: ComponentGallery()
                .environment(\.dynamicTypeSize, .accessibility5),
            as: .image(layout: .fixed(width: 390, height: 2_800))
        )
    }
}
#endif

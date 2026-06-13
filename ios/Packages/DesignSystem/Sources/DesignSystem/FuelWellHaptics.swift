import UIKit

@MainActor
public enum FuelWellHaptics {
    public static func tap() {
        UISelectionFeedbackGenerator().selectionChanged()
    }

    public static func confirm() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    public static func commit() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    public static func scrub() {
        UIImpactFeedbackGenerator(style: .soft).impactOccurred()
    }

    public static func longPress() {
        UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
    }

    public static func verdictPositive() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    public static func verdictCaution() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }

    public static func verdictBlock() {
        UINotificationFeedbackGenerator().notificationOccurred(.error)
    }
}

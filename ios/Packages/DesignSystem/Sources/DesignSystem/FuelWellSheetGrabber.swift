import SwiftUI

/// Capsule grabber for sheet presentations — the native-iOS affordance that
/// signals "this is a sheet you can drag." Place at the top of sheet content.
public struct FuelWellSheetGrabber: View {
    @Environment(\.theme) private var theme

    public init() {}

    public var body: some View {
        Capsule()
            .fill(self.theme.color.text.disabled.color)
            .frame(width: 36, height: 5)
            .frame(maxWidth: .infinity)
            .padding(.top, self.theme.spacing.sm)
            .padding(.bottom, self.theme.spacing.xs)
            .accessibilityHidden(true)
    }
}

#Preview("Sheet grabber") {
    VStack(spacing: 0) {
        FuelWellSheetGrabber()
        Spacer()
    }
    .frame(height: 120)
    .background(Theme.app.color.bg.surface.color)
}

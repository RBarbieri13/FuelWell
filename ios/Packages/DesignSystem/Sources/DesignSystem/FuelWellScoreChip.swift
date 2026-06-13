import SwiftUI

/// Compact Health Score chip — the de-emphasized score surface.
///
/// Product decision (2026-06-09 review): the Health Score stays in the app
/// but loses hero billing. This chip is the small, secondary representation:
/// a modest numeral, a trend arrow, and a cause-first trend phrase
/// ("sleep variance this week"), never a bare numeric delta.
public struct FuelWellScoreChip: View {
    public enum Trend: Sendable {
        case improving
        case steady
        case declining
    }

    public let value: Int
    public let trend: Trend
    public let trendDetail: String

    @Environment(\.theme) private var theme

    public init(value: Int, trend: Trend, trendDetail: String) {
        self.value = value
        self.trend = trend
        self.trendDetail = trendDetail
    }

    public var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            ZStack {
                Circle()
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 5)
                Circle()
                    .trim(from: 0, to: min(max(Double(self.value) / 100, 0), 1))
                    .stroke(
                        self.theme.color.primary.accent.color,
                        style: StrokeStyle(lineWidth: 5, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                Text("\(self.value)")
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 44, height: 44)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text("Health Score")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                HStack(spacing: self.theme.spacing.xs) {
                    Image(systemName: self.trendSymbol)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(self.trendColor)
                        .accessibilityHidden(true)
                    Text(self.trendDetail)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                }
            }

            Spacer(minLength: self.theme.spacing.sm)

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.muted.color)
                .accessibilityHidden(true)
        }
        .fuelWellCard(padding: self.theme.spacing.md)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Health Score")
        .accessibilityValue("\(self.value) out of 100. \(self.trendDetail).")
        .accessibilityAddTraits(.isButton)
    }

    private var trendSymbol: String {
        switch self.trend {
        case .improving:
            "arrow.up.right"
        case .steady:
            "arrow.right"
        case .declining:
            "arrow.down.right"
        }
    }

    private var trendColor: Color {
        switch self.trend {
        case .improving:
            self.theme.color.semantic.success.color
        case .steady:
            self.theme.color.semantic.info.color
        case .declining:
            self.theme.color.semantic.warning.color
        }
    }
}

#Preview("Score chip") {
    VStack(spacing: 12) {
        FuelWellScoreChip(value: 86, trend: .improving, trendDetail: "stronger sleep this week")
        FuelWellScoreChip(value: 71, trend: .declining, trendDetail: "sleep variance this week")
        FuelWellScoreChip(value: 78, trend: .steady, trendDetail: "holding steady")
    }
    .padding()
    .background(Theme.app.color.bg.base.color)
}

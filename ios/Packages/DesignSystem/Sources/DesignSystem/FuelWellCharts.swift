import SwiftUI

/// Stacked-bar chart for daily calorie trends split by macro channel
/// (meeting decision 2026-06-09: stacked bars showing fat/carb/protein
/// composition per day). Hand-built with SwiftUI shapes — no chart library.
public struct FuelWellStackedBarChart: View {
    public struct Day: Equatable, Identifiable, Sendable {
        public let label: String
        public let protein: Double
        public let carbs: Double
        public let fat: Double

        public init(label: String, protein: Double, carbs: Double, fat: Double) {
            self.label = label
            self.protein = protein
            self.carbs = carbs
            self.fat = fat
        }

        public var id: String { self.label }
        public var total: Double { self.protein + self.carbs + self.fat }
    }

    public let days: [Day]
    public let title: String

    @Environment(\.theme) private var theme

    public init(title: String, days: [Day]) {
        self.title = title
        self.days = days
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            HStack(alignment: .bottom, spacing: self.theme.spacing.sm) {
                ForEach(self.days) { day in
                    VStack(spacing: self.theme.spacing.xs) {
                        self.bar(for: day)
                        Text(day.label)
                            .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                            .fontWeight(.semibold)
                            .foregroundStyle(self.theme.color.text.secondary.color)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 132)

            HStack(spacing: self.theme.spacing.md) {
                self.legendChip(label: "Protein", color: self.theme.color.macro.protein.color)
                self.legendChip(label: "Carbs", color: self.theme.color.macro.carbs.color)
                self.legendChip(label: "Fat", color: self.theme.color.macro.fat.color)
            }
        }
        .fuelWellCard()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.title)
        .accessibilityValue(self.accessibilitySummary)
    }

    private func bar(for day: Day) -> some View {
        let peak = max(self.days.map(\.total).max() ?? 1, 1)
        let scale = day.total / peak

        return GeometryReader { proxy in
            VStack(spacing: 1) {
                Spacer(minLength: 0)
                Rectangle()
                    .fill(self.theme.color.macro.fat.color)
                    .frame(height: self.segmentHeight(day.fat, of: day, scale: scale, in: proxy.size.height))
                Rectangle()
                    .fill(self.theme.color.macro.carbs.color)
                    .frame(height: self.segmentHeight(day.carbs, of: day, scale: scale, in: proxy.size.height))
                Rectangle()
                    .fill(self.theme.color.macro.protein.color)
                    .frame(height: self.segmentHeight(day.protein, of: day, scale: scale, in: proxy.size.height))
            }
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        }
    }

    private func segmentHeight(_ value: Double, of day: Day, scale: Double, in available: CGFloat) -> CGFloat {
        guard day.total > 0 else { return 0 }
        return available * scale * (value / day.total)
    }

    private func legendChip(label: String, color: Color) -> some View {
        HStack(spacing: self.theme.spacing.xs) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            Text(label)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
        }
        .accessibilityHidden(true)
    }

    private var accessibilitySummary: String {
        self.days
            .map { day in
                "\(day.label): \(Int(day.total)) calories, " +
                    "\(Int(day.protein)) protein, \(Int(day.carbs)) carbs, \(Int(day.fat)) fat."
            }
            .joined(separator: " ")
    }
}

/// Lightweight trend sparkline — a single Path line with a soft area fill
/// and a terminal dot. Values are normalized internally; the caller supplies
/// the human-readable summary for accessibility.
public struct FuelWellSparkline: View {
    public let values: [Double]
    public let label: String
    public let summary: String

    @Environment(\.theme) private var theme

    public init(values: [Double], label: String, summary: String) {
        self.values = values
        self.label = label
        self.summary = summary
    }

    public var body: some View {
        GeometryReader { proxy in
            let points = self.points(in: proxy.size)

            ZStack {
                if points.count > 1 {
                    self.areaPath(points: points, size: proxy.size)
                        .fill(self.theme.color.primary.accent.color.opacity(0.1))
                    self.linePath(points: points)
                        .stroke(
                            self.theme.color.primary.accent.color,
                            style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round)
                        )
                    if let last = points.last {
                        Circle()
                            .fill(self.theme.color.primary.accent.color)
                            .frame(width: 6, height: 6)
                            .position(last)
                    }
                }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.label)
        .accessibilityValue(self.summary)
    }

    private func points(in size: CGSize) -> [CGPoint] {
        guard self.values.count > 1 else { return [] }
        let low = self.values.min() ?? 0
        let high = self.values.max() ?? 1
        let span = max(high - low, 0.000_1)
        let inset: CGFloat = 4
        let width = size.width - inset * 2
        let height = size.height - inset * 2
        let step = width / CGFloat(self.values.count - 1)

        return self.values.enumerated().map { index, value in
            let normalized = (value - low) / span
            return CGPoint(
                x: inset + CGFloat(index) * step,
                y: inset + height * (1 - CGFloat(normalized))
            )
        }
    }

    private func linePath(points: [CGPoint]) -> Path {
        var path = Path()
        guard let first = points.first else { return path }
        path.move(to: first)
        for point in points.dropFirst() {
            path.addLine(to: point)
        }
        return path
    }

    private func areaPath(points: [CGPoint], size: CGSize) -> Path {
        var path = self.linePath(points: points)
        guard let last = points.last, let first = points.first else { return path }
        path.addLine(to: CGPoint(x: last.x, y: size.height))
        path.addLine(to: CGPoint(x: first.x, y: size.height))
        path.closeSubpath()
        return path
    }
}

#Preview("Charts") {
    VStack(spacing: 16) {
        FuelWellStackedBarChart(
            title: "Calories by macro",
            days: [
                .init(label: "Mon", protein: 620, carbs: 810, fat: 460),
                .init(label: "Tue", protein: 700, carbs: 760, fat: 420),
                .init(label: "Wed", protein: 540, carbs: 900, fat: 510),
                .init(label: "Thu", protein: 660, carbs: 700, fat: 380),
                .init(label: "Fri", protein: 710, carbs: 820, fat: 440),
                .init(label: "Sat", protein: 480, carbs: 1_010, fat: 560),
                .init(label: "Sun", protein: 640, carbs: 750, fat: 400)
            ]
        )
        FuelWellSparkline(
            values: [188.2, 187.6, 187.9, 187.1, 186.8, 186.9, 186.4],
            label: "Weight trend",
            summary: "Trending down 1.8 pounds over the last 7 entries."
        )
        .frame(height: 56)
        .fuelWellCard()
    }
    .padding()
    .background(Theme.app.color.bg.base.color)
}

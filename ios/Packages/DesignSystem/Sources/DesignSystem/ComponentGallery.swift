import SwiftUI

public struct ComponentGallery: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.theme) private var theme

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.xl) {
                GallerySection(title: "Progress") {
                    GalleryAdaptiveGrid {
                        FuelWellMacroRing(title: "Protein", detail: "114g of 170g", progress: 0.67)
                        FuelWellMacroRing(
                            title: "Carbs",
                            detail: "148g of 220g",
                            progress: 0.49,
                            color: self.theme.color.macro.carbs.color
                        )
                        FuelWellMacroRing(
                            title: "Fat",
                            detail: "58g of 72g",
                            progress: 0.8,
                            color: self.theme.color.macro.fat.color
                        )
                    }
                }

                GallerySection(title: "Metric tiles") {
                    GalleryAdaptiveGrid {
                        FuelWellMetricTile(
                            title: "Steps",
                            value: "8,240",
                            detail: "12% above pace",
                            icon: "figure.walk",
                            tone: .success
                        )
                        FuelWellMetricTile(
                            title: "Active kcal",
                            value: "412",
                            detail: "steady burn",
                            icon: "flame.fill",
                            tone: .warning
                        )
                        FuelWellMetricTile(
                            title: "Sleep",
                            value: "7h 22m",
                            detail: "recovery ready",
                            icon: "moon.fill",
                            tone: .info
                        )
                        FuelWellMetricTile(
                            title: "Protein",
                            value: "114g",
                            detail: "56g remaining",
                            icon: "fork.knife",
                            tone: .success
                        )
                    }
                }

                GallerySection(title: "Actions") {
                    VStack(spacing: self.theme.spacing.sm) {
                        Button("Save meal") {}
                            .buttonStyle(FuelWellPrimaryButtonStyle())
                        Button("Use photo instead") {}
                            .buttonStyle(FuelWellSecondaryButtonStyle())
                    }
                }

                GallerySection(title: "Rows") {
                    VStack(spacing: self.theme.spacing.sm) {
                        FuelWellActionRow(
                            title: "Restaurant guidance",
                            detail: "Choose the best option before ordering",
                            icon: "fork.knife"
                        )
                        FuelWellActionRow(
                            title: "Workout plan",
                            detail: "Next lift adapts to recovery and schedule",
                            icon: "dumbbell"
                        )
                    }
                }

                GallerySection(title: "Empty states") {
                    FuelWellEmptyState(
                        icon: "camera.fill",
                        title: "No meal photos yet",
                        detail: "Your next logged photo will appear here with nutrition context."
                    )
                }
            }
            .padding(self.theme.spacing.md)
            .padding(.bottom, self.theme.spacing.fourXL)
        }
        .background(self.theme.color.bg.base.color)
        .accessibilityIdentifier("design-system.component-gallery")
    }
}

public struct FuelWellMacroRing: View {
    public let title: String
    public let detail: String
    public let progress: Double
    public let color: Color

    @ScaledMetric(relativeTo: .title) private var ringSize: CGFloat = 84
    @Environment(\.theme) private var theme

    public init(title: String, detail: String, progress: Double, color: Color? = nil) {
        self.title = title
        self.detail = detail
        self.progress = progress
        self.color = color ?? Theme.app.color.primary.accent.color
    }

    public var body: some View {
        VStack(spacing: self.theme.spacing.sm) {
            ZStack {
                Circle()
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 8)
                Circle()
                    .trim(from: 0, to: min(max(self.progress, 0), 1))
                    .stroke(self.color, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text("\(Int(self.progress * 100))%")
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                    .minimumScaleFactor(0.72)
            }
            .frame(width: self.ringSize, height: self.ringSize)
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
                .multilineTextAlignment(.center)
        }
        .fuelWellCard()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.title)
        .accessibilityValue("\(Int(self.progress * 100)) percent. \(self.detail).")
    }
}

public struct FuelWellMetricTile: View {
    public enum Tone: Sendable {
        case success
        case warning
        case info
        case premium
    }

    public let title: String
    public let value: String
    public let detail: String
    public let icon: String
    public let tone: Tone
    public let sparklineValues: [Double]?
    public let sparklineSummary: String?

    @Environment(\.theme) private var theme

    public init(
        title: String,
        value: String,
        detail: String,
        icon: String,
        tone: Tone,
        sparklineValues: [Double]? = nil,
        sparklineSummary: String? = nil
    ) {
        self.title = title
        self.value = value
        self.detail = detail
        self.icon = icon
        self.tone = tone
        self.sparklineValues = sparklineValues
        self.sparklineSummary = sparklineSummary
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack(alignment: .top, spacing: self.theme.spacing.sm) {
                Image(systemName: self.icon)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(self.toneColor)
                    .frame(width: 42, height: 42)
                    .background(self.toneColor.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                    .accessibilityHidden(true)

                if let sparklineValues = self.sparklineValues {
                    FuelWellSparkline(
                        values: sparklineValues,
                        label: "\(self.title) trend",
                        summary: self.sparklineSummary ?? self.detail
                    )
                    .frame(height: 34)
                }
            }
            Text(self.value)
                .font(.custom(self.theme.font.numeric, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
                .minimumScaleFactor(0.8)
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
                .fixedSize(horizontal: false, vertical: true)
        }
        .fuelWellCard()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.title)
        .accessibilityValue("\(self.value). \(self.detail).")
    }

    private var toneColor: Color {
        switch self.tone {
        case .success:
            self.theme.color.semantic.success.color
        case .warning:
            self.theme.color.semantic.warning.color
        case .info:
            self.theme.color.semantic.info.color
        case .premium:
            self.theme.color.semantic.premium.color
        }
    }
}

public struct FuelWellActionRow: View {
    public let title: String
    public let detail: String
    public let icon: String

    @Environment(\.theme) private var theme

    public init(title: String, detail: String, icon: String) {
        self.title = title
        self.detail = detail
        self.icon = icon
    }

    public var body: some View {
        HStack(alignment: .center, spacing: self.theme.spacing.md) {
            Image(systemName: self.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 44, height: 44)
                .background(self.theme.color.primary.accent.color.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                Text(self.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.secondary.color)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: self.theme.spacing.sm)
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.muted.color)
                .accessibilityHidden(true)
        }
        .fuelWellCard(padding: self.theme.spacing.md)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.title)
        .accessibilityValue(self.detail)
        .accessibilityAddTraits(.isButton)
    }
}

public struct FuelWellEmptyState: View {
    public let icon: String
    public let title: String
    public let detail: String

    @Environment(\.theme) private var theme

    public init(icon: String, title: String, detail: String) {
        self.icon = icon
        self.title = title
        self.detail = detail
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Image(systemName: self.icon)
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .accessibilityHidden(true)
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
                .fixedSize(horizontal: false, vertical: true)
        }
        .fuelWellCard()
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(self.title)
        .accessibilityValue(self.detail)
    }
}

public struct FuelWellPrimaryButtonStyle: ButtonStyle {
    @Environment(\.theme) private var theme

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
            .fontWeight(.bold)
            .foregroundStyle(self.theme.color.text.onDark.color)
            .frame(minHeight: 52)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, self.theme.spacing.md)
            .background(self.theme.color.primary.accent.color.opacity(configuration.isPressed ? 0.78 : 1))
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

public struct FuelWellSecondaryButtonStyle: ButtonStyle {
    @Environment(\.theme) private var theme

    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
            .fontWeight(.bold)
            .foregroundStyle(self.theme.color.text.primary.color)
            .frame(minHeight: 52)
            .frame(maxWidth: .infinity)
            .padding(.horizontal, self.theme.spacing.md)
            .background(self.theme.color.bg.surface.color.opacity(configuration.isPressed ? 0.72 : 1))
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(self.theme.color.bg.border.color, lineWidth: 1)
            )
    }
}

extension View {
    public func fuelWellCard(padding: CGFloat? = nil) -> some View {
        self.modifier(FuelWellCardModifier(padding: padding))
    }
}

private struct GallerySection<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            self.content()
        }
        .accessibilityElement(children: .contain)
    }
}

private struct GalleryAdaptiveGrid<Content: View>: View {
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @Environment(\.theme) private var theme
    @ViewBuilder let content: () -> Content

    var body: some View {
        LazyVGrid(columns: self.columns, spacing: self.theme.spacing.sm) {
            self.content()
        }
    }

    private var columns: [GridItem] {
        if self.dynamicTypeSize.isAccessibilitySize {
            return [GridItem(.flexible(), spacing: self.theme.spacing.sm)]
        }

        return [
            GridItem(.flexible(), spacing: self.theme.spacing.sm),
            GridItem(.flexible(), spacing: self.theme.spacing.sm)
        ]
    }
}

private struct FuelWellCardModifier: ViewModifier {
    let padding: CGFloat?
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.padding ?? self.theme.spacing.md)
            .background(self.theme.color.bg.surface.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
            )
    }
}

#Preview("Component Gallery") {
    ComponentGallery()
}

#Preview("Accessibility Worst Case") {
    ComponentGallery()
        .environment(\.dynamicTypeSize, .accessibility5)
}

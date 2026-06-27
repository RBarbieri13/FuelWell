import SwiftUI

public enum FuelWellIntentTone: Equatable, Sendable {
    case primary
    case nutrition
    case activity
    case insight
    case caution
}

public struct FuelWellActionLauncherItem: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let detail: String
    public let systemImage: String
    public let tone: FuelWellIntentTone

    public init(
        id: String,
        title: String,
        detail: String,
        systemImage: String,
        tone: FuelWellIntentTone = .primary
    ) {
        self.id = id
        self.title = title
        self.detail = detail
        self.systemImage = systemImage
        self.tone = tone
    }
}

public struct FuelWellActionLauncherGrid: View {
    public let title: String
    public let detail: String
    public let items: [FuelWellActionLauncherItem]
    public let onSelect: (FuelWellActionLauncherItem) -> Void

    @Environment(\.theme) private var theme

    public init(
        title: String,
        detail: String,
        items: [FuelWellActionLauncherItem],
        onSelect: @escaping (FuelWellActionLauncherItem) -> Void
    ) {
        self.title = title
        self.detail = detail
        self.items = items
        self.onSelect = onSelect
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.title)
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: self.theme.spacing.sm) {
                ForEach(self.items) { item in
                    Button {
                        self.onSelect(item)
                    } label: {
                        FuelWellActionLauncherCell(item: item)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("fuelwell.action-launcher.\(item.id)")
                }
            }
        }
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.lg)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
        .accessibilityElement(children: .contain)
    }
}

private struct FuelWellActionLauncherCell: View {
    let item: FuelWellActionLauncherItem

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Image(systemName: self.item.systemImage)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(self.toneColor)
                .frame(width: 44, height: 44)
                .background(self.toneColor.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.item.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.secondary.color)
                    .lineLimit(2)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 128, alignment: .topLeading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }

    private var toneColor: Color {
        self.theme.fuelWellToneColor(self.item.tone)
    }
}

public struct FuelWellMetricGoalCard: View {
    public let title: String
    public let value: String
    public let unit: String
    public let detail: String
    public let progress: Double
    public let systemImage: String
    public let tone: FuelWellIntentTone

    @Environment(\.theme) private var theme

    public init(
        title: String,
        value: String,
        unit: String,
        detail: String,
        progress: Double,
        systemImage: String,
        tone: FuelWellIntentTone = .primary
    ) {
        self.title = title
        self.value = value
        self.unit = unit
        self.detail = detail
        self.progress = progress
        self.systemImage = systemImage
        self.tone = tone
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack(spacing: self.theme.spacing.sm) {
                Image(systemName: self.systemImage)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(self.toneColor)
                    .frame(width: 30, height: 30)
                    .background(self.toneColor.opacity(0.12))
                    .clipShape(Circle())

                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.body.color)

                Spacer()

                Text("\(Int(self.clampedProgress * 100))%")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.toneColor)
                    .padding(.horizontal, self.theme.spacing.sm)
                    .padding(.vertical, self.theme.spacing.xs)
                    .background(self.toneColor.opacity(0.12))
                    .clipShape(Capsule())
            }

            HStack(alignment: .firstTextBaseline, spacing: self.theme.spacing.xs) {
                Text(self.value)
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.titleLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.unit)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.secondary.color)
            }

            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)

            ZStack(alignment: .leading) {
                Capsule()
                    .fill(self.theme.color.bg.borderSoft.color)
                Capsule()
                    .fill(self.toneColor)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .scaleEffect(x: self.clampedProgress, y: 1, anchor: .leading)
            }
            .frame(height: 8)
            .accessibilityHidden(true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.lg)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
    }

    private var clampedProgress: Double {
        min(max(self.progress, 0), 1)
    }

    private var toneColor: Color {
        self.theme.fuelWellToneColor(self.tone)
    }
}

public struct FuelWellScoreRingCard: View {
    public let title: String
    public let value: String
    public let subtitle: String
    public let detail: String
    public let systemImage: String
    public let progress: Double
    public let tone: FuelWellIntentTone

    @Environment(\.theme) private var theme

    public init(
        title: String,
        value: String,
        subtitle: String,
        detail: String,
        systemImage: String,
        progress: Double,
        tone: FuelWellIntentTone = .primary
    ) {
        self.title = title
        self.value = value
        self.subtitle = subtitle
        self.detail = detail
        self.systemImage = systemImage
        self.progress = progress
        self.tone = tone
    }

    public var body: some View {
        HStack(alignment: .center, spacing: self.theme.spacing.lg) {
            VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
                Label(self.title, systemImage: self.systemImage)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.toneColor)
                    .textCase(.uppercase)

                Text(self.detail)
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.subtitle)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Spacer(minLength: self.theme.spacing.sm)

            ZStack {
                Circle()
                    .stroke(self.toneColor.opacity(0.14), lineWidth: 12)
                Circle()
                    .trim(from: 0, to: self.clampedProgress)
                    .stroke(
                        self.toneColor,
                        style: StrokeStyle(lineWidth: 12, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))

                VStack(spacing: self.theme.spacing.xs) {
                    Text(self.value)
                        .font(.custom(self.theme.font.numeric, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text("remaining")
                        .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                        .textCase(.uppercase)
                }
            }
            .frame(width: 112, height: 112)
            .accessibilityHidden(true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.lg)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
        .accessibilityElement(children: .combine)
    }

    private var clampedProgress: Double {
        min(max(self.progress, 0), 1)
    }

    private var toneColor: Color {
        self.theme.fuelWellToneColor(self.tone)
    }
}

public struct FuelWellMetricExplainerPoint: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let detail: String
    public let systemImage: String
    public let tone: FuelWellIntentTone

    public init(
        id: String,
        title: String,
        detail: String,
        systemImage: String,
        tone: FuelWellIntentTone = .insight
    ) {
        self.id = id
        self.title = title
        self.detail = detail
        self.systemImage = systemImage
        self.tone = tone
    }
}

public struct FuelWellMetricExplainerCard: View {
    public let eyebrow: String
    public let title: String
    public let detail: String
    public let points: [FuelWellMetricExplainerPoint]

    @Environment(\.theme) private var theme

    public init(
        eyebrow: String,
        title: String,
        detail: String,
        points: [FuelWellMetricExplainerPoint]
    ) {
        self.eyebrow = eyebrow
        self.title = title
        self.detail = detail
        self.points = points
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.eyebrow)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .textCase(.uppercase)

                Text(self.title)
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.points) { point in
                    HStack(alignment: .top, spacing: self.theme.spacing.md) {
                        Image(systemName: point.systemImage)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(self.theme.fuelWellToneColor(point.tone))
                            .frame(width: 36, height: 36)
                            .background(self.theme.fuelWellToneColor(point.tone).opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                            Text(point.title)
                                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                                .fontWeight(.bold)
                                .foregroundStyle(self.theme.color.text.primary.color)
                            Text(point.detail)
                                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                                .fontWeight(.semibold)
                                .foregroundStyle(self.theme.color.text.secondary.color)
                        }

                        Spacer()
                    }
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.bg.base.color)
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.lg)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

extension Theme {
    fileprivate func fuelWellToneColor(_ tone: FuelWellIntentTone) -> Color {
        switch tone {
        case .primary:
            self.color.primary.accent.color
        case .nutrition:
            self.color.macro.calories.color
        case .activity:
            self.color.primary.green.color
        case .insight:
            self.color.macro.protein.color
        case .caution:
            self.color.macro.carbs.color
        }
    }
}

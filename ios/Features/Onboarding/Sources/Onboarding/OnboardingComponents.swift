import DesignSystem
import SwiftUI

struct OnboardingProgress: View {
    let step: OnboardingFeature.Step
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text("Step \(self.step.rawValue + 1) of \(OnboardingFeature.Step.allCases.count)")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.secondary.color)

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(self.theme.color.bg.borderSoft.color)
                    Capsule()
                        .fill(self.theme.color.primary.green.color)
                        .frame(width: self.progressWidth(totalWidth: geometry.size.width))
                }
            }
            .frame(height: 6)
        }
    }

    private func progressWidth(totalWidth: CGFloat) -> CGFloat {
        totalWidth *
            CGFloat(self.step.rawValue + 1) /
            CGFloat(OnboardingFeature.Step.allCases.count)
    }
}

struct OnboardingHero: View {
    let icon: String
    let title: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Image(systemName: self.icon)
                .font(.system(size: 32, weight: .bold))
                .foregroundStyle(self.theme.color.primary.green.color)
                .accessibilityHidden(true)

            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
    }
}

struct ChoiceRow: View {
    let title: String
    let detail: String
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        Button(action: self.action) {
            HStack(spacing: self.theme.spacing.md) {
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.title)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text(self.detail)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.medium)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
                Spacer()
                self.selectionIcon
            }
            .padding(self.theme.spacing.md)
            .background(self.theme.color.bg.surface.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(self.selectionBorder)
        }
        .buttonStyle(.plain)
    }

    private var selectionIcon: some View {
        Image(systemName: self.isSelected ? "checkmark.circle.fill" : "circle")
            .font(.title3.weight(.bold))
            .foregroundStyle(self.isSelected ? self.theme.color.primary.green.color : self.theme.color.text.muted.color)
            .accessibilityHidden(true)
    }

    private var selectionBorder: some View {
        RoundedRectangle(cornerRadius: self.theme.radius.md)
            .stroke(
                self.isSelected ? self.theme.color.primary.green.color : self.theme.color.bg.borderSoft.color,
                lineWidth: 1.5
            )
    }
}

struct ToggleChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        Button(action: self.action) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.titleColor)
                .frame(maxWidth: .infinity)
                .padding(.vertical, self.theme.spacing.sm)
                .background(self.backgroundColor)
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        }
        .buttonStyle(.plain)
    }

    private var titleColor: Color {
        self.isSelected ? self.theme.color.text.onDark.color : self.theme.color.text.primary.color
    }

    private var backgroundColor: Color {
        self.isSelected ? self.theme.color.bg.elevated.color : self.theme.color.bg.surface.color
    }
}

struct OnboardingBullet: View {
    let title: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            Image(systemName: "checkmark.circle.fill")
                .font(.title3.weight(.bold))
                .foregroundStyle(self.theme.color.primary.green.color)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                Text(self.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
        }
        .phaseCard()
    }
}

struct OnboardingValueRow: View {
    let label: String
    let value: String
    @Environment(\.theme) private var theme

    var body: some View {
        HStack {
            Text(self.label)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
            Spacer()
            Text(self.value)
                .font(.custom(self.theme.font.numeric, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.primary.accent.color)
        }
    }
}

struct PrimaryOnboardingButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        Button(action: self.action) {
            Label(self.title, systemImage: self.icon)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.bold)
                .frame(maxWidth: .infinity)
                .padding(self.theme.spacing.md)
        }
        .buttonStyle(.borderedProminent)
        .tint(self.theme.color.primary.green.color)
    }
}

struct SecondaryOnboardingButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        Button(action: self.action) {
            Label(self.title, systemImage: self.icon)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .frame(maxWidth: .infinity)
                .padding(self.theme.spacing.md)
        }
        .buttonStyle(.bordered)
        .tint(self.theme.color.text.body.color)
    }
}

extension View {
    func phaseCard(padding: CGFloat? = nil) -> some View {
        modifier(OnboardingPhaseCardModifier(padding: padding))
    }

    func onboardingField() -> some View {
        self
            .textFieldStyle(.plain)
            .font(.body.weight(.semibold))
            .padding(14)
            .background(Color(uiColor: .secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct OnboardingPhaseCardModifier: ViewModifier {
    let padding: CGFloat?
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.padding ?? self.theme.spacing.lg)
            .background(self.theme.color.bg.surface.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
            )
    }
}

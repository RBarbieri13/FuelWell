import DesignSystem
import SwiftUI

struct PhaseScroll<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    @Environment(\.theme) private var theme

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                self.content()
            }
            .padding(self.theme.spacing.md)
            .padding(.bottom, self.theme.spacing.fourXL)
        }
        .background(self.theme.color.bg.base.color)
        .navigationTitle(self.title)
    }
}

struct PhaseHero: View {
    let icon: String
    let title: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Image(systemName: self.icon)
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .phaseCard()
    }
}

struct DashboardSection: View {
    let title: String
    let items: [PhaseRowItem]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.items) { item in
                    PhaseInfoRow(item: item)
                }
            }
        }
    }
}

struct PhaseInfoRow: View {
    let item: PhaseRowItem
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            PhaseInfoRowIcon(icon: self.item.icon)
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                Text(self.item.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
            Spacer()
        }
        .phaseCard(padding: self.theme.spacing.md)
    }
}

struct PhaseNavigationRow: View {
    let item: PhaseRowItem
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            PhaseInfoRowIcon(icon: self.item.icon)
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                Text(self.item.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.muted.color)
        }
        .phaseCard(padding: self.theme.spacing.md)
    }
}

private struct PhaseInfoRowIcon: View {
    let icon: String
    @Environment(\.theme) private var theme

    var body: some View {
        Image(systemName: self.icon)
            .font(.system(size: 18, weight: .semibold))
            .foregroundStyle(self.theme.color.primary.accent.color)
            .frame(width: 42, height: 42)
            .background(self.theme.color.primary.accent.color.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
    }
}

struct PhaseRowItem: Equatable, Identifiable {
    let title: String
    let detail: String
    let icon: String

    var id: String { "\(self.title)-\(self.detail)" }
}

extension View {
    func phaseCard(padding: CGFloat? = nil) -> some View {
        modifier(PhaseCardModifier(padding: padding))
    }
}

private struct PhaseCardModifier: ViewModifier {
    let padding: CGFloat?
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.padding ?? self.theme.spacing.lg)
            .background(self.theme.color.bg.surface.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .shadow(color: self.theme.color.primary.accent.color.opacity(0.08), radius: 14, x: 0, y: 6)
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
            )
    }
}

import DesignSystem
import SwiftUI

struct RestaurantGuidanceView: View {
    let plan: RestaurantGuidancePlan
    let onLogMeal: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "fork.knife")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 44, height: 44)
                    .background(self.theme.color.primary.green.color.opacity(0.14))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Restaurant Guidance")
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDarkMuted.color)

                    Text(self.plan.headline)
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDark.color)
                }

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.onDark.color)
            }

            Text(self.plan.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.onDark.color)

            Text(self.plan.remainingSummary)
                .font(.custom(self.theme.font.numeric, size: self.theme.text.titleSM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.primary.green.color)

            GuidanceSection(title: "Order priorities", items: self.plan.priorities)
            GuidanceSection(title: "Menu patterns", items: self.plan.menuPatterns)

            Button(action: self.onLogMeal) {
                Label("Log This Meal", systemImage: "camera.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .controlSize(.large)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct GuidanceSection: View {
    let title: String
    let items: [RestaurantGuidanceItem]

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.items) { item in
                    HStack(alignment: .top, spacing: self.theme.spacing.sm) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(self.theme.color.primary.green.color)
                            .padding(.top, 2)

                        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                            Text(item.title)
                                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                                .fontWeight(.bold)
                                .foregroundStyle(self.theme.color.text.onDark.color)

                            Text(item.detail)
                                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                                .fontWeight(.semibold)
                                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                        }

                        Spacer()
                    }
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.text.onDark.color.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                }
            }
        }
    }
}

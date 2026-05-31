import DesignSystem
import SwiftUI

struct RestaurantGuidanceView: View {
    let plan: RestaurantGuidancePlan
    let onLogMeal: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme
    @State private var selectedDetail: RestaurantGuidanceItem?

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

            if let selectedDetail {
                RestaurantDetailCard(
                    item: selectedDetail,
                    onLogMeal: self.onLogMeal,
                    onDismiss: { self.selectedDetail = nil }
                )
            } else {
                GuidanceSection(
                    title: "Order priorities",
                    items: self.plan.priorities,
                    onInspect: { self.selectedDetail = $0 }
                )
                GuidanceSection(
                    title: "Menu patterns",
                    items: self.plan.menuPatterns,
                    onInspect: { self.selectedDetail = $0 }
                )
            }

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
    let onInspect: (RestaurantGuidanceItem) -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.items) { item in
                    Button {
                        self.onInspect(item)
                    } label: {
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

                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                                .accessibilityHidden(true)
                        }
                    }
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.text.onDark.color.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("restaurant.detail.\(item.id)")
                }
            }
        }
    }
}

private struct RestaurantDetailCard: View {
    let item: RestaurantGuidanceItem
    let onLogMeal: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "menucard.fill")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.item.title)
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDark.color)
                    Text(self.item.detail)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                }

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.onDark.color)
            }

            GuidanceDetailRow(title: "Ask for", detail: "Protein first, sauce measured, starch visible.")
            GuidanceDetailRow(title: "Avoid", detail: "Hidden oils, fried sides, and unmeasured toppings.")
            GuidanceDetailRow(title: "Logging", detail: "Photo first, then clean up portions after the meal.")

            Button(action: self.onLogMeal) {
                Label("Log This Order", systemImage: "camera.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.text.onDark.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        .accessibilityIdentifier("restaurant.detail.card")
    }
}

private struct GuidanceDetailRow: View {
    let title: String
    let detail: String

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.sm) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)
                .frame(width: 74, alignment: .leading)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
            Spacer()
        }
    }
}

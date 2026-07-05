import DesignSystem
import SwiftUI

struct GroceryListView: View {
    let plan: GroceryListPlan
    let onLogMeal: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "cart")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 44, height: 44)
                    .background(self.theme.color.primary.green.color.opacity(0.14))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Grocery List")
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

            VStack(spacing: self.theme.spacing.md) {
                ForEach(self.plan.groups) { group in
                    GroceryListGroupView(group: group)
                }
            }

            Button(action: self.onLogMeal) {
                Label("Log Meal", systemImage: "camera.fill")
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

private struct GroceryListGroupView: View {
    let group: GroceryListGroup

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.group.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.group.items) { item in
                    GroceryListItemRow(item: item)
                }
            }
        }
    }
}

private struct GroceryListItemRow: View {
    let item: GroceryListItem

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.sm) {
            Image(systemName: self.item.isPriority ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.green.color)
                .padding(.top, 2)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.name)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.onDark.color)

                Text(self.item.detail)
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

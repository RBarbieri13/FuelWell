import DesignSystem
import SwiftUI

struct RecipeBrowserView: View {
    let plan: RecipeBrowserPlan
    let onChoose: (RecipeSuggestion) -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "book.pages")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 44, height: 44)
                    .background(self.theme.color.primary.green.color.opacity(0.14))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Recipe Browser")
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

            Text(self.plan.focus)
                .font(.custom(self.theme.font.numeric, size: self.theme.text.titleSM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.primary.green.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.plan.suggestions) { recipe in
                    RecipeSuggestionRow(recipe: recipe) {
                        self.onChoose(recipe)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct RecipeSuggestionRow: View {
    let recipe: RecipeSuggestion
    let onChoose: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.recipe.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.onDark.color)

                Text(self.recipe.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.onDarkMuted.color)

                Text(self.recipe.macroSummary)
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.primary.green.color)
            }

            Spacer()

            Button("Use", systemImage: "plus.circle.fill", action: self.onChoose)
                .labelStyle(.iconOnly)
                .tint(self.theme.color.primary.green.color)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.text.onDark.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
    }
}

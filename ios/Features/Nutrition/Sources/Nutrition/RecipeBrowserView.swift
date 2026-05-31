import DesignSystem
import SwiftUI

struct RecipeBrowserView: View {
    let plan: RecipeBrowserPlan
    let onChoose: (RecipeSuggestion) -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme
    @State private var selectedRecipe: RecipeSuggestion?

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

            if let selectedRecipe {
                RecipeDetailCard(
                    recipe: selectedRecipe,
                    onChoose: { self.onChoose(selectedRecipe) },
                    onDismiss: { self.selectedRecipe = nil }
                )
            } else {
                VStack(spacing: self.theme.spacing.sm) {
                    ForEach(self.plan.suggestions) { recipe in
                        RecipeSuggestionRow(
                            recipe: recipe,
                            onInspect: { self.selectedRecipe = recipe },
                            onChoose: { self.onChoose(recipe) }
                        )
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
    let onInspect: () -> Void
    let onChoose: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            Button(action: self.onInspect) {
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
            }
            .buttonStyle(.plain)
            .frame(maxWidth: .infinity, alignment: .leading)

            Spacer()

            Button("Use", systemImage: "plus.circle.fill", action: self.onChoose)
                .labelStyle(.iconOnly)
                .tint(self.theme.color.primary.green.color)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.text.onDark.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        .accessibilityIdentifier("recipe.suggestion.\(self.recipe.id)")
    }
}

private struct RecipeDetailCard: View {
    let recipe: RecipeSuggestion
    let onChoose: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "book.pages.fill")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.recipe.title)
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDark.color)
                    Text(self.recipe.detail)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                }

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.onDark.color)
            }

            VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
                RecipeDetailRow(title: "Macros", detail: self.recipe.macroSummary)
                RecipeDetailRow(title: "Portion", detail: "One plate; edit exact grams after choosing.")
                RecipeDetailRow(title: "Why here", detail: "Fits the remaining day without needing a new plan.")
            }

            Button(action: self.onChoose) {
                Label("Use Recipe", systemImage: "plus.circle.fill")
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
        .accessibilityIdentifier("recipe.detail")
    }
}

private struct RecipeDetailRow: View {
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

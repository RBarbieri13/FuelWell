import DesignSystem
import SwiftUI

struct BackupLoggingCard: View {
    let mode: AddMealMode
    let suggestions: [FoodSearchSuggestion]
    let selectedSuggestion: FoodSearchSuggestion?
    let onInspect: (FoodSearchSuggestion) -> Void
    let onDismissDetail: () -> Void
    let onChoose: (FoodSearchSuggestion) -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: self.iconName)
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 32)

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

            if self.mode == .search {
                if let selectedSuggestion {
                    FoodDetailPortionCard(
                        suggestion: selectedSuggestion,
                        onChoose: { self.onChoose(selectedSuggestion) },
                        onDismiss: self.onDismissDetail
                    )
                } else {
                    ForEach(self.suggestions) { suggestion in
                        FoodSuggestionRow(
                            suggestion: suggestion,
                            onInspect: { self.onInspect(suggestion) },
                            onChoose: { self.onChoose(suggestion) }
                        )
                    }
                }
            } else {
                PortionEditorPreview()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }

    private var iconName: String {
        self.mode == .search ? "magnifyingglass" : "barcode.viewfinder"
    }

    private var title: String {
        self.mode == .search ? "Food search" : "Barcode backup"
    }

    private var detail: String {
        if self.mode == .search {
            return "Pick a common food, then adjust the portion in the macro fields below."
        }
        return "Scan packaged foods when available. Manual portions stay ready as the fallback."
    }
}

private struct FoodSuggestionRow: View {
    let suggestion: FoodSearchSuggestion
    let onInspect: () -> Void
    let onChoose: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Button(action: self.onInspect) {
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.suggestion.name)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text(self.suggestion.serving)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                    Text(self.suggestion.macroSummary)
                        .font(.custom(self.theme.font.numeric, size: self.theme.text.bodySM.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.primary.accent.color)
                }
            }
            .buttonStyle(.plain)
            .frame(maxWidth: .infinity, alignment: .leading)

            Button("Use", systemImage: "plus.circle.fill", action: self.onChoose)
                .labelStyle(.iconOnly)
                .font(.title3.weight(.bold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .accessibilityLabel("Use \(self.suggestion.name)")
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        .accessibilityIdentifier("food.search.suggestion.\(self.suggestion.id)")
    }
}

private struct FoodDetailPortionCard: View {
    let suggestion: FoodSearchSuggestion
    let onChoose: () -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "slider.horizontal.3")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.suggestion.name)
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text(self.suggestion.serving)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.body.color)
                }

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.body.color)
            }

            VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
                PortionRow(title: "Base serving", detail: self.suggestion.serving)
                PortionRow(title: "Macros", detail: self.suggestion.macroSummary)
                PortionRow(title: "Editor", detail: "Adjust exact grams in the macro fields after choosing.")
            }

            Button(action: self.onChoose) {
                Label("Use This Food", systemImage: "plus.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        .accessibilityIdentifier("food.detail.portion")
    }
}

private struct PortionRow: View {
    let title: String
    let detail: String

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.sm) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
                .frame(width: 92, alignment: .leading)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            Spacer()
        }
    }
}

private struct PortionEditorPreview: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("Portion editor")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            HStack {
                Text("1 serving")
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.titleSM.size))
                    .fontWeight(.bold)
                Spacer()
                Text("Use the macro fields below to adjust.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.secondary.color)
            }
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
    }
}

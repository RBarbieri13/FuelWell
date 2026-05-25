import DesignSystem
import SwiftUI

struct BackupLoggingCard: View {
    let mode: AddMealMode
    let suggestions: [FoodSearchSuggestion]
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
                ForEach(self.suggestions) { suggestion in
                    FoodSuggestionRow(suggestion: suggestion) {
                        self.onChoose(suggestion)
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
    let onChoose: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        Button(action: self.onChoose) {
            HStack(spacing: self.theme.spacing.md) {
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

                Spacer()

                Image(systemName: "plus.circle.fill")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
            }
            .padding(self.theme.spacing.sm)
            .background(self.theme.color.bg.base.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        }
        .buttonStyle(.plain)
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

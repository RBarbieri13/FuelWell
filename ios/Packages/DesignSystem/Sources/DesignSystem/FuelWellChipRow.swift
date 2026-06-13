import SwiftUI

/// Horizontally scrolling filter / preference chips (meeting decision
/// 2026-06-09: diet filters like high protein, low carb, vegan).
///
/// Selected chips use the accent token at 12% alpha behind full-saturation
/// text per the DESIGN.md saturation rule — tinted backgrounds are fine,
/// tinted foregrounds are not.
public struct FuelWellChipRow: View {
    public struct Chip: Equatable, Identifiable, Sendable {
        public let label: String
        public let isSelected: Bool

        public init(label: String, isSelected: Bool = false) {
            self.label = label
            self.isSelected = isSelected
        }

        public var id: String { self.label }
    }

    public let chips: [Chip]
    public let onTap: (Chip) -> Void

    @Environment(\.theme) private var theme

    public init(chips: [Chip], onTap: @escaping (Chip) -> Void = { _ in }) {
        self.chips = chips
        self.onTap = onTap
    }

    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: self.theme.spacing.sm) {
                ForEach(self.chips) { chip in
                    Button {
                        self.onTap(chip)
                    } label: {
                        Text(chip.label)
                            .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                            .fontWeight(.bold)
                            .foregroundStyle(self.chipForeground(chip))
                            .padding(.horizontal, self.theme.spacing.md)
                            .frame(minHeight: 44)
                            .background(self.chipBackground(chip))
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(self.chipBorder(chip), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(chip.label)
                    .accessibilityAddTraits(chip.isSelected ? [.isButton, .isSelected] : .isButton)
                }
            }
            .padding(.vertical, self.theme.spacing.xs)
        }
        .accessibilityElement(children: .contain)
    }

    private func chipForeground(_ chip: Chip) -> Color {
        chip.isSelected
            ? self.theme.color.primary.accent.color
            : self.theme.color.text.body.color
    }

    private func chipBackground(_ chip: Chip) -> Color {
        chip.isSelected
            ? self.theme.color.primary.accent.color.opacity(0.12)
            : self.theme.color.bg.surface.color
    }

    private func chipBorder(_ chip: Chip) -> Color {
        chip.isSelected
            ? self.theme.color.primary.accent.color.opacity(0.4)
            : self.theme.color.bg.border.color
    }
}

#Preview("Chip row") {
    FuelWellChipRow(
        chips: [
            .init(label: "High protein", isSelected: true),
            .init(label: "Low carb"),
            .init(label: "Low fat"),
            .init(label: "Vegan"),
            .init(label: "High fiber")
        ]
    )
    .padding()
    .background(Theme.app.color.bg.base.color)
}

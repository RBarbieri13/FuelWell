import Core
import DesignSystem
import Foundation
import SwiftUI

struct MealHistoryView: View {
    let entries: [MealEntry]
    let onRepeat: (MealEntry) -> Void
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundStyle(self.theme.color.primary.green.color)
                    .frame(width: 44, height: 44)
                    .background(self.theme.color.primary.green.color.opacity(0.14))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Meal History")
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDark.color)

                    Text(self.subtitle)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                }

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.onDark.color)
            }

            if self.entries.isEmpty {
                Text("Log a meal and it will appear here for quick repeats.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.onDarkMuted.color)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(self.theme.spacing.md)
                    .background(self.theme.color.text.onDark.color.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
            } else {
                ForEach(self.sections) { section in
                    MealHistorySectionView(section: section, onRepeat: self.onRepeat)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }

    private var subtitle: String {
        "\(self.entries.count) recent meals available to repeat"
    }

    private var sections: [MealHistorySection] {
        MealHistorySection.group(entries: self.entries)
    }
}

private struct MealHistorySectionView: View {
    let section: MealHistorySection
    let onRepeat: (MealEntry) -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.section.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.section.entries) { entry in
                    MealHistoryRow(entry: entry) {
                        self.onRepeat(entry)
                    }
                }
            }
        }
    }
}

private struct MealHistoryRow: View {
    let entry: MealEntry
    let onRepeat: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Image(systemName: self.entry.photoAttachmentID == nil ? "fork.knife" : "camera.fill")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.green.color)
                .frame(width: 38, height: 38)
                .background(self.theme.color.primary.green.color.opacity(0.14))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.entry.name)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.onDark.color)

                Text("\(self.entry.calories) calories - \(self.entry.protein)g protein")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.onDarkMuted.color)
            }

            Spacer()

            Button("Repeat", systemImage: "arrow.clockwise", action: self.onRepeat)
                .labelStyle(.iconOnly)
                .tint(self.theme.color.primary.green.color)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.text.onDark.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
    }
}

public struct MealHistorySection: Equatable, Identifiable {
    public let date: Date
    public let title: String
    public let entries: [MealEntry]

    public var id: Date { self.date }

    public static func group(entries: [MealEntry], calendar: Calendar = .current) -> [MealHistorySection] {
        let grouped = Dictionary(grouping: entries) { entry in
            calendar.startOfDay(for: entry.loggedAt)
        }

        return grouped.keys
            .sorted(by: >)
            .map { date in
                MealHistorySection(
                    date: date,
                    title: Self.title(for: date, calendar: calendar),
                    entries: (grouped[date] ?? []).sorted { $0.loggedAt > $1.loggedAt }
                )
            }
    }

    private static func title(for date: Date, calendar: Calendar) -> String {
        if calendar.isDateInToday(date) {
            return "Today"
        }

        if calendar.isDateInYesterday(date) {
            return "Yesterday"
        }

        return date.formatted(.dateTime.month(.abbreviated).day())
    }
}

import Foundation

public enum AppTab: String, CaseIterable, Equatable, Identifiable, Sendable {
    case home
    case meals
    case coach
    case exercise
    case progress

    public var id: Self { self }

    public var title: String {
        switch self {
        case .home:
            "Home"
        case .meals:
            "Meals"
        case .coach:
            "Coach"
        case .exercise:
            "Exercise"
        case .progress:
            "Progress"
        }
    }

    public var screenTitle: String {
        switch self {
        case .home:
            "Dashboard"
        case .meals:
            "Meals & Nutrition"
        case .coach:
            "Coach Chat"
        case .exercise:
            "Exercise & Activity"
        case .progress:
            "Progress"
        }
    }

    public var systemImage: String {
        switch self {
        case .home:
            "house.fill"
        case .meals:
            "fork.knife"
        case .coach:
            "bubble.left.and.bubble.right.fill"
        case .exercise:
            "figure.run"
        case .progress:
            "chart.line.uptrend.xyaxis"
        }
    }
}

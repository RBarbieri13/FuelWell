import SwiftUI

enum QualityIdentifier {
    static let dashboardHealthScore = "dashboard.health-score"
    static let dashboardInflowsOutflows = "dashboard.inflows-outflows"
    static let dashboardVerdict = "dashboard.verdict"
    static let menuButton = "nav.menu"
    static let helpButton = "nav.help"
    static let accountSubscription = "account.subscription"
    static let founding100Join = "account.founding100.join"
    static let feedbackMessage = "feedback.message"
    static let feedbackSubmit = "feedback.submit"
    static let feedbackSuccess = "feedback.success"
    static let addMealButton = "nutrition.add-meal"
    static let addMealSaveButton = "nutrition.add-meal.save"
    static let tabCoach = "tab.coach"
    static let tabExercise = "tab.exercise"
    static let tabMeals = "tab.meals"
    static let tabProgress = "tab.progress"
}

extension View {
    func qualityID(_ identifier: String) -> some View {
        self.accessibilityIdentifier(identifier)
    }
}

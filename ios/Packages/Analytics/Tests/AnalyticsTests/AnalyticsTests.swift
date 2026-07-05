import Analytics
import Testing

@Test
func analyticsEventsAreStronglyTyped() {
    let event = AnalyticsEvent.healthKitSynced(daysBack: 7)

    #expect(event.name == "healthkit_synced")
    #expect(event.properties["days_back"] == .int(7))
}

@Test
func analyticsTaxonomyUsesApprovedSnakeCaseNames() {
    let events = [
        AnalyticsEvent.appLaunched(source: "test"),
        AnalyticsEvent.coachRecommendationPresented(
            surface: "dashboard",
            recommendationID: "rec-1",
            category: "meal_timing"
        ),
        AnalyticsEvent.coachRecommendationFollowed(
            surface: "dashboard",
            recommendationID: "rec-1",
            elapsedSeconds: 120
        ),
        AnalyticsEvent.coachRecommendationDismissed(
            surface: "dashboard",
            recommendationID: "rec-1",
            reason: "not_now"
        ),
        AnalyticsEvent.feedbackStarted(route: "help"),
        AnalyticsEvent.feedbackSubmitted(route: "help", messageLength: 42),
        AnalyticsEvent.feedbackFailed(route: "help", reason: "offline"),
        AnalyticsEvent.healthKitSynced(daysBack: 7),
        AnalyticsEvent.nudgeDelivered(nudgeID: "nudge-1", category: "meal_timing", trigger: "missed_lunch"),
        AnalyticsEvent.nudgeOpened(nudgeID: "nudge-1", category: "meal_timing"),
        AnalyticsEvent.tabSelected("coach")
    ]
    let names = events.map(\.name)

    #expect(Set(names) == AnalyticsEvent.approvedEventNames)
    #expect(names.allSatisfy { $0.range(of: #"^[a-z0-9]+(_[a-z0-9]+)*$"#, options: .regularExpression) != nil })
}

@Test
func decisionEngagementEventsCarryDashboardDimensions() {
    let presented = AnalyticsEvent.coachRecommendationPresented(
        surface: "dashboard",
        recommendationID: "rec-123",
        category: "restaurant_guidance"
    )
    let followed = AnalyticsEvent.coachRecommendationFollowed(
        surface: "dashboard",
        recommendationID: "rec-123",
        elapsedSeconds: 45
    )
    let nudge = AnalyticsEvent.nudgeDelivered(
        nudgeID: "nudge-123",
        category: "restaurant_guidance",
        trigger: "eating_out_quick_action"
    )

    #expect(presented.properties["surface"] == .string("dashboard"))
    #expect(presented.properties["recommendation_id"] == .string("rec-123"))
    #expect(presented.properties["category"] == .string("restaurant_guidance"))
    #expect(followed.properties["elapsed_seconds"] == .int(45))
    #expect(nudge.properties["trigger"] == .string("eating_out_quick_action"))
}

@Test
func noopAnalyticsAcceptsEvents() async throws {
    try await AnalyticsClient.noop.identify("user-1", ["plan": .string("pilot")])
    try await AnalyticsClient.noop.track(.appLaunched(source: "test"))
}

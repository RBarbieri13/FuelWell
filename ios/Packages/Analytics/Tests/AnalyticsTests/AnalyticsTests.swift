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
        AnalyticsEvent.feedbackStarted(route: "help"),
        AnalyticsEvent.feedbackSubmitted(route: "help", messageLength: 42),
        AnalyticsEvent.feedbackFailed(route: "help", reason: "offline"),
        AnalyticsEvent.healthKitSynced(daysBack: 7),
        AnalyticsEvent.tabSelected("coach")
    ]
    let names = events.map(\.name)

    #expect(Set(names) == AnalyticsEvent.approvedEventNames)
    #expect(names.allSatisfy { $0.range(of: #"^[a-z0-9]+(_[a-z0-9]+)*$"#, options: .regularExpression) != nil })
}

@Test
func noopAnalyticsAcceptsEvents() async throws {
    try await AnalyticsClient.noop.identify("user-1", ["plan": .string("pilot")])
    try await AnalyticsClient.noop.track(.appLaunched(source: "test"))
}

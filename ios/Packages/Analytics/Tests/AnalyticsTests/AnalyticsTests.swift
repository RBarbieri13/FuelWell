import Analytics
import Testing

@Test
func analyticsEventsAreStronglyTyped() {
    let event = AnalyticsEvent.healthKitSynced(daysBack: 7)

    #expect(event.name == "healthkit_synced")
    #expect(event.properties["days_back"] == .int(7))
}

@Test
func noopAnalyticsAcceptsEvents() async throws {
    try await AnalyticsClient.noop.identify("user-1", ["plan": .string("pilot")])
    try await AnalyticsClient.noop.track(.appLaunched(source: "test"))
}

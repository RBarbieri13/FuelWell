import CrashReporting
import Testing

@Test
func noopCrashReporterAcceptsContext() async throws {
    let context = CrashContext(userID: "user-1", route: "splash")

    try await CrashReporter.noop.configure(context)
    try await CrashReporter.noop.capture("Preview issue", context)
}

@Test
func testCrashReporterFailsLoudly() async {
    await #expect(throws: CrashReportingError.unimplemented) {
        try await CrashReporter.testValue.capture("No capture", CrashContext())
    }
}

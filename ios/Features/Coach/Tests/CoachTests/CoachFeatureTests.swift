import AnthropicClient
import ComposableArchitecture
import Core
import Foundation
import HealthKitClient
import SupabaseClient
import Testing

@testable import Coach

// swiftlint:disable function_body_length
@MainActor
@Test
func sendStreamsCoachResponseWithLockedPromptAndContext() async throws {
    let date = Date(timeIntervalSince1970: 1_780_000_000)
    let userMessageID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000000"))
    let coachMessageID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    let meals = [
        MealEntry(
            name: "Turkey bowl",
            calories: 520,
            protein: 44,
            carbs: 52,
            fat: 16,
            loggedAt: date
        )
    ]
    let health = HealthSnapshot(
        steps: 7_200,
        activeEnergyKilocalories: 410,
        bodyMassKilograms: 82,
        fetchedAt: date
    )
    nonisolated(unsafe) var capturedRequest: AnthropicRequest?
    let store = TestStore(initialState: CoachFeature.State(messages: [])) {
        CoachFeature()
    } withDependencies: {
        $0.uuid = .incrementing
        $0.date.now = date
        $0.featureFlags = .constant([FeatureFlag(name: "coach_chat", enabled: true)])
        $0.nutritionRepository = InMemoryNutritionRepository(seed: meals)
        $0.healthKit = .stub(snapshot: health)
        $0.anthropicClient = AnthropicClient(
            complete: { _ in AnthropicResponse(text: "") },
            stream: { request in
                capturedRequest = request
                return AsyncThrowingStream { continuation in
                    continuation.yield(AnthropicStreamEvent(textDelta: "Start with protein. "))
                    continuation.yield(
                        AnthropicStreamEvent(
                            textDelta: "Keep dinner simple.",
                            requestID: "req_stream",
                            isComplete: true
                        )
                    )
                    continuation.finish()
                }
            }
        )
    }

    await store.send(.composerChanged("I blew my diet today.")) {
        $0.composerText = "I blew my diet today."
    }
    await store.send(.sendTapped) {
        $0.messages.append(
            CoachMessage(
                id: userMessageID,
                role: .user,
                text: "I blew my diet today."
            )
        )
        $0.composerText = ""
        $0.isStreaming = true
    }

    let expectedContext = CoachContextBuilder.build(
        recentMeals: meals,
        healthSnapshot: health,
        generatedAt: date
    )
    await store.receive(.contextBuilt(userText: "I blew my diet today.", context: expectedContext)) {
        $0.lastContext = expectedContext
        $0.messages.append(
            CoachMessage(
                id: coachMessageID,
                role: .coach,
                text: ""
            )
        )
    }
    await store.receive(
        .streamStarted(messageID: coachMessageID)
    )
    await store.receive(
        .streamDelta(
            messageID: coachMessageID,
            "Start with protein. "
        )
    ) {
        $0.messages[id: coachMessageID]?.text = "Start with protein. "
    }
    await store.receive(
        .streamDelta(
            messageID: coachMessageID,
            "Keep dinner simple."
        )
    ) {
        $0.messages[id: coachMessageID]?.text =
            "Start with protein. Keep dinner simple."
    }
    await store.receive(
        .streamFinished(
            messageID: coachMessageID,
            requestID: "req_stream"
        )
    ) {
        $0.messages[id: coachMessageID]?.requestID = "req_stream"
        $0.isStreaming = false
    }

    let request = try #require(capturedRequest)
    #expect(request.featureFlag == "coach_chat")
    #expect(request.prompt.contains(CoachPrompt.version))
    #expect(request.prompt.contains("Turkey bowl"))
    #expect(request.prompt.contains("7,200") == false)
    #expect(request.prompt.contains("7200"))
}
// swiftlint:enable function_body_length

@MainActor
@Test
func featureFlagOffShowsPausedBannerAndDoesNotCallStream() async throws {
    let userMessageID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000000"))
    nonisolated(unsafe) var streamCalled = false
    let store = TestStore(initialState: CoachFeature.State(messages: [])) {
        CoachFeature()
    } withDependencies: {
        $0.uuid = .incrementing
        $0.featureFlags = .constant([FeatureFlag(name: "coach_chat", enabled: false)])
        $0.anthropicClient = AnthropicClient(
            complete: { _ in AnthropicResponse(text: "") },
            stream: { _ in
                streamCalled = true
                return AsyncThrowingStream { $0.finish() }
            }
        )
    }

    await store.send(.composerChanged("What should dinner look like?")) {
        $0.composerText = "What should dinner look like?"
    }
    await store.send(.sendTapped) {
        $0.messages.append(
            CoachMessage(
                id: userMessageID,
                role: .user,
                text: "What should dinner look like?"
            )
        )
        $0.composerText = ""
        $0.isStreaming = true
    }
    await store.receive(.streamFailed(.featureDisabled)) {
        $0.isStreaming = false
        $0.banner = .featureDisabled
    }

    #expect(streamCalled == false)
}

@MainActor
@Test
func budgetExceededShowsBudgetBanner() async throws {
    let coachMessageID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000000"))
    let context = CoachContextBuilder.build(
        recentMeals: [],
        healthSnapshot: nil,
        generatedAt: Date(timeIntervalSince1970: 1_780_000_000)
    )
    let store = TestStore(initialState: CoachFeature.State(messages: [], isStreaming: true)) {
        CoachFeature()
    } withDependencies: {
        $0.uuid = .incrementing
        $0.anthropicClient = .failingStream(.budgetExceeded)
    }

    await store.send(.contextBuilt(userText: "Help me pick dinner.", context: context)) {
        $0.lastContext = context
        $0.messages.append(
            CoachMessage(
                id: coachMessageID,
                role: .coach,
                text: ""
            )
        )
    }
    await store.receive(
        .streamStarted(messageID: coachMessageID)
    )
    await store.receive(.streamFailed(.budgetExceeded)) {
        $0.isStreaming = false
        $0.banner = .budgetExceeded
        $0.messages = []
    }
}

@MainActor
@Test
func macroGapSchedulesVoiceCompliantLocalNudge() async {
    nonisolated(unsafe) var scheduledBody: String?
    let store = TestStore(initialState: CoachFeature.State()) {
        CoachFeature()
    } withDependencies: {
        $0.proactiveCoaching = ProactiveCoachingClient(
            requestAuthorization: { true },
            scheduleMacroGapNudge: {
                scheduledBody = $0
            }
        )
    }

    await store.send(.macroGapDetected)
    await store.receive(.notificationScheduled(.success)) {
        $0.banner = .nudgeScheduled
    }

    #expect(scheduledBody == "A protein-forward dinner keeps the day flexible.")
    #expect(containsForbiddenCoachLanguage(scheduledBody ?? "") == false)
}

@Test
func coachSystemPromptUsesNonJudgmentSafetyContract() {
    #expect(CoachPrompt.system.contains("non-judgmental"))
    #expect(CoachPrompt.system.contains("professional support"))
    #expect(containsForbiddenCoachLanguage(CoachPrompt.system) == false)
}

@Test
func coachContextRedactsEmailLikeMealNamesAndStaysBounded() {
    let context = CoachContextBuilder.build(
        recentMeals: [
            MealEntry(
                name: "Dinner from robert@example.com",
                calories: 700,
                protein: 52,
                carbs: 64,
                fat: 22
            )
        ],
        healthSnapshot: nil,
        generatedAt: Date(timeIntervalSince1970: 1_780_000_000)
    )

    #expect(context.summary.contains("robert@example.com") == false)
    #expect(context.summary.contains("[redacted]"))
    #expect(context.summary.count <= 1_400)
}

private func containsForbiddenCoachLanguage(_ text: String) -> Bool {
    let normalized = text.lowercased()
    return [
        "missed",
        "skipped",
        "went over",
        "blew it",
        "cheating",
        "failed"
    ].contains { normalized.contains($0) }
}

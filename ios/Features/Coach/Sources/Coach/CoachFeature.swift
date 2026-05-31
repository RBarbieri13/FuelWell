import AnthropicClient
import ComposableArchitecture
import Core
import Foundation
import HealthKitClient
import NutritionDomain
import SupabaseClient

@Reducer
public struct CoachFeature: Sendable {
    @Dependency(\.anthropicClient) private var anthropicClient
    @Dependency(\.date) private var date
    @Dependency(\.featureFlags) private var featureFlags
    @Dependency(\.healthKit) private var healthKit
    @Dependency(\.nutritionRepository) private var nutritionRepository
    @Dependency(\.proactiveCoaching) private var proactiveCoaching
    @Dependency(\.uuid) private var uuid

    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var messages: IdentifiedArrayOf<CoachMessage>
        public var composerText: String
        public var isStreaming: Bool
        public var banner: CoachBanner?
        public var lastContext: CoachContext?

        public init(
            messages: IdentifiedArrayOf<CoachMessage> = IdentifiedArray(uniqueElements: CoachMessage.seed),
            composerText: String = "",
            isStreaming: Bool = false,
            banner: CoachBanner? = nil,
            lastContext: CoachContext? = nil
        ) {
            self.messages = messages
            self.composerText = composerText
            self.isStreaming = isStreaming
            self.banner = banner
            self.lastContext = lastContext
        }
    }

    public enum Action: Equatable {
        case onAppear
        case composerChanged(String)
        case quickPromptTapped(CoachQuickPrompt)
        case sendTapped
        case contextBuilt(userText: String, context: CoachContext)
        case streamStarted(messageID: UUID)
        case streamDelta(messageID: UUID, String)
        case streamFinished(messageID: UUID, requestID: String?)
        case streamFailed(CoachBanner)
        case macroGapDetected
        case notificationScheduled(ProactiveScheduleResult)
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                return .none

            case let .composerChanged(text):
                state.composerText = String(text.prefix(600))
                return .none

            case let .quickPromptTapped(prompt):
                state.composerText = prompt.message
                return .send(.sendTapped)

            case .sendTapped:
                let trimmed = state.composerText.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !trimmed.isEmpty, !state.isStreaming else {
                    return .none
                }

                let userID = self.uuid()
                state.messages.append(CoachMessage(id: userID, role: .user, text: trimmed))
                state.composerText = ""
                state.isStreaming = true
                state.banner = nil

                return .run { send in
                    guard try await self.featureFlags.isEnabled("coach_chat") else {
                        await send(.streamFailed(.featureDisabled))
                        return
                    }

                    let meals = try await self.nutritionRepository.recentEntries(limit: 5)
                    let healthSnapshot = try? await self.healthKit.todaySnapshot()
                    let context = CoachContextBuilder.build(
                        recentMeals: meals,
                        healthSnapshot: healthSnapshot,
                        generatedAt: self.date.now
                    )
                    await send(.contextBuilt(userText: trimmed, context: context))
                } catch: { error, send in
                    await send(.streamFailed(Self.banner(for: error)))
                }

            case let .contextBuilt(userText, context):
                state.lastContext = context
                let messageID = self.uuid()
                state.messages.append(CoachMessage(id: messageID, role: .coach, text: ""))

                let prompt = CoachPrompt.prompt(userMessage: userText, context: context)
                return .run { send in
                    await send(.streamStarted(messageID: messageID))
                    var requestID: String?
                    for try await event in self.anthropicClient.stream(
                        AnthropicRequest(
                            prompt: prompt,
                            model: CoachPrompt.defaultModel,
                            maxTokens: CoachPrompt.maxTokens,
                            featureFlag: "coach_chat"
                        )
                    ) {
                        if !event.textDelta.isEmpty {
                            await send(.streamDelta(messageID: messageID, event.textDelta))
                        }
                        requestID = event.requestID ?? requestID
                        if event.isComplete {
                            await send(.streamFinished(messageID: messageID, requestID: requestID))
                            return
                        }
                    }
                    await send(.streamFinished(messageID: messageID, requestID: requestID))
                } catch: { error, send in
                    await send(.streamFailed(Self.banner(for: error)))
                }

            case .streamStarted:
                return .none

            case let .streamDelta(messageID, delta):
                state.messages[id: messageID]?.text += delta
                return .none

            case let .streamFinished(messageID, requestID):
                state.messages[id: messageID]?.requestID = requestID
                state.isStreaming = false
                return .none

            case let .streamFailed(banner):
                state.isStreaming = false
                state.banner = banner
                if let lastMessage = state.messages.last,
                   lastMessage.role == .coach,
                   lastMessage.text.isEmpty {
                    state.messages.remove(id: lastMessage.id)
                }
                return .none

            case .macroGapDetected:
                let message = "A protein-forward dinner keeps the day flexible."
                return .run { send in
                    let isAuthorized = try await self.proactiveCoaching.requestAuthorization()
                    guard isAuthorized else {
                        await send(.notificationScheduled(.failure(.authorizationDenied)))
                        return
                    }
                    try await self.proactiveCoaching.scheduleMacroGapNudge(message)
                    await send(.notificationScheduled(.success))
                } catch: { error, send in
                    await send(
                        .notificationScheduled(
                            .failure((error as? ProactiveCoachingError) ?? .unimplemented)
                        )
                    )
                }

            case .notificationScheduled(.success):
                state.banner = .nudgeScheduled
                return .none

            case .notificationScheduled(.failure):
                state.banner = .offline
                return .none
            }
        }
    }

    private static func banner(for error: any Error) -> CoachBanner {
        if let error = error as? AnthropicClientError {
            switch error {
            case .featureDisabled:
                return .featureDisabled
            case .budgetExceeded:
                return .budgetExceeded
            case .missingConfiguration:
                return .offline
            case .invalidResponse, .transport, .unimplemented:
                return .offline
            }
        }

        return .offline
    }
}

public enum ProactiveScheduleResult: Equatable, Sendable {
    case success
    case failure(ProactiveCoachingError)
}

public struct CoachMessage: Equatable, Identifiable, Sendable {
    public enum Role: Equatable, Sendable {
        case coach
        case user
    }

    public var id: UUID
    public var role: Role
    public var text: String
    public var requestID: String?

    public init(id: UUID = UUID(), role: Role, text: String, requestID: String? = nil) {
        self.id = id
        self.role = role
        self.text = text
        self.requestID = requestID
    }

    public static let seed: [CoachMessage] = [
        CoachMessage(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11)),
            role: .coach,
            text: "Tell me what decision is in front of you. I will keep it practical."
        )
    ]
}

public enum CoachBanner: Equatable, Sendable {
    case featureDisabled
    case budgetExceeded
    case offline
    case nudgeScheduled

    public var title: String {
        switch self {
        case .featureDisabled:
            "Coach is paused"
        case .budgetExceeded:
            "Coach budget reached"
        case .offline:
            "Coach is waiting on the live service"
        case .nudgeScheduled:
            "Nudge scheduled"
        }
    }

    public var detail: String {
        switch self {
        case .featureDisabled:
            "The coach kill switch is off. Meal logging and plans still work."
        case .budgetExceeded:
            "The monthly safety cap is doing its job. Try again after the budget resets."
        case .offline:
            "Keep the question here. FuelWell will answer when the coach service is available."
        case .nudgeScheduled:
            "FuelWell will follow up with one calm next step."
        }
    }
}

public enum CoachQuickPrompt: String, CaseIterable, Equatable, Identifiable, Sendable {
    case adjustDay
    case restaurantOrder
    case explainToday

    public var id: String { self.rawValue }

    public var title: String {
        switch self {
        case .adjustDay:
            "Adjust my day"
        case .restaurantOrder:
            "What should I order?"
        case .explainToday:
            "Explain today"
        }
    }

    public var message: String {
        switch self {
        case .adjustDay:
            "Help me adjust the rest of today based on what I have logged."
        case .restaurantOrder:
            "I am eating out. What is the easiest order that keeps dinner flexible?"
        case .explainToday:
            "Give me a short recap of today and one next action."
        }
    }
}

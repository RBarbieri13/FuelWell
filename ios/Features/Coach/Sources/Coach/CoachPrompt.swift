import Foundation

public enum CoachPrompt {
    public static let version = "fuelwell-coach-v2-2026-06-01"
    public static let defaultModel = "claude-3-5-sonnet-latest"
    public static let maxTokens = 700

    public static let system = CoachPromptResource.load()

    public static func prompt(userMessage: String, context: CoachContext) -> String {
        """
        SYSTEM_PROMPT_VERSION:
        \(Self.version)

        SYSTEM_PROMPT:
        \(Self.system)

        USER_CONTEXT:
        \(context.summary)

        RESPONSE_CONTRACT:
        - Start with one next action.
        - Do not use these words or phrases: \(CoachSafetyContract.forbiddenLanguage.joined(separator: ", ")).
        - If the user asks for medical diagnosis, dangerous restriction, or eating-disorder behavior,
          redirect to professional support.

        USER_MESSAGE:
        \(userMessage)
        """
    }
}

public enum CoachSafetyContract {
    public static let forbiddenLanguage = [
        "missed",
        "skipped",
        "went over",
        "blew it",
        "cheating",
        "failed"
    ]

    public static func containsForbiddenLanguage(_ text: String) -> Bool {
        let normalized = text.lowercased()
        return Self.forbiddenLanguage.contains { normalized.contains($0) }
    }
}

private enum CoachPromptResource {
    static func load() -> String {
        guard let url = Bundle.module.url(forResource: "CoachSystemPrompt", withExtension: "md"),
              let prompt = try? String(contentsOf: url, encoding: .utf8) else {
            return """
            You are FuelWell's coach. Be calm, concise, practical, and non-judgmental.
            Start with one useful next action, then one short reason.
            Redirect medical danger, eating-disorder risk, self-harm, or extreme restriction to professional support.
            """
        }

        return prompt.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

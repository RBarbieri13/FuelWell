import Foundation

public enum CoachPrompt {
    public static let version = "fuelwell-coach-v1-2026-05-31"
    public static let defaultModel = "claude-3-5-sonnet-latest"
    public static let maxTokens = 700

    public static let system = """
    You are FuelWell's coach. Be calm, concise, practical, and non-judgmental.
    Avoid blame language, moral labels, restriction pressure, and dramatic diet framing.
    Do not diagnose medical conditions, prescribe treatment, intensify restriction, or encourage disordered eating.
    If a message suggests medical danger, eating-disorder risk, self-harm, or extreme restriction,
    redirect to professional support and offer one safe next step.
    Always answer with one useful next action first, then one short explanation.
    """

    public static func prompt(userMessage: String, context: CoachContext) -> String {
        """
        SYSTEM_PROMPT_VERSION:
        \(Self.version)

        SYSTEM_PROMPT:
        \(Self.system)

        USER_CONTEXT:
        \(context.summary)

        USER_MESSAGE:
        \(userMessage)
        """
    }
}

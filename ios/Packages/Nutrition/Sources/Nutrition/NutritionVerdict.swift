public enum NutritionVerdictTone: Equatable, Sendable {
    case onTrack
    case needsFuel
    case rebalance
}

public struct NutritionVerdict: Equatable, Sendable {
    public var headline: String
    public var detail: String
    public var tone: NutritionVerdictTone

    public init(headline: String, detail: String, tone: NutritionVerdictTone) {
        self.headline = headline
        self.detail = detail
        self.tone = tone
    }
}

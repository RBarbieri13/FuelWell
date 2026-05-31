import { describe, expect, it } from "vitest";
import {
  buildAnthropicMessageParams,
  buildCoachUsageRecord,
  coachUsageCapsFromEnv,
  decideCoachUsage,
  estimateCoachUsageUsd,
  isValidCoachProxySecret,
  parseCoachProxyRequest,
} from "./coach-proxy";

describe("coach proxy contract helpers", () => {
  it("parses the Swift client request shape", () => {
    const request = parseCoachProxyRequest({
      prompt: "Return the word ready.",
      model: "claude-3-5-sonnet-latest",
      maxTokens: 16,
      feature_flag: "coach_chat",
    });

    expect(request.feature_flag).toBe("coach_chat");
    expect(buildAnthropicMessageParams(request)).toMatchObject({
      max_tokens: 16,
      messages: [{ role: "user", content: "Return the word ready." }],
      model: "claude-3-5-sonnet-latest",
    });
  });

  it("rejects malformed requests before they reach Anthropic", () => {
    expect(() =>
      parseCoachProxyRequest({
        prompt: "",
        model: "claude-3-5-sonnet-latest",
        maxTokens: 16,
        feature_flag: "coach_chat",
      }),
    ).toThrow();
  });

  it("validates the proxy secret with an exact timing-safe match", () => {
    expect(isValidCoachProxySecret("secret", "secret")).toBe(true);
    expect(isValidCoachProxySecret("secret", "different")).toBe(false);
    expect(isValidCoachProxySecret(null, "secret")).toBe(false);
  });

  it("loads cost caps with the locked five and ten dollar defaults", () => {
    const caps = coachUsageCapsFromEnv({});

    expect(caps.userMonthlySoftUsd).toBe(5);
    expect(caps.userMonthlyKillUsd).toBe(10);
  });

  it("blocks requests that exceed token, spend, or request-rate caps", () => {
    const caps = {
      userDailyTokens: 100,
      globalDailyUsd: 1,
      userMonthlySoftUsd: 5,
      userMonthlyKillUsd: 10,
      requestsPerMinute: 2,
    };

    expect(
      decideCoachUsage(
        { userDay: { inputTokens: 80, outputTokens: 20, estimatedCostUsd: 0.1 } },
        caps,
      ),
    ).toMatchObject({ allowed: false, reason: "user_daily_token_cap" });

    expect(
      decideCoachUsage(
        { globalDay: { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 1 } },
        caps,
      ),
    ).toMatchObject({ allowed: false, reason: "global_daily_spend_cap" });

    expect(decideCoachUsage({ recentRequestCount: 2 }, caps)).toMatchObject({
      allowed: false,
      reason: "rate_limited",
    });
  });

  it("builds usage records without storing prompt text", () => {
    const record = buildCoachUsageRecord({
      requestID: "msg_123",
      userID: "user-123",
      featureFlag: "coach_chat",
      model: "claude-3-5-sonnet-latest",
      usage: { inputTokens: 100, outputTokens: 50 },
      status: "success",
      now: new Date("2026-05-31T00:00:00.000Z"),
    });

    expect(record).toEqual({
      request_id: "msg_123",
      user_id: "user-123",
      feature_flag: "coach_chat",
      model: "claude-3-5-sonnet-latest",
      input_tokens: 100,
      output_tokens: 50,
      estimated_cost_usd: estimateCoachUsageUsd(
        { inputTokens: 100, outputTokens: 50 },
        "claude-3-5-sonnet-latest",
      ),
      status: "success",
      created_at: "2026-05-31T00:00:00.000Z",
    });
    expect(Object.keys(record)).not.toContain("prompt");
  });
});

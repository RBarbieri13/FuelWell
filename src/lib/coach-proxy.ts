import { timingSafeEqual, randomUUID } from "crypto";
import type {
  ContentBlock,
  Message,
  MessageCreateParamsNonStreaming,
} from "@anthropic-ai/sdk/resources/messages/messages";
import { z } from "zod";

export const coachProxyRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(12_000),
  model: z.string().trim().min(1).max(128),
  maxTokens: z.number().int().min(1).max(4_096),
  feature_flag: z.string().trim().min(1).max(128),
});

export type CoachProxyRequest = z.infer<typeof coachProxyRequestSchema>;

export type CoachUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type CoachUsageCaps = {
  userDailyTokens: number;
  globalDailyUsd: number;
  userMonthlySoftUsd: number;
  userMonthlyKillUsd: number;
  requestsPerMinute: number;
};

export type CoachUsageTotals = {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
};

export type CoachUsageDecision =
  | { allowed: true }
  | {
      allowed: false;
      status: 429;
      reason:
        | "user_daily_token_cap"
        | "global_daily_spend_cap"
        | "user_monthly_kill_cap"
        | "rate_limited";
    };

export type CoachUsageRecord = {
  request_id: string;
  user_id: string | null;
  feature_flag: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  status: "success" | "failed" | "blocked";
  created_at: string;
};

const defaultCaps: CoachUsageCaps = {
  userDailyTokens: 20_000,
  globalDailyUsd: 25,
  userMonthlySoftUsd: 5,
  userMonthlyKillUsd: 10,
  requestsPerMinute: 12,
};

const modelPricingPerMillionTokens: Record<
  string,
  { inputUsd: number; outputUsd: number }
> = {
  "claude-3-5-sonnet-latest": { inputUsd: 3, outputUsd: 15 },
  "claude-3-5-haiku-latest": { inputUsd: 0.8, outputUsd: 4 },
};

export function parseCoachProxyRequest(body: unknown): CoachProxyRequest {
  return coachProxyRequestSchema.parse(body);
}

export function isValidCoachProxySecret(
  receivedSecret: string | null,
  expectedSecret = process.env.FUELWELL_COACH_PROXY_SECRET,
): boolean {
  if (!receivedSecret || !expectedSecret) return false;

  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

export function coachUsageCapsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CoachUsageCaps {
  return {
    userDailyTokens: readNumber(env.FUELWELL_COACH_USER_DAILY_TOKENS, defaultCaps.userDailyTokens),
    globalDailyUsd: readNumber(env.FUELWELL_COACH_GLOBAL_DAILY_USD, defaultCaps.globalDailyUsd),
    userMonthlySoftUsd: readNumber(
      env.FUELWELL_COACH_USER_MONTHLY_SOFT_USD,
      defaultCaps.userMonthlySoftUsd,
    ),
    userMonthlyKillUsd: readNumber(
      env.FUELWELL_COACH_USER_MONTHLY_KILL_USD,
      defaultCaps.userMonthlyKillUsd,
    ),
    requestsPerMinute: readNumber(
      env.FUELWELL_COACH_REQUESTS_PER_MINUTE,
      defaultCaps.requestsPerMinute,
    ),
  };
}

export function buildAnthropicMessageParams(
  request: CoachProxyRequest,
): MessageCreateParamsNonStreaming {
  return {
    model: request.model as MessageCreateParamsNonStreaming["model"],
    max_tokens: request.maxTokens,
    messages: [{ role: "user", content: request.prompt }],
  };
}

export function textFromAnthropicMessage(message: Message): string {
  return message.content
    .map((block) => textFromContentBlock(block))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export function estimateCoachUsageUsd(
  usage: CoachUsage,
  model: string,
): number {
  const pricing =
    modelPricingPerMillionTokens[model] ??
    modelPricingPerMillionTokens["claude-3-5-sonnet-latest"];

  return roundUsd(
    (usage.inputTokens / 1_000_000) * pricing.inputUsd +
      (usage.outputTokens / 1_000_000) * pricing.outputUsd,
  );
}

export function decideCoachUsage(
  totals: {
    userDay?: CoachUsageTotals;
    userMonth?: CoachUsageTotals;
    globalDay?: CoachUsageTotals;
    recentRequestCount?: number;
  },
  caps: CoachUsageCaps,
): CoachUsageDecision {
  if ((totals.recentRequestCount ?? 0) >= caps.requestsPerMinute) {
    return { allowed: false, status: 429, reason: "rate_limited" };
  }

  const userDayTokens =
    (totals.userDay?.inputTokens ?? 0) + (totals.userDay?.outputTokens ?? 0);
  if (userDayTokens >= caps.userDailyTokens) {
    return { allowed: false, status: 429, reason: "user_daily_token_cap" };
  }

  if ((totals.globalDay?.estimatedCostUsd ?? 0) >= caps.globalDailyUsd) {
    return { allowed: false, status: 429, reason: "global_daily_spend_cap" };
  }

  if ((totals.userMonth?.estimatedCostUsd ?? 0) >= caps.userMonthlyKillUsd) {
    return { allowed: false, status: 429, reason: "user_monthly_kill_cap" };
  }

  return { allowed: true };
}

export function buildCoachUsageRecord(params: {
  requestID?: string;
  userID: string | null;
  featureFlag: string;
  model: string;
  usage?: CoachUsage;
  status: CoachUsageRecord["status"];
  now?: Date;
}): CoachUsageRecord {
  const usage = params.usage ?? { inputTokens: 0, outputTokens: 0 };
  return {
    request_id: params.requestID ?? randomUUID(),
    user_id: params.userID,
    feature_flag: params.featureFlag,
    model: params.model,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    estimated_cost_usd: estimateCoachUsageUsd(usage, params.model),
    status: params.status,
    created_at: (params.now ?? new Date()).toISOString(),
  };
}

export function coachUserIDFromHeaders(headers: Headers): string | null {
  const explicitUser = headers.get("x-fuelwell-user-id")?.trim();
  if (explicitUser) return explicitUser;

  return null;
}

function textFromContentBlock(block: ContentBlock): string {
  if (block.type === "text") return block.text;
  return "";
}

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

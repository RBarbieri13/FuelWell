import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  buildAnthropicMessageParams,
  buildCoachUsageRecord,
  coachUsageCapsFromEnv,
  coachUserIDFromHeaders,
  decideCoachUsage,
  encodeCoachStreamEvent,
  isValidCoachProxySecret,
  parseCoachProxyRequest,
  textFromAnthropicMessage,
  type CoachUsageTotals,
} from "@/lib/coach-proxy";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type CoachUsageWindow = "day" | "month";

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not configured.");
    return NextResponse.json(
      { error: "Coach proxy is not configured." },
      { status: 500 },
    );
  }

  if (!process.env.FUELWELL_COACH_PROXY_SECRET) {
    console.error("FUELWELL_COACH_PROXY_SECRET is not configured.");
    return NextResponse.json(
      { error: "Coach proxy is not configured." },
      { status: 500 },
    );
  }

  if (
    !isValidCoachProxySecret(
      request.headers.get("x-fuelwell-coach-secret"),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let coachRequest;
  try {
    coachRequest = parseCoachProxyRequest(rawBody);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid coach proxy payload.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    throw error;
  }

  const supabase = getSupabaseAdmin();
  const featureGate = await isFeatureEnabled(coachRequest.feature_flag);
  if (!featureGate.ok) {
    return NextResponse.json(
      { error: featureGate.error },
      { status: featureGate.status },
    );
  }

  if (!featureGate.enabled) {
    return NextResponse.json(
      {
        error: "Feature disabled.",
        feature_flag: coachRequest.feature_flag,
      },
      { status: 403 },
    );
  }

  const userID = coachUserIDFromHeaders(request.headers);
  if (!userID) {
    return NextResponse.json(
      { error: "Missing or unstable user ID." },
      { status: 401 },
    );
  }

  const caps = coachUsageCapsFromEnv();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const acceptsStream =
    request.headers.get("accept")?.includes("text/event-stream") === true;

  return withCoachUsageLock(async () => {
    let usageTotals;
    try {
      usageTotals = await readUsageState(userID);
    } catch {
      return NextResponse.json(
        { error: "Coach usage state could not be read." },
        { status: 502 },
      );
    }

    const usageDecision = decideCoachUsage(
      usageTotals,
      caps,
    );

    if (!usageDecision.allowed) {
      await recordUsage(
        buildCoachUsageRecord({
          userID,
          featureFlag: coachRequest.feature_flag,
          model: coachRequest.model,
          status: "blocked",
        }),
      );

      return NextResponse.json(
        { error: "Coach usage cap reached.", reason: usageDecision.reason },
        { status: usageDecision.status },
      );
    }

    try {
      const message = await anthropic.messages.create(
        buildAnthropicMessageParams(coachRequest),
      );
      const text = textFromAnthropicMessage(message);
      const requestID = message.id;

      await recordUsage(
        buildCoachUsageRecord({
          requestID,
          userID,
          featureFlag: coachRequest.feature_flag,
          model: coachRequest.model,
          usage: {
            inputTokens: message.usage.input_tokens,
            outputTokens: message.usage.output_tokens,
          },
          status: "success",
        }),
      );

      if (acceptsStream) {
        const encoder = new TextEncoder();
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(
                  encodeCoachStreamEvent({
                    textDelta: text,
                    requestID,
                    isComplete: false,
                  }),
                ),
              );
              controller.enqueue(
                encoder.encode(
                  encodeCoachStreamEvent({
                    textDelta: "",
                    requestID,
                    isComplete: true,
                  }),
                ),
              );
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            },
          }),
          {
            headers: {
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
              "Content-Type": "text/event-stream; charset=utf-8",
            },
          },
        );
      }

      return NextResponse.json({ text, request_id: requestID });
    } catch (error) {
      console.error("Anthropic coach proxy error:", error);
      await recordUsage(
        buildCoachUsageRecord({
          userID,
          featureFlag: coachRequest.feature_flag,
          model: coachRequest.model,
          status: "failed",
        }),
      );

      return NextResponse.json(
        { error: "Coach proxy request failed." },
        { status: 502 },
      );
    }
  });

  async function isFeatureEnabled(featureFlag: string): Promise<
    | { ok: true; enabled: boolean }
    | { ok: false; status: 502; error: string }
  > {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("name", featureFlag)
      .maybeSingle();

    if (error) {
      console.error("Supabase feature flag read failed:", error);
      return {
        ok: false,
        status: 502,
        error: "Feature flag state could not be read.",
      };
    }

    return { ok: true, enabled: data?.enabled === true };
  }

  async function readUsageTotals(
    window: CoachUsageWindow,
    targetUserID: string | null,
  ): Promise<CoachUsageTotals> {
    const since = windowStart(window).toISOString();
    let query = supabase
      .from("coach_usage")
      .select("input_tokens,output_tokens,estimated_cost_usd")
      .eq("status", "success")
      .gte("created_at", since);

    if (targetUserID) {
      query = query.eq("user_id", targetUserID);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase coach usage read failed:", error);
      throw new Error("Coach usage state could not be read.");
    }

    return (data ?? []).reduce<CoachUsageTotals>(
      (totals, row) => ({
        inputTokens: totals.inputTokens + numberValue(row.input_tokens),
        outputTokens: totals.outputTokens + numberValue(row.output_tokens),
        estimatedCostUsd:
          totals.estimatedCostUsd + numberValue(row.estimated_cost_usd),
      }),
      { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 },
    );
  }

  async function readRecentRequestCount(targetUserID: string) {
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count, error } = await supabase
      .from("coach_usage")
      .select("request_id", { count: "exact", head: true })
      .eq("user_id", targetUserID)
      .gte("created_at", since);

    if (error) {
      console.error("Supabase coach usage rate-limit read failed:", error);
      throw new Error("Coach usage state could not be read.");
    }

    return count ?? 0;
  }

  async function readUsageState(targetUserID: string) {
    const [userDay, userMonth, globalDay, recentRequestCount] = await Promise.all([
      readUsageTotals("day", targetUserID),
      readUsageTotals("month", targetUserID),
      readUsageTotals("day", null),
      readRecentRequestCount(targetUserID),
    ]);

    return { userDay, userMonth, globalDay, recentRequestCount };
  }

  async function recordUsage(record: Record<string, unknown>) {
    const { error } = await supabase.from("coach_usage").insert(record);
    if (error) {
      console.error("Supabase coach usage write failed:", error);
    }
  }
}

const coachUsageLocks = new Map<string, Promise<unknown>>();

async function withCoachUsageLock<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const lockKey = "coach:usage:global";
  const previous = coachUsageLocks.get(lockKey) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = previous.then(() => current);
  coachUsageLocks.set(lockKey, chained);

  await previous.catch(() => undefined);
  try {
    return await operation();
  } finally {
    release();
    if (coachUsageLocks.get(lockKey) === chained) {
      coachUsageLocks.delete(lockKey);
    }
  }
}

function windowStart(window: CoachUsageWindow): Date {
  const now = new Date();
  if (window === "month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function numberValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

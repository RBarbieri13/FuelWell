import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { headers } from "next/headers";
import { hasSupabaseConfig, isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import { loadServerDailyGoalContext } from "@/lib/server-goal-context";
import { buildSystemPrompt } from "@/lib/coach/system-prompt";
import {
  buildCoachKnowledgeBase,
  formatKnowledgeForPrompt,
  mergeCoachKnowledge,
  retrieveCoachKnowledge,
} from "@/lib/coach/knowledge";
import {
  costUsdCents,
  evaluateBudget,
  evaluatePaidProviderAccess,
  memoryAddCents,
  memoryGetDayCents,
} from "@/lib/coach/cost";
import {
  classifyProviderError,
  createSanitizedProviderIncident,
  getProviderHealth,
  markProviderSuccess,
  providerErrorStatus,
  recordProviderIncident,
  type ProviderFailureClass,
} from "@/lib/coach/provider-health";
import {
  createCoachProviderClient,
  providerModelCandidates,
  resolveCoachProviderConfig,
} from "@/lib/coach/provider-client";
import { getTool, toAnthropicTools } from "@/lib/coach/registry";
import "@/lib/coach/tools";
import type {
  ArtifactSpec,
  CoachAttachment,
  CoachDaySnapshot,
  CoachMutation,
  CoachSseEvent,
  CoachTurnMessage,
  CoachTurnRequest,
  ToolContext,
} from "@/lib/coach/types";
import { applySnapshotMutation } from "@/lib/coach/apply-mutation";
import { parseDirectMealLog } from "@/lib/coach/direct-meal-log";
import { parseDirectWorkoutLog } from "@/lib/coach/direct-workout-log";
import { enforceVoice, redactPii } from "@/lib/coach/voice-filter";
import { writeAudit } from "@/lib/coach/audit";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import {
  issueCoachConfirmationToken,
  verifyCoachConfirmationToken,
} from "@/lib/coach/confirmation";
import {
  ensureConversation,
  getSupabaseDayCents,
  insertSupabaseAudit,
  insertSupabaseUsage,
  loadCoachKnowledge,
  mergeProfilePreferences,
  persistCoachKnowledge,
  persistCoachMutations,
  saveCoachUploadedArtifacts,
  saveMessages,
} from "@/lib/coach/persistence";

export const maxDuration = 120;

/**
 * Model routing: haiku for default turns (fast/cheap). Sonnet when the turn
 * is "complex": long user message (>500 chars), long conversation (>16
 * messages), or a multi-step planning ask. Override with COACH_MODEL env var
 * (useful for evals); set COACH_MODEL=claude-sonnet-4-6 to force the larger
 * model everywhere.
 */
const HAIKU = "claude-haiku-4-5";
const SONNET = "claude-sonnet-4-6";
const MAX_TOOL_ROUNDS = 5; // E5: per-turn tool-call circuit breaker
const WEB_SEARCH_REQUEST =
  /\b(current|latest|today|recent|new|news|online|web|internet|search|look up|lookup|source|sources|cite|citation|price|available|availability|menu near|near me)\b/i;

function pickModel(req: CoachTurnRequest): string {
  if (process.env.COACH_MODEL) return process.env.COACH_MODEL;
  const last = req.messages[req.messages.length - 1]?.content ?? "";
  const hasAttachments = req.messages.some((m) => (m.attachments?.length ?? 0) > 0);
  if (hasAttachments) return SONNET;
  if (WEB_SEARCH_REQUEST.test(last)) return SONNET;
  const planning = /\bplan\b|\bweek\b|meal plan|recover my day|strategy/i.test(last);
  if (last.length > 500 || req.messages.length > 16 || planning) return SONNET;
  return HAIKU;
}

function envFlag(value: string | undefined): boolean | null {
  if (!value) return null;
  if (/^(1|true|yes|on)$/i.test(value)) return true;
  if (/^(0|false|no|off)$/i.test(value)) return false;
  return null;
}

function shouldOfferWebSearch(text: string): boolean {
  const explicit = envFlag(process.env.COACH_ENABLE_WEB_SEARCH);
  if (explicit !== null) return explicit;
  return WEB_SEARCH_REQUEST.test(text);
}

function toCoachAnthropicTools(includeWebSearch: boolean): Anthropic.ToolUnion[] {
  const tools = toAnthropicTools() as Anthropic.ToolUnion[];
  if (!includeWebSearch) return tools;
  return [
    ...tools,
    {
      name: "web_search",
      type: "web_search_20250305",
      max_uses: 3,
    },
  ];
}

function isWebSearchUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /web_search|server tool|tool/i.test(message) && /unavailable|not enabled|unsupported|invalid|permission|beta/i.test(message);
}

function buildProviderFallbackReply(userText: string, snapshot: CoachDaySnapshot): string {
  const name = snapshot.profile.displayName?.trim();
  const proteinLeft = Math.max(0, snapshot.targets.protein - snapshot.totals.protein);
  const caloriesLeft = Math.max(0, snapshot.targets.calories - snapshot.totals.calories);
  const lower = userText.toLowerCase();

  if (/\bprotein\b|\bmeal\b|\beat\b|\brecipe\b|\bdinner\b|\blunch\b|\bbreakfast\b/.test(lower)) {
    return [
      `${name ? `${name}, ` : ""}the live AI provider is temporarily unavailable, but I can still make the next FuelWell decision from your current day.`,
      "",
      `You have about ${caloriesLeft.toLocaleString()} calories and ${proteinLeft}g protein left against today’s targets.`,
      "",
      "A strong protein meal would be:",
      "- Grilled chicken or salmon bowl",
      "- Rice or sweet potato if you still need carbs",
      "- A large serving of greens",
      "- Greek yogurt or cottage cheese if you need more protein without much prep",
      "",
      "For a quick target, aim for 35-50g protein and keep the meal simple enough that you will actually log it.",
    ].join("\n");
  }

  if (/\bworkout\b|\bexercise\b|\bmove\b|\brun\b|\bwalk\b|\blift\b/.test(lower)) {
    return [
      "The live AI provider is temporarily unavailable, but FuelWell can still make a practical movement call.",
      "",
      "Choose the lowest-friction option that you can complete today:",
      "- 20-30 minutes walking for recovery and consistency",
      "- Zone 2 bike or jog if you feel fresh",
      "- A short full-body strength session if you have not lifted recently",
      "",
      "Log the minutes and intensity afterward so today’s activity and nutrition review stay aligned.",
    ].join("\n");
  }

  return [
    "The live AI provider is temporarily unavailable, so I’m using FuelWell’s local fallback instead of showing you a raw provider error.",
    "",
    `Today: ${snapshot.totals.calories.toLocaleString()} calories logged, ${snapshot.totals.protein}g protein logged, ${caloriesLeft.toLocaleString()} calories left, and ${proteinLeft}g protein left.`,
    "",
    "You can still log meals, review macros, and make a next clean choice. Try asking for a meal, workout, grocery, or daily review action.",
  ].join("\n");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function summarizeConfirmedTool(toolName: string, modelResult: unknown, input: unknown): string {
  const result = asRecord(modelResult);
  const args = asRecord(input);

  switch (toolName) {
    case "add_grocery_item": {
      const normalized = normalizeGroceryInput(
        String(result.name ?? args.name ?? "item"),
        String(result.quantity ?? args.quantity ?? "")
      );
      const quantity = normalized.quantity ? `${normalized.quantity} ` : "";
      return `Done. I added ${quantity}${normalized.name} to your grocery list.`;
    }
    case "check_grocery_item": {
      const normalized = normalizeGroceryInput(String(result.name ?? args.item ?? "that item"));
      const checked = result.checked === false ? "marked as still needed" : "marked as bought";
      return `${normalized.name} ${checked}.`;
    }
    case "add_recipe_to_grocery_list":
      return "Done. I added the recipe ingredients to your grocery list.";
    case "delete_meal": {
      const deleted = asRecord(result.deleted);
      return `Done. I deleted ${String(deleted.name ?? "that meal")} from today's log.`;
    }
    case "log_recipe_as_meal": {
      const name = result.name ?? "that recipe";
      const slot = result.slot ?? args.meal_slot;
      return `Done. I logged ${String(name)}${slot ? ` as ${String(slot)}` : ""} and updated today's totals.`;
    }
    case "start_workout_session":
      return "Workout started. I opened the active workout context so you can track sets as you go.";
    case "log_workout": {
      const name = result.name ?? args.name;
      return `Done. I logged ${String(name ?? "that workout")} and updated today's activity.`;
    }
    case "delete_workout": {
      const deleted = asRecord(result.deleted);
      return `Done. I removed ${String(deleted.name ?? "that workout")} from today's log.`;
    }
    case "log_custom_meal":
      return "Done. I logged that meal and updated today's nutrition totals.";
    default:
      return "Done. I updated FuelWell with that action.";
  }
}

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().max(160),
  mediaType: z.string().max(120),
  size: z.number().int().min(0).max(12 * 1024 * 1024),
  kind: z.enum(["image", "pdf", "text"]),
  data: z.string().max(16 * 1024 * 1024).optional(),
  text: z.string().max(80_000).optional(),
});

const requestSchema = z.object({
  conversationId: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
        attachments: z.array(attachmentSchema).max(5).optional(),
      })
    )
    .min(1)
    .max(60),
  snapshot: z.record(z.string(), z.unknown()),
  confirmedTool: z
    .object({ name: z.string(), input: z.unknown(), token: z.string().optional() })
    .optional(),
});

function sse(event: CoachSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function attachmentContentBlocks(attachments: CoachAttachment[]): Anthropic.ContentBlockParam[] {
  return attachments.flatMap((attachment): Anthropic.ContentBlockParam[] => {
    if (attachment.kind === "image" && attachment.data) {
      return [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: attachment.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: attachment.data,
          },
        },
        {
          type: "text",
          text: `[Attached image: ${attachment.name}, ${attachment.mediaType}. Analyze what is visible. If it is food, estimate likely ingredients, portion uncertainty, calories, protein, carbs, and fat. If it is a menu screenshot, compare likely choices and recommend what best fits the user's remaining targets. If it is an exercise/workout image, identify movement pattern, likely muscles, risks, and how it fits the user's goal.]`,
        },
      ];
    }

    if (attachment.kind === "pdf" && attachment.data) {
      return [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: attachment.data,
          },
          title: attachment.name,
        } as Anthropic.ContentBlockParam,
        {
          type: "text",
          text: `[Attached PDF/document: ${attachment.name}. Extract nutrition, exercise, schedule, email, or health-context details relevant to the user's request. Be explicit about uncertainty.]`,
        },
      ];
    }

    if (attachment.kind === "text" && attachment.text) {
      const clipped = attachment.text.slice(0, 80_000);
      return [
        {
          type: "text",
          text: `[Attached text file: ${attachment.name}, ${attachment.mediaType}]\n\n${clipped}`,
        },
      ];
    }

    return [
      {
        type: "text",
        text: `[Attachment metadata only: ${attachment.name}, ${attachment.mediaType}, ${attachment.size} bytes. The app could not include its contents.]`,
      },
    ];
  });
}

function toAnthropicMessage(m: CoachTurnMessage): Anthropic.MessageParam {
  if (m.role === "assistant") {
    return {
      role: "assistant",
      content: m.content,
    };
  }

  const attachments = m.attachments ?? [];
  if (attachments.length === 0) {
    return {
      role: "user",
      content: `User said: ${m.content}`,
    };
  }

  return {
    role: "user",
    content: [
      ...attachmentContentBlocks(attachments),
      {
        type: "text",
        text: `User said: ${m.content || "Please interpret the attached file(s) for my nutrition, workout, recovery, or health decision."}`,
      },
    ],
  };
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = parsed.data as unknown as CoachTurnRequest;

  // Auth: signed-in Supabase user, or preview-mode sample user (no auth gate).
  const host = (await headers()).get("host");
  const supabase = hasSupabaseConfig() ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const isPreview = !user && isPreviewHost(host);
  if (!user && !isPreview) {
    return Response.json({ error: "Sign in to use Coach." }, { status: 401 });
  }
  // Every call below is additionally guarded by `user`. A real user can only
  // exist when this client was created from valid runtime configuration.
  const storageClient = supabase!;
  const userId = user?.id ?? SAMPLE_USER.id;
  const providerAccess = evaluatePaidProviderAccess({
    authenticated: Boolean(user),
    anonymousPreview: isPreview,
    allowPaidPreview:
      process.env.NODE_ENV !== "production" &&
      envFlag(process.env.COACH_ALLOW_PAID_PREVIEW) === true,
  });

  // Cost circuit breaker — fires BEFORE any model call (non-negotiable).
  const day = new Date().toISOString().split("T")[0];
  // Test hook (preview only): lets the E2E suite simulate a spent budget
  // without burning $10 of real tokens.
  const testSpendHeader = request.headers.get("x-coach-test-spend-cents");
  if (isPreview && testSpendHeader !== null) {
    // Absolute set (incl. "0" to reset) so one test's simulated spend can't
    // starve the rest of the suite.
    memoryAddCents(userId, day, Number(testSpendHeader) - memoryGetDayCents(userId, day));
  }
  const spentCents = user
    ? await getSupabaseDayCents(storageClient, userId, day)
    : memoryGetDayCents(userId, day);
  const budget = evaluateBudget(spentCents);
  if (!budget.allowed) {
    return Response.json({ error: budget.message, budgetExceeded: true }, { status: 429 });
  }

  // Signed-in: pin the conversation row before streaming starts.
  const conversationId = user
    ? await ensureConversation(storageClient, userId, body.conversationId)
    : null;
  const turnAttachments = body.messages
    .flatMap((message) => (message.role === "user" ? message.attachments ?? [] : []))
    .filter((attachment) => attachment.data || attachment.text);
  if (user && conversationId && turnAttachments.length > 0) {
    await saveCoachUploadedArtifacts(storageClient, {
      userId,
      conversationId,
      attachments: turnAttachments,
    });
  }

  const snapshot = body.snapshot as CoachDaySnapshot;
  if (user) {
    try {
      const goalContext = await loadServerDailyGoalContext(storageClient, {
        userId,
        date: snapshot.date,
        meals: snapshot.meals,
        totals: snapshot.totals,
        targets: snapshot.targets,
        profile: { goal: snapshot.profile.goal ?? null },
      });
      snapshot.goalPlan = goalContext.goalPlan;
      snapshot.integration = goalContext.integration;
      snapshot.goalContext = goalContext;
      snapshot.targets = goalContext.targets;
    } catch {
      // Preserve the client snapshot if the server goal context cannot be loaded.
    }
  }
  const lastUserText = body.messages
    .slice()
    .reverse()
    .find((message) => message.role === "user")?.content ?? "";
  const existingKnowledge = user ? await loadCoachKnowledge(storageClient, userId) : null;
  let coachKnowledge = mergeCoachKnowledge(
    existingKnowledge,
    buildCoachKnowledgeBase(userId, snapshot),
  );
  if (user) {
    await persistCoachKnowledge(storageClient, coachKnowledge);
  }
  const retrievedKnowledge = formatKnowledgeForPrompt(
    retrieveCoachKnowledge(coachKnowledge, lastUserText),
  );
  const providerConfig = resolveCoachProviderConfig();
  const requestedModel = pickModel(body);
  const modelCandidates = providerConfig
    ? providerModelCandidates(providerConfig, requestedModel)
    : [requestedModel];
  let model = modelCandidates[0];

  // E1: prompt-injection defense — user content is data, wrapped explicitly.
  const apiMessages: Anthropic.MessageParam[] = body.messages.map(toAnthropicMessage);

  let artifactCounter = 0;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: CoachSseEvent) => controller.enqueue(encoder.encode(sse(e)));
      let totalIn = 0;
      let totalOut = 0;
      let assistantText = "";
      const turnToolCalls: Array<{ name: string; input: unknown }> = [];
      const turnArtifacts: ArtifactSpec[] = [];
      const turnMutations: CoachMutation[] = [];
      // set_preferences patches accumulated across the turn; persisted to
      // profiles.preferences_jsonb for signed-in users after the stream.
      const turnPrefPatch: Record<string, unknown> = {};
      const collectPrefPatch = (mutations: CoachMutation[] | undefined) => {
        for (const m of mutations ?? []) {
          if (m.kind === "set_preferences") Object.assign(turnPrefPatch, m.patch);
        }
      };

      const completeWithProviderFallback = async (
        failureClass?: ProviderFailureClass,
        statusCode?: number,
      ) => {
        if (failureClass) {
          const incident = createSanitizedProviderIncident({
            failureClass,
            model,
            statusCode,
            provider: providerConfig?.provider,
          });
          await recordProviderIncident(
            incident,
            user
              ? async (safeIncident) => {
                  await insertSupabaseAudit(storageClient, {
                    userId,
                    tool: "provider_incident",
                    args: safeIncident,
                    resultSummary: `provider_error:${safeIncident.failureClass}`,
                  });
                }
              : undefined,
          );
        }

        assistantText = buildProviderFallbackReply(lastUserText, snapshot);
        emit({ type: "text_delta", text: assistantText });
        if (user && conversationId) {
          const lastUser = body.messages[body.messages.length - 1];
          await saveMessages(storageClient, conversationId, [
            ...(lastUser?.role === "user"
              ? [{ role: "user" as const, content: lastUser.content }]
              : []),
            {
              role: "assistant" as const,
              content: assistantText,
              toolCalls: turnToolCalls,
              artifacts: turnArtifacts,
              model: "deterministic-provider-fallback",
              tokensIn: 0,
              tokensOut: 0,
            },
          ]);
        }
        emit({
          type: "turn_done",
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            costUsdCents: 0,
            model: "deterministic-provider-fallback",
          },
          conversationId: conversationId ?? undefined,
        });
      };

      const audit = async (tool: string, args: unknown, resultSummary: string) => {
        if (user) {
          await insertSupabaseAudit(storageClient, { userId, tool, args, resultSummary });
        } else {
          await writeAudit({ userId, tool, args, resultSummary, isPreview });
        }
      };

      const toolCtx: ToolContext = {
        snapshot,
        userId,
        isPreview,
        applyMutation: (m: CoachMutation) => applySnapshotMutation(snapshot, m),
        newArtifactId: () => `art-${Date.now().toString(36)}-${++artifactCounter}`,
      };

	      try {
	        const directMealLog = body.confirmedTool ? null : parseDirectMealLog(lastUserText);
	        const directWorkoutLog =
	          body.confirmedTool || directMealLog ? null : parseDirectWorkoutLog(lastUserText);
	        const directLog = directMealLog ?? directWorkoutLog;
	        const directAudit = directMealLog ? "direct-meal-log" : "direct-workout-log";
	        const directModel = directMealLog ? "deterministic-meal-log" : "deterministic-workout-log";
	        if (directLog) {
	          const def = getTool(directLog.tool);
	          if (!def) throw new Error("Direct logging tool is unavailable.");
	          const input = def.schema.parse(directLog.input);
	          const result = await def.run(input, toolCtx);
	          result.mutations?.forEach(toolCtx.applyMutation);
	          turnMutations.push(...(result.mutations ?? []));
	          collectPrefPatch(result.mutations);
	          assistantText = directLog.reply;
	          emit({ type: "text_delta", text: assistantText });
	          if (result.artifact) {
	            turnArtifacts.push(result.artifact);
	            emit({ type: "artifact", artifact: result.artifact, toolName: def.name });
	          }
	          if (result.mutations?.length) emit({ type: "mutation", mutations: result.mutations });
	          turnToolCalls.push({ name: def.name, input });
	          await audit(def.name, input, directAudit);

	          if (user) {
	            await persistCoachMutations(storageClient, userId, turnMutations, snapshot.goalContext);
	            coachKnowledge = mergeCoachKnowledge(
	              coachKnowledge,
	              buildCoachKnowledgeBase(userId, snapshot),
	            );
	            await persistCoachKnowledge(storageClient, coachKnowledge);
	            if (conversationId) {
	              await saveMessages(storageClient, conversationId, [
	                { role: "user" as const, content: lastUserText },
	                {
	                  role: "assistant" as const,
	                  content: assistantText,
	                  toolCalls: turnToolCalls,
	                  artifacts: turnArtifacts,
	                  model: directModel,
	                  tokensIn: 0,
	                  tokensOut: 0,
	                },
	              ]);
	            }
	          }

	          emit({
	            type: "turn_done",
	            usage: { inputTokens: 0, outputTokens: 0, costUsdCents: 0, model: directModel },
	            conversationId: conversationId ?? undefined,
	          });
	          return;
	        }

        // Pre-confirmed tool from a card tap: execute it directly and return
        // a deterministic confirmation. Sending an assistant-prefill back to
        // Anthropic causes supported models to reject the turn because the
        // conversation no longer ends with a user message.
        if (body.confirmedTool) {
          const def = getTool(body.confirmedTool.name);
          if (!def) {
            assistantText = "I couldn't find that action in FuelWell.";
            emit({ type: "text_delta", text: assistantText });
          } else {
            try {
              const input = def.schema.parse(body.confirmedTool.input);
              if (def.destructive) {
                const confirmation = verifyCoachConfirmationToken({
                  token: body.confirmedTool.token,
                  userId,
                  conversationId: conversationId ?? body.conversationId,
                  toolName: def.name,
                  input,
                });
                if (!confirmation.ok) {
                  assistantText =
                    "I couldn't verify that confirmation. Ask me to do it again so I can issue a fresh confirmation card.";
                  emit({ type: "text_delta", text: assistantText });
                  await audit(def.name, { input, reason: confirmation.reason }, "rejected-confirmed-tool");
                  throw new Error("confirmation rejected");
                }
              }
              const result = await def.run(input, toolCtx);
              result.mutations?.forEach(toolCtx.applyMutation);
              turnMutations.push(...(result.mutations ?? []));
              collectPrefPatch(result.mutations);
              assistantText = summarizeConfirmedTool(def.name, result.modelResult, input);
              emit({ type: "text_delta", text: assistantText });
              if (result.artifact) {
                turnArtifacts.push(result.artifact);
                emit({ type: "artifact", artifact: result.artifact, toolName: def.name });
              }
              if (result.mutations?.length) emit({ type: "mutation", mutations: result.mutations });
              turnToolCalls.push({ name: def.name, input });
              await audit(def.name, input, "confirmed-tool");
            } catch (err) {
              if (assistantText.length === 0) {
                assistantText = `I couldn't apply that action: ${
                  err instanceof Error ? err.message.slice(0, 220) : "invalid input"
                }.`;
                emit({ type: "text_delta", text: assistantText });
              }
            }
          }

          if (user) {
            if (Object.keys(turnPrefPatch).length > 0) {
              await mergeProfilePreferences(storageClient, userId, turnPrefPatch);
            }
            await persistCoachMutations(storageClient, userId, turnMutations, snapshot.goalContext);
            coachKnowledge = mergeCoachKnowledge(
              coachKnowledge,
              buildCoachKnowledgeBase(userId, snapshot),
            );
            await persistCoachKnowledge(storageClient, coachKnowledge);
            if (conversationId) {
              const lastUser = body.messages[body.messages.length - 1];
              await saveMessages(storageClient, conversationId, [
                ...(lastUser?.role === "user"
                  ? [{ role: "user" as const, content: lastUser.content }]
                  : []),
                {
                  role: "assistant" as const,
                  content: assistantText,
                  toolCalls: turnToolCalls,
                  artifacts: turnArtifacts,
                  model: "deterministic-tool-action",
                  tokensIn: 0,
                  tokensOut: 0,
                },
              ]);
            }
          }

          emit({
            type: "turn_done",
            usage: { inputTokens: 0, outputTokens: 0, costUsdCents: 0, model: "deterministic-tool-action" },
            conversationId: conversationId ?? undefined,
          });
          return;
        }

        if (!providerAccess.allowed) {
          await completeWithProviderFallback();
          return;
        }

        const providerHealth = getProviderHealth(providerConfig?.credential);
        if (providerHealth.state === "missing_config") {
          await completeWithProviderFallback("missing_config");
          return;
        }

        let anthropic: Anthropic;
        try {
          if (!providerConfig) throw new Error("Coach provider configuration is missing.");
          anthropic = createCoachProviderClient(providerConfig);
        } catch (error) {
          await completeWithProviderFallback(
            classifyProviderError(error),
            providerErrorStatus(error),
          );
          return;
        }

        let rounds = 0;
        let continueLoop = true;
        let offerWebSearch = shouldOfferWebSearch(lastUserText);

        while (continueLoop && rounds < MAX_TOOL_ROUNDS) {
          rounds += 1;

          let pendingText = "";
          let final: Anthropic.Message | null = null;
          let providerFailure: unknown;
          try {
            for (const candidate of modelCandidates) {
              let candidateText = "";
              try {
                const msgStream = anthropic.messages.stream({
                  model: candidate,
                  max_tokens: 1500,
                  system: buildSystemPrompt(snapshot, retrievedKnowledge),
                  tools: toCoachAnthropicTools(offerWebSearch),
                  messages: apiMessages,
                });

                msgStream.on("text", (delta) => {
                  candidateText += delta;
                  pendingText += delta;
                  emit({ type: "text_delta", text: redactPii(delta) });
                });

                final = await msgStream.finalMessage();
                model = candidate;
                markProviderSuccess();
                break;
              } catch (error) {
                providerFailure = error;
                if (candidateText || isWebSearchUnavailable(error)) throw error;
              }
            }
            if (!final) throw providerFailure ?? new Error("All Coach provider routes failed.");
          } catch (err) {
            if (offerWebSearch && isWebSearchUnavailable(err)) {
              offerWebSearch = false;
              rounds -= 1;
              continue;
            }
            await completeWithProviderFallback(
              classifyProviderError(err),
              providerErrorStatus(err),
            );
            return;
          }
          if (!final) throw new Error("Coach provider returned no final message.");
          totalIn += final.usage.input_tokens;
          totalOut += final.usage.output_tokens;
          assistantText += pendingText;

          // E4: voice filter — banned phrases trigger a correction pass.
          const voice = enforceVoice(pendingText);
          if (!voice.ok) {
            assistantText += voice.correctionNotice;
            emit({ type: "text_delta", text: voice.correctionNotice });
          }

          const toolUses = final.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );

          if (final.stop_reason !== "tool_use" || toolUses.length === 0) {
            continueLoop = false;
            break;
          }

          apiMessages.push({ role: "assistant", content: final.content });
          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const tu of toolUses) {
            const def = getTool(tu.name);
            if (!def) {
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content: "Unknown tool.",
                is_error: true,
              });
              continue;
            }

            emit({ type: "tool_start", name: tu.name, toolUseId: tu.id });

            // E2: destructive tools pause for an explicit user yes.
            if (def.destructive) {
              let parsedInput: unknown;
              try {
                parsedInput = def.schema.parse(tu.input);
              } catch {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tu.id,
                  content: "The destructive action could not be validated.",
                  is_error: true,
                });
                continue;
              }
              const token = issueCoachConfirmationToken({
                userId,
                conversationId: conversationId ?? body.conversationId,
                toolName: tu.name,
                input: parsedInput,
              });
              if (!token) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: tu.id,
                  content: "Confirmation is temporarily unavailable for this action.",
                  is_error: true,
                });
                continue;
              }
              emit({
                type: "confirm_required",
                toolName: tu.name,
                input: parsedInput,
                prompt: `Confirm: ${tu.name.replaceAll("_", " ")}?`,
                token,
              });
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content:
                  "Paused: this action needs the user's explicit confirmation. A confirm card was shown — tell the user to confirm or cancel, then stop.",
              });
              continue;
            }

            try {
              const input = def.schema.parse(tu.input);
              const result = await def.run(input, toolCtx);
              result.mutations?.forEach(toolCtx.applyMutation);
              turnMutations.push(...(result.mutations ?? []));
              collectPrefPatch(result.mutations);
              if (result.artifact) {
                turnArtifacts.push(result.artifact);
                emit({ type: "artifact", artifact: result.artifact, toolName: tu.name });
              }
              if (result.mutations?.length) {
                emit({ type: "mutation", mutations: result.mutations });
              }
              turnToolCalls.push({ name: tu.name, input });
              await audit(tu.name, input, JSON.stringify(result.modelResult).slice(0, 200));
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content: JSON.stringify(result.modelResult),
              });
            } catch (err) {
              toolResults.push({
                type: "tool_result",
                tool_use_id: tu.id,
                content: `Tool failed: ${err instanceof Error ? err.message : "unknown error"}`,
                is_error: true,
              });
            }
          }

          apiMessages.push({ role: "user", content: toolResults });
        }

        const cents = costUsdCents(model, totalIn, totalOut);
        if (user) {
          if (Object.keys(turnPrefPatch).length > 0) {
            await mergeProfilePreferences(storageClient, userId, turnPrefPatch);
          }
          await persistCoachMutations(storageClient, userId, turnMutations, snapshot.goalContext);
          coachKnowledge = mergeCoachKnowledge(
            coachKnowledge,
            buildCoachKnowledgeBase(userId, snapshot),
          );
          await persistCoachKnowledge(storageClient, coachKnowledge);
          await insertSupabaseUsage(storageClient, {
            userId,
            day,
            inputTokens: totalIn,
            outputTokens: totalOut,
            costUsdCents: cents,
            model,
          });
          if (conversationId) {
            const lastUser = body.messages[body.messages.length - 1];
            await saveMessages(storageClient, conversationId, [
              ...(lastUser?.role === "user"
                ? [{ role: "user" as const, content: lastUser.content }]
                : []),
              {
                role: "assistant" as const,
                content: assistantText,
                toolCalls: turnToolCalls,
                artifacts: turnArtifacts,
                model,
                tokensIn: totalIn,
                tokensOut: totalOut,
              },
            ]);
          }
        } else {
          memoryAddCents(userId, day, cents);
        }

        emit({
          type: "turn_done",
          usage: { inputTokens: totalIn, outputTokens: totalOut, costUsdCents: cents, model },
          conversationId: conversationId ?? undefined,
        });
      } catch {
        emit({
          type: "error",
          message: "Coach is temporarily unavailable. Your app data is still safe, and you can try again in a moment.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { headers } from "next/headers";
import { isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/coach/system-prompt";
import {
  costUsdCents,
  evaluateBudget,
  memoryAddCents,
  memoryGetDayCents,
} from "@/lib/coach/cost";
import { getTool, toAnthropicTools } from "@/lib/coach/registry";
import "@/lib/coach/tools";
import type {
  ArtifactSpec,
  CoachDaySnapshot,
  CoachMutation,
  CoachSseEvent,
  CoachTurnRequest,
  ToolContext,
} from "@/lib/coach/types";
import { applySnapshotMutation } from "@/lib/coach/apply-mutation";
import { enforceVoice, redactPii } from "@/lib/coach/voice-filter";
import { writeAudit } from "@/lib/coach/audit";
import {
  ensureConversation,
  getSupabaseDayCents,
  insertSupabaseAudit,
  insertSupabaseUsage,
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

function pickModel(req: CoachTurnRequest): string {
  if (process.env.COACH_MODEL) return process.env.COACH_MODEL;
  const last = req.messages[req.messages.length - 1]?.content ?? "";
  const planning = /\bplan\b|\bweek\b|meal plan|recover my day|strategy/i.test(last);
  if (last.length > 500 || req.messages.length > 16 || planning) return SONNET;
  return HAIKU;
}

const requestSchema = z.object({
  conversationId: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(60),
  snapshot: z.record(z.string(), z.unknown()),
  confirmedTool: z
    .object({ name: z.string(), input: z.unknown() })
    .optional(),
});

function sse(event: CoachSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Coach is not configured." }, { status: 503 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = parsed.data as unknown as CoachTurnRequest;

  // Auth: signed-in Supabase user, or preview-mode sample user (no auth gate).
  const host = (await headers()).get("host");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPreview = !user && isPreviewHost(host);
  if (!user && !isPreview) {
    return Response.json({ error: "Sign in to use Coach." }, { status: 401 });
  }
  const userId = user?.id ?? SAMPLE_USER.id;

  // Cost circuit breaker — fires BEFORE any model call (non-negotiable).
  const day = new Date().toISOString().split("T")[0];
  // Test hook (preview only): lets the E2E suite simulate a spent budget
  // without burning $10 of real tokens.
  const testSpend = Number(request.headers.get("x-coach-test-spend-cents") ?? 0);
  if (isPreview && testSpend > 0) {
    memoryAddCents(userId, day, testSpend - memoryGetDayCents(userId, day));
  }
  const spentCents = user
    ? await getSupabaseDayCents(supabase, userId, day)
    : memoryGetDayCents(userId, day);
  const budget = evaluateBudget(spentCents);
  if (!budget.allowed) {
    return Response.json({ error: budget.message, budgetExceeded: true }, { status: 429 });
  }

  // Signed-in: pin the conversation row before streaming starts.
  const conversationId = user
    ? await ensureConversation(supabase, userId, body.conversationId)
    : null;

  const snapshot = body.snapshot as CoachDaySnapshot;
  const model = pickModel(body);
  const anthropic = new Anthropic();

  // E1: prompt-injection defense — user content is data, wrapped explicitly.
  const apiMessages: Anthropic.MessageParam[] = body.messages.map((m) => ({
    role: m.role,
    content: m.role === "user" ? `User said: ${m.content}` : m.content,
  }));

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

      const audit = async (tool: string, args: unknown, resultSummary: string) => {
        if (user) {
          await insertSupabaseAudit(supabase, { userId, tool, args, resultSummary });
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
        // Pre-confirmed destructive tool from a prior confirm_required event:
        // execute it directly, then let the model narrate the result.
        if (body.confirmedTool) {
          const def = getTool(body.confirmedTool.name);
          if (def) {
            const input = def.schema.parse(body.confirmedTool.input);
            const result = await def.run(input, toolCtx);
            result.mutations?.forEach(toolCtx.applyMutation);
            if (result.artifact) {
              turnArtifacts.push(result.artifact);
              emit({ type: "artifact", artifact: result.artifact, toolName: def.name });
            }
            if (result.mutations?.length) emit({ type: "mutation", mutations: result.mutations });
            turnToolCalls.push({ name: def.name, input });
            await audit(def.name, input, "confirmed-destructive");
            apiMessages.push({
              role: "assistant",
              content: `[Confirmed action ${def.name} executed: ${JSON.stringify(result.modelResult).slice(0, 400)}]`,
            });
          }
        }

        let rounds = 0;
        let continueLoop = true;

        while (continueLoop && rounds < MAX_TOOL_ROUNDS) {
          rounds += 1;

          const msgStream = anthropic.messages.stream({
            model,
            max_tokens: 1500,
            system: buildSystemPrompt(snapshot),
            tools: toAnthropicTools(),
            messages: apiMessages,
          });

          let pendingText = "";
          msgStream.on("text", (delta) => {
            pendingText += delta;
            emit({ type: "text_delta", text: redactPii(delta) });
          });

          const final = await msgStream.finalMessage();
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
              emit({
                type: "confirm_required",
                toolName: tu.name,
                input: tu.input,
                prompt: `Confirm: ${tu.name.replaceAll("_", " ")}?`,
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
          await insertSupabaseUsage(supabase, {
            userId,
            day,
            inputTokens: totalIn,
            outputTokens: totalOut,
            costUsdCents: cents,
            model,
          });
          if (conversationId) {
            const lastUser = body.messages[body.messages.length - 1];
            await saveMessages(supabase, conversationId, [
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
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Coach hit an unexpected error.",
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

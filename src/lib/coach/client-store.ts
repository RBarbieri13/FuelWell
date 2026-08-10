"use client";

/**
 * Coach chat client store.
 *
 * Owns the conversation (optimistic user append, streamed assistant deltas,
 * artifacts as they materialize), builds the day snapshot from the shared
 * client stores, and applies server mutations BACK to those same stores —
 * which is exactly why a meal logged in chat shows up on Log/Dashboard.
 *
 * Card taps arrive as CoachCardAction and are translated into explicit
 * structured user messages (e.g. "Log it: food_id=…"), keeping a single
 * model-mediated path for every action.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDayLog,
  initializeDayLog,
  getDayLogSnapshot,
  addMealRecord,
  replaceMeal,
  removeMeal as storeRemoveMeal,
} from "@/lib/use-day-log";
import { mergePreferences, usePreferences, type PreferenceState } from "@/lib/use-preferences";
import { useWorkoutLog, initializeWorkoutLog, getWorkoutLogSnapshot, addWorkout, removeWorkout } from "@/lib/use-workout-log";
import { useGroceryList, initializeGroceryList, getGrocerySnapshot, applyCoachGrocery, toCoachGrocery } from "@/lib/use-grocery-list";
import { useBodyLog, initializeBodyLog, getBodyLogSnapshot, addBodyLogEntry } from "@/lib/use-body-log";
import { sumMeals, todayIsoDate } from "@/lib/fuelwell-data";
import { buildDailyGoalContext } from "@/lib/goal-context";
import { normalizeGroceryInput } from "@/lib/grocery-normalization";
import {
  setGoalPlan,
  setIntegrationSummary,
  getGoalContextSnapshot,
  useGoalContextStore,
} from "@/lib/use-goal-context";
import type {
  ArtifactSpec,
  CoachAttachment,
  CoachDaySnapshot,
  CoachMutation,
  CoachSseEvent,
  CoachTurnMessage,
} from "@/lib/coach/types";
import type { CoachCardAction } from "@/components/coach/artifacts/contract";
import { describeProviderHealthForUser } from "@/lib/coach/provider-health";
import {
  clearCoachChatScope,
  coachChatStorageKey,
  getCoachChatScope,
  PREVIEW_COACH_CHAT_SCOPE,
  setCoachChatScope,
} from "@/lib/coach/chat-storage";

export type ChatItem = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: Array<Pick<CoachAttachment, "id" | "name" | "mediaType" | "size" | "kind">>;
  artifacts: ArtifactSpec[];
  confirm?: { toolName: string; input: unknown; prompt: string; token: string } | null;
  streaming?: boolean;
  error?: boolean;
};

export type CoachProfile = {
  displayName?: string;
  goal?: string;
  activityLevel?: string;
  dietaryPreference?: string;
  weightKg?: number;
  heightCm?: number;
};

// Abort a turn when the SSE stream goes silent for this long. The server's
// maxDuration is 120s; a stalled reader would otherwise leave the composer
// disabled and the typing indicator spinning forever.
const STREAM_IDLE_TIMEOUT_MS = 90_000;

type StoredChat = { date: string; items: ChatItem[]; conversationId?: string };

type HistoryResponse = {
  signedIn: boolean;
  userId: string | null;
  conversationId: string | null;
  messages: Array<{ role: "user" | "assistant"; content: string; artifacts: ArtifactSpec[] }>;
  hasMore?: boolean;
  nextBefore?: string | null;
};

/**
 * Fetch the current provider-health state and translate it into a one-line,
 * human-readable notice. Best-effort: any failure returns null so error
 * bubbles never block on this.
 */
async function fetchProviderHealthNotice(): Promise<string | null> {
  try {
    const res = await fetch("/api/coach/provider-health");
    if (!res.ok) return null;
    const health = (await res.json()) as Parameters<typeof describeProviderHealthForUser>[0];
    return describeProviderHealthForUser(health);
  } catch {
    return null;
  }
}

let itemIdCounter = 0;
function nextItemId() {
  itemIdCounter += 1;
  return `chat-${Date.now().toString(36)}-${itemIdCounter}`;
}

function loadStoredChat(): StoredChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(coachChatStorageKey(getCoachChatScope()));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (parsed.date === todayIsoDate() && Array.isArray(parsed.items)) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function resolveCoachHistoryHydration(
  history: HistoryResponse | null,
  stored: StoredChat | null,
): {
  scope: string;
  items: ChatItem[];
  conversationId?: string;
  hasEarlier: boolean;
  nextBefore: string | null;
  source: "server" | "local" | "empty";
} {
  if (history?.signedIn && history.userId) {
    return {
      scope: history.userId,
      items: history.messages.map((message) => ({
        id: nextItemId(),
        role: message.role,
        text: message.content,
        artifacts: message.artifacts ?? [],
        streaming: false,
      })),
      conversationId: history.conversationId ?? undefined,
      hasEarlier: Boolean(history.hasMore && history.nextBefore),
      nextBefore: history.nextBefore ?? null,
      source: "server",
    };
  }

  if (stored?.items?.length) {
    return {
      scope: PREVIEW_COACH_CHAT_SCOPE,
      items: stored.items.map((item) => ({ ...item, streaming: false })),
      conversationId: stored.conversationId,
      hasEarlier: false,
      nextBefore: null,
      source: "local",
    };
  }

  return {
    scope: PREVIEW_COACH_CHAT_SCOPE,
    items: [],
    conversationId: undefined,
    hasEarlier: false,
    nextBefore: null,
    source: "empty",
  };
}

/** Replace coach mutations into the real client stores. */
function applyMutationToStores(m: CoachMutation) {
  switch (m.kind) {
    case "add_meal":
      addMealRecord(m.meal);
      break;
    case "update_meal":
      replaceMeal(m.mealId, m.meal);
      break;
    case "remove_meal":
      storeRemoveMeal(m.mealId);
      break;
    case "add_workout":
      addWorkout(m.workout);
      break;
    case "remove_workout":
      removeWorkout(m.workoutId);
      break;
    case "set_grocery":
      applyCoachGrocery(m.items);
      break;
    case "add_body_log":
      addBodyLogEntry(m.entry);
      break;
    case "set_preferences":
      // Preferences mutations are applied via usePreferences toggles on next
      // render; the snapshot patch keeps the server consistent within a turn.
      applyPreferencePatch(m.patch);
      break;
    case "set_goal_plan":
      setGoalPlan(m.plan);
      break;
    case "set_integration_summary":
      setIntegrationSummary(m.summary);
      break;
  }
}

function applyPreferencePatch(patch: Partial<CoachDaySnapshot["preferences"]>) {
  // Route through the shared store so Log/Recipes/Settings re-render and the
  // signed-in server sync (PreferencesSync) picks it up.
  mergePreferences({
    ...(patch.diets ? { diets: patch.diets } : {}),
    ...(patch.allergies ? { allergies: patch.allergies } : {}),
    ...(patch.likes ? { likes: patch.likes } : {}),
    ...(patch.dislikes ? { dislikes: patch.dislikes } : {}),
  } as Partial<PreferenceState>);
}

function toToolActionLabel(name: string, input: unknown): string {
  const args =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  switch (name) {
    case "add_grocery_item": {
      const normalized = normalizeGroceryInput(
        String(args.name ?? "item"),
        String(args.quantity ?? "")
      );
      const quantity = normalized.quantity ? `${normalized.quantity} ` : "";
      return `Add ${quantity}${normalized.name} to groceries`;
    }
    case "check_grocery_item":
      return "Update grocery item";
    case "add_recipe_to_grocery_list":
      return "Add recipe ingredients to groceries";
    case "start_workout_session":
      return "Start workout";
    case "log_custom_meal":
      return "Log meal";
    default:
      return name.replaceAll("_", " ");
  }
}

export function formatActionAsMessage(action: CoachCardAction): string | null {
  switch (action.kind) {
    case "send_message":
      return action.text;
    case "invoke_tool":
      return toToolActionLabel(action.name, action.input);
    default:
      return null;
  }
}

export function useCoachChat(profile: CoachProfile, initialItems?: ChatItem[], initialConversationId?: string) {
  const { targets } = useDayLog();
  const prefs = usePreferences();
  useWorkoutLog();
  useGroceryList();
  useBodyLog();
  useGoalContextStore();

  // Start from the SSR-safe empty state and hydrate the stored chat after
  // mount — reading localStorage in the initializer causes a hydration
  // mismatch (server renders empty, client renders the replay).
  const [items, setItems] = useState<ChatItem[]>(initialItems ?? []);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [hasEarlier, setHasEarlier] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const historyCursorRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(initialConversationId);
  const busyRef = useRef(false);
  const queuedTurnRef = useRef<{
    userText: string;
    attachments?: CoachAttachment[];
    confirmedTool?: { name: string; input: unknown; token?: string };
  } | null>(null);
  // The most recent turn request plus the transcript items it created, so a
  // failed turn can be retried without duplicating the user message.
  const lastTurnRef = useRef<{
    userText: string;
    attachments?: CoachAttachment[];
    confirmedTool?: { name: string; input: unknown; token?: string };
    userItemId: string;
    assistantItemId: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Signed-in users replay their latest conversation from Supabase (survives
    // devices and days); preview/signed-out users fall back to the same-day
    // localStorage replay. Async fetch also keeps the setState out of the
    // synchronous effect body (react-hooks/set-state-in-effect).
    void (async () => {
      let history: HistoryResponse | null = null;
      try {
        const res = await fetch("/api/coach/history");
        if (res.ok) {
          history = (await res.json()) as HistoryResponse;
        }
      } catch {
        // fall back to local replay
      }
      if (cancelled) return;
      const hydration = resolveCoachHistoryHydration(history, loadStoredChat());
      setCoachChatScope(hydration.scope);
      setItems(hydration.items);
      conversationIdRef.current = hydration.conversationId;
      historyCursorRef.current = hydration.nextBefore;
      setHasEarlier(hydration.hasEarlier);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist chat (preview replay; harmless for signed-in too). Waits for
  // hydration so the stored replay isn't clobbered by the initial empty state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        coachChatStorageKey(getCoachChatScope()),
        JSON.stringify({
          date: todayIsoDate(),
          items: items.slice(-60),
          conversationId: conversationIdRef.current,
        } satisfies StoredChat)
      );
    } catch {
      // best-effort
    }
  }, [items, hydrated]);

  const buildSnapshot = useCallback((): CoachDaySnapshot => {
    // Read the stores directly instead of render-closure values: a message
    // sent right after page load must carry post-hydration data even before
    // React re-renders (the closure would still hold the sample seed).
    const liveMeals = getDayLogSnapshot().meals;
    const liveTotals = sumMeals(liveMeals);
    const liveWorkouts = getWorkoutLogSnapshot().workouts;
    const liveGrocery = getGrocerySnapshot().items;
    const liveBodyLog = getBodyLogSnapshot().entries;
    const liveGoalState = getGoalContextSnapshot();
    const goalContext = buildDailyGoalContext({
      date: todayIsoDate(),
      meals: liveMeals,
      totals: liveTotals,
      targets,
      profile,
      goalPlan: liveGoalState.goalPlan,
      integration: liveGoalState.integrationSummary,
    });
    return {
      date: todayIsoDate(),
      meals: liveMeals,
      totals: liveTotals,
      targets: goalContext.targets,
      workouts: liveWorkouts,
      grocery: toCoachGrocery(liveGrocery),
      bodyLog: liveBodyLog,
      preferences: {
        diets: prefs.diets,
        allergies: prefs.allergies,
        likes: prefs.likes,
        dislikes: prefs.dislikes,
      },
      profile,
      goalPlan: goalContext.goalPlan,
      integration: liveGoalState.integrationSummary,
      goalContext,
    };
  }, [targets, prefs, profile]);

  const runTurn = useCallback(
    async (
      userText: string,
      attachments?: CoachAttachment[],
      confirmedTool?: { name: string; input: unknown; token?: string },
      replaceIds?: string[]
    ): Promise<void> => {
      // The snapshot must never carry the pre-hydration sample seed, so wait
      // for every store to finish its initial load (idempotent, usually
      // already resolved by the time a human can type).
      await Promise.all([
        initializeDayLog(),
        initializeWorkoutLog(),
        initializeGroceryList(),
        initializeBodyLog(),
      ]);
      // Taps that land mid-stream queue instead of vanishing (e.g. hitting
      // "Start workout" the moment the plan card renders).
      if (busyRef.current) {
        queuedTurnRef.current = { userText, attachments, confirmedTool };
        return;
      }
      busyRef.current = true;
      setBusy(true);

      const userItem: ChatItem = {
        id: nextItemId(),
        role: "user",
        text: userText,
        attachments: attachments?.map(({ id, name, mediaType, size, kind }) => ({
          id,
          name,
          mediaType,
          size,
          kind,
        })),
        artifacts: [],
      };
      const assistantItem: ChatItem = {
        id: nextItemId(),
        role: "assistant",
        text: "",
        artifacts: [],
        streaming: true,
      };
      lastTurnRef.current = {
        userText,
        attachments,
        confirmedTool,
        userItemId: userItem.id,
        assistantItemId: assistantItem.id,
      };
      const replaced = new Set(replaceIds ?? []);
      setItems((prev) => [
        ...prev.filter((i) => !replaced.has(i.id)).map((i) => ({ ...i, confirm: null })),
        userItem,
        assistantItem,
      ]);

      const history: CoachTurnMessage[] = [
        ...items
          // Failed/retried turns stay out of the provider transcript: error
          // bubbles are UI state, not conversation content.
          .filter((i) => i.text.trim().length > 0 && !i.error && !replaced.has(i.id))
          .slice(-20)
          .map((i) => ({ role: i.role, content: i.text })),
        { role: "user" as const, content: userText, attachments },
      ];

      const patchAssistant = (patch: Partial<ChatItem> | ((cur: ChatItem) => Partial<ChatItem>)) => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === assistantItem.id ? { ...i, ...(typeof patch === "function" ? patch(i) : patch) } : i
          )
        );
      };

      // Idle watchdog: if the SSE stream (or the initial response) goes
      // silent, abort so the user gets a readable error + retry instead of a
      // permanently disabled composer.
      const controller = new AbortController();
      let idleTimer: ReturnType<typeof setTimeout> | undefined;
      const armIdleTimeout = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
      };

      try {
        armIdleTimeout();
        const res = await fetch("/api/coach/turn", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            messages: history,
            snapshot: buildSnapshot(),
            confirmedTool,
          }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => null);
          const healthNotice = err?.budgetExceeded ? null : await fetchProviderHealthNotice();
          patchAssistant({
            streaming: false,
            error: !err?.budgetExceeded,
            confirm: null,
            text: [
              err?.error ?? "Coach is unavailable right now. Try again in a moment.",
              healthNotice,
            ]
              .filter(Boolean)
              .join("\n\n"),
          });
          busyRef.current = false;
          setBusy(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          armIdleTimeout();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let event: CoachSseEvent;
            try {
              event = JSON.parse(line.slice(6)) as CoachSseEvent;
            } catch {
              continue;
            }
            switch (event.type) {
              case "text_delta":
                patchAssistant((cur) => ({ text: cur.text + event.text }));
                break;
              case "artifact":
                // Paragraph-break any text that continues after this card so
                // round boundaries don't render as run-on sentences.
                patchAssistant((cur) => ({
                  artifacts: [...cur.artifacts, event.artifact],
                  text: cur.text && !cur.text.endsWith("\n") ? `${cur.text}\n\n` : cur.text,
                }));
                break;
              case "mutation":
                event.mutations.forEach(applyMutationToStores);
                break;
              case "confirm_required":
                patchAssistant({
                  confirm: {
                    toolName: event.toolName,
                    input: event.input,
                    prompt: event.prompt,
                    token: event.token,
                  },
                });
                break;
              case "turn_done":
                if (event.conversationId) conversationIdRef.current = event.conversationId;
                break;
              case "error":
                patchAssistant((cur) => ({
                  error: true,
                  // A confirm chip from a failed turn must not stay actionable
                  // next to "try again" copy.
                  confirm: null,
                  text:
                    cur.text ||
                    event.message ||
                    "Coach is temporarily unavailable. Try again in a moment.",
                }));
                break;
            }
          }
        }
      } catch {
        const timedOut = controller.signal.aborted;
        const healthNotice = await fetchProviderHealthNotice();
        patchAssistant((cur) => ({
          streaming: false,
          error: true,
          confirm: null,
          text: [
            cur.text ||
              (timedOut
                ? "Coach took too long to respond, so this turn was stopped."
                : "Connection dropped before Coach could finish."),
            healthNotice,
          ]
            .filter(Boolean)
            .join("\n\n"),
        }));
      } finally {
        clearTimeout(idleTimer);
      }

      patchAssistant({ streaming: false });
      busyRef.current = false;
      setBusy(false);
    },
    [items, buildSnapshot]
  );

  /**
   * Re-run the last turn after a failure. Removes the failed user/assistant
   * pair from the transcript so the retried message doesn't duplicate.
   */
  const retryLastTurn = useCallback(() => {
    const last = lastTurnRef.current;
    if (!last || busyRef.current) return;
    void runTurn(last.userText, last.attachments, last.confirmedTool, [
      last.userItemId,
      last.assistantItemId,
    ]);
  }, [runTurn]);

  /**
   * Load the previous page of the signed-in conversation and prepend it.
   * No-op for preview users (their whole replay is already local).
   */
  const loadEarlier = useCallback(async () => {
    const cursor = historyCursorRef.current;
    if (!cursor || loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const res = await fetch(`/api/coach/history?before=${encodeURIComponent(cursor)}`);
      if (!res.ok) return;
      const data = (await res.json()) as HistoryResponse;
      if (!data.signedIn) return;
      if (data.messages.length > 0) {
        setItems((prev) => [
          ...data.messages.map((m) => ({
            id: nextItemId(),
            role: m.role,
            text: m.content,
            artifacts: m.artifacts ?? [],
            streaming: false,
          })),
          ...prev,
        ]);
      }
      historyCursorRef.current = data.nextBefore ?? null;
      setHasEarlier(Boolean(data.hasMore && data.nextBefore));
    } catch {
      // keep the button; the user can try again
    } finally {
      setLoadingEarlier(false);
    }
  }, [loadingEarlier]);

  // Drain a queued mid-stream tap once the current turn settles.
  useEffect(() => {
    if (!busy && queuedTurnRef.current) {
      const next = queuedTurnRef.current;
      queuedTurnRef.current = null;
      void runTurn(next.userText, next.attachments, next.confirmedTool);
    }
  }, [busy, runTurn]);

  const sendMessage = useCallback(
    (text: string, attachments?: CoachAttachment[]) => runTurn(text, attachments),
    [runTurn]
  );

  const handleCardAction = useCallback(
    (action: CoachCardAction) => {
      switch (action.kind) {
        case "send_message":
        case "invoke_tool": {
          const text = formatActionAsMessage(action);
          if (text) {
            void runTurn(
              text,
              undefined,
              action.kind === "invoke_tool"
                ? { name: action.name, input: action.input }
                : undefined
            );
          }
          break;
        }
        case "confirm_tool":
          void runTurn("Yes — go ahead.", undefined, {
            name: action.name,
            input: action.input,
            token: action.token,
          });
          break;
        case "cancel_confirm":
          void runTurn("No, cancel that.");
          break;
        case "open_route":
          window.location.href = action.route;
          break;
      }
    },
    [runTurn]
  );

  const newConversation = useCallback(() => {
    conversationIdRef.current = undefined;
    lastTurnRef.current = null;
    historyCursorRef.current = null;
    setHasEarlier(false);
    setItems([]);
    try {
      clearCoachChatScope(getCoachChatScope());
    } catch {
      // ignore
    }
    // Signed-in: archive the server conversation so a reload doesn't replay
    // it. Fire-and-forget; no-op for preview users.
    void fetch("/api/coach/history", { method: "DELETE" }).catch(() => {});
  }, []);

  return {
    items,
    busy,
    sendMessage,
    handleCardAction,
    newConversation,
    retryLastTurn,
    hasEarlier,
    loadEarlier,
    loadingEarlier,
  };
}

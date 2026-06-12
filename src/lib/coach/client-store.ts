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
  addMealRecord,
  replaceMeal,
  removeMeal as storeRemoveMeal,
} from "@/lib/use-day-log";
import { mergePreferences, usePreferences, type PreferenceState } from "@/lib/use-preferences";
import { useWorkoutLog, addWorkout, removeWorkout } from "@/lib/use-workout-log";
import { useGroceryList, applyCoachGrocery, toCoachGrocery } from "@/lib/use-grocery-list";
import { useBodyLog, addBodyLogEntry } from "@/lib/use-body-log";
import { todayIsoDate } from "@/lib/fuelwell-data";
import type {
  ArtifactSpec,
  CoachDaySnapshot,
  CoachMutation,
  CoachSseEvent,
  CoachTurnMessage,
} from "@/lib/coach/types";
import type { CoachCardAction } from "@/components/coach/artifacts/contract";

export type ChatItem = {
  id: string;
  role: "user" | "assistant";
  text: string;
  artifacts: ArtifactSpec[];
  confirm?: { toolName: string; input: unknown; prompt: string } | null;
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

const CHAT_KEY = "fuelwell-coach-chat-v1";

type StoredChat = { date: string; items: ChatItem[]; conversationId?: string };

let itemIdCounter = 0;
function nextItemId() {
  itemIdCounter += 1;
  return `chat-${Date.now().toString(36)}-${itemIdCounter}`;
}

function loadStoredChat(): StoredChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHAT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (parsed.date === todayIsoDate() && Array.isArray(parsed.items)) return parsed;
  } catch {
    // ignore
  }
  return null;
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

export function formatActionAsMessage(action: CoachCardAction): string | null {
  switch (action.kind) {
    case "send_message":
      return action.text;
    case "invoke_tool":
      return `[BUTTON TAP] Execute ${action.name} now with input ${JSON.stringify(action.input)}. This is a direct UI action the user already chose — call the tool immediately, do not ask for confirmation.`;
    default:
      return null;
  }
}

export function useCoachChat(profile: CoachProfile, initialItems?: ChatItem[], initialConversationId?: string) {
  const { meals, totals, targets } = useDayLog();
  const prefs = usePreferences();
  const { workouts } = useWorkoutLog();
  const { items: groceryItems } = useGroceryList();
  const { entries: bodyLog } = useBodyLog();

  // Start from the SSR-safe empty state and hydrate the stored chat after
  // mount — reading localStorage in the initializer causes a hydration
  // mismatch (server renders empty, client renders the replay).
  const [items, setItems] = useState<ChatItem[]>(initialItems ?? []);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const conversationIdRef = useRef<string | undefined>(initialConversationId);
  const busyRef = useRef(false);
  const queuedTurnRef = useRef<{ userText: string; confirmedTool?: { name: string; input: unknown } } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Signed-in users replay their latest conversation from Supabase (survives
    // devices and days); preview/signed-out users fall back to the same-day
    // localStorage replay. Async fetch also keeps the setState out of the
    // synchronous effect body (react-hooks/set-state-in-effect).
    void (async () => {
      let hydratedFromServer = false;
      try {
        const res = await fetch("/api/coach/history");
        if (res.ok) {
          const data = (await res.json()) as {
            signedIn: boolean;
            conversationId: string | null;
            messages: Array<{ role: "user" | "assistant"; content: string; artifacts: ArtifactSpec[] }>;
          };
          if (!cancelled && data.signedIn && data.messages.length > 0) {
            setItems(
              data.messages.map((m) => ({
                id: nextItemId(),
                role: m.role,
                text: m.content,
                artifacts: m.artifacts ?? [],
                streaming: false,
              }))
            );
            if (data.conversationId) conversationIdRef.current = data.conversationId;
            hydratedFromServer = true;
          }
        }
      } catch {
        // fall back to local replay
      }
      if (cancelled) return;
      if (!hydratedFromServer) {
        const stored = loadStoredChat();
        if (stored?.items?.length) {
          setItems(stored.items.map((i) => ({ ...i, streaming: false })));
        }
        if (stored?.conversationId) conversationIdRef.current = stored.conversationId;
      }
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
        CHAT_KEY,
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
    return {
      date: todayIsoDate(),
      meals,
      totals,
      targets,
      workouts,
      grocery: toCoachGrocery(groceryItems),
      bodyLog,
      preferences: {
        diets: prefs.diets,
        allergies: prefs.allergies,
        likes: prefs.likes,
        dislikes: prefs.dislikes,
      },
      profile,
    };
  }, [meals, totals, targets, workouts, groceryItems, bodyLog, prefs, profile]);

  const runTurn = useCallback(
    async (
      userText: string,
      confirmedTool?: { name: string; input: unknown }
    ): Promise<void> => {
      // Taps that land mid-stream queue instead of vanishing (e.g. hitting
      // "Start workout" the moment the plan card renders).
      if (busyRef.current) {
        queuedTurnRef.current = { userText, confirmedTool };
        return;
      }
      busyRef.current = true;
      setBusy(true);

      const userItem: ChatItem = { id: nextItemId(), role: "user", text: userText, artifacts: [] };
      const assistantItem: ChatItem = {
        id: nextItemId(),
        role: "assistant",
        text: "",
        artifacts: [],
        streaming: true,
      };
      setItems((prev) => [...prev.map((i) => ({ ...i, confirm: null })), userItem, assistantItem]);

      const history: CoachTurnMessage[] = [
        ...items
          .filter((i) => i.text.trim().length > 0)
          .slice(-20)
          .map((i) => ({ role: i.role, content: i.text })),
        { role: "user" as const, content: userText },
      ];

      const patchAssistant = (patch: Partial<ChatItem> | ((cur: ChatItem) => Partial<ChatItem>)) => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === assistantItem.id ? { ...i, ...(typeof patch === "function" ? patch(i) : patch) } : i
          )
        );
      };

      try {
        const res = await fetch("/api/coach/turn", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            messages: history,
            snapshot: buildSnapshot(),
            confirmedTool,
          }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => null);
          patchAssistant({
            streaming: false,
            error: !err?.budgetExceeded,
            text: err?.error ?? "Coach is unavailable right now. Try again in a moment.",
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
                  confirm: { toolName: event.toolName, input: event.input, prompt: event.prompt },
                });
                break;
              case "turn_done":
                if (event.conversationId) conversationIdRef.current = event.conversationId;
                break;
              case "error":
                patchAssistant((cur) => ({
                  error: true,
                  text: cur.text || `Something broke mid-thought: ${event.message}`,
                }));
                break;
            }
          }
        }
      } catch {
        patchAssistant({ streaming: false, error: true, text: "Connection dropped. Send that again." });
      }

      patchAssistant({ streaming: false });
      busyRef.current = false;
      setBusy(false);
    },
    [items, buildSnapshot]
  );

  // Drain a queued mid-stream tap once the current turn settles.
  useEffect(() => {
    if (!busy && queuedTurnRef.current) {
      const next = queuedTurnRef.current;
      queuedTurnRef.current = null;
      void runTurn(next.userText, next.confirmedTool);
    }
  }, [busy, runTurn]);

  const sendMessage = useCallback((text: string) => runTurn(text), [runTurn]);

  const handleCardAction = useCallback(
    (action: CoachCardAction) => {
      switch (action.kind) {
        case "send_message":
        case "invoke_tool": {
          const text = formatActionAsMessage(action);
          if (text) void runTurn(text);
          break;
        }
        case "confirm_tool":
          void runTurn("Yes — go ahead.", { name: action.name, input: action.input });
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
    setItems([]);
    try {
      window.localStorage.removeItem(CHAT_KEY);
    } catch {
      // ignore
    }
    // Signed-in: archive the server conversation so a reload doesn't replay
    // it. Fire-and-forget; no-op for preview users.
    void fetch("/api/coach/history", { method: "DELETE" }).catch(() => {});
  }, []);

  return { items, busy, sendMessage, handleCardAction, newConversation };
}

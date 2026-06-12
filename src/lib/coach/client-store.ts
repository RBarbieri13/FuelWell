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
import { usePreferences } from "@/lib/use-preferences";
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
  try {
    const raw = window.localStorage.getItem("fuelwell-preferences-v1");
    const parsed = raw ? JSON.parse(raw) : {};
    const next = {
      ...parsed,
      ...(patch.diets ? { diets: patch.diets } : {}),
      ...(patch.allergies ? { allergies: patch.allergies } : {}),
    };
    window.localStorage.setItem("fuelwell-preferences-v1", JSON.stringify(next));
  } catch {
    // best-effort
  }
}

export function formatActionAsMessage(action: CoachCardAction): string | null {
  switch (action.kind) {
    case "send_message":
      return action.text;
    case "invoke_tool":
      return `Do this now with the ${action.name} tool: ${JSON.stringify(action.input)}`;
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

  const [items, setItems] = useState<ChatItem[]>(() => {
    const stored = loadStoredChat();
    if (stored?.items?.length) return stored.items.map((i) => ({ ...i, streaming: false }));
    return initialItems ?? [];
  });
  const [busy, setBusy] = useState(false);
  const conversationIdRef = useRef<string | undefined>(
    loadStoredChat()?.conversationId ?? initialConversationId
  );

  // Persist chat (preview replay; harmless for signed-in too).
  useEffect(() => {
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
  }, [items]);

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
      if (busy) return;
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
                patchAssistant((cur) => ({ artifacts: [...cur.artifacts, event.artifact] }));
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
      setBusy(false);
    },
    [busy, items, buildSnapshot]
  );

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
  }, []);

  return { items, busy, sendMessage, handleCardAction, newConversation };
}

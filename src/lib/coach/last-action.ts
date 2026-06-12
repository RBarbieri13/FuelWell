import type { CoachMutation } from "./types";

/**
 * Undo support: every write tool records the inverse mutations of what it
 * just did. undo_last_action pops and replays them within a 5-minute window.
 * In-memory per server instance — matches the session-scoped undo promise in
 * the chat UI ("Undo" on a card you just created).
 */

const WINDOW_MS = 5 * 60 * 1000;

type LastAction = { label: string; inverse: CoachMutation[]; at: number };

const lastByUser = new Map<string, LastAction>();

export function recordAction(userId: string, label: string, inverse: CoachMutation[]) {
  lastByUser.set(userId, { label, inverse, at: Date.now() });
}

export function popLastAction(userId: string): LastAction | null {
  const entry = lastByUser.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.at > WINDOW_MS) {
    lastByUser.delete(userId);
    return null;
  }
  lastByUser.delete(userId);
  return entry;
}

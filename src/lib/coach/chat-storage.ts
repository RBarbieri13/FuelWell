"use client";

export const PREVIEW_COACH_CHAT_SCOPE = "preview";

const CHAT_KEY_PREFIX = "fuelwell-coach-chat-v1";

let activeCoachChatScope = PREVIEW_COACH_CHAT_SCOPE;

export function coachChatStorageKey(scope: string): string {
  return `${CHAT_KEY_PREFIX}:${scope}`;
}

export function getCoachChatScope(): string {
  return activeCoachChatScope;
}

export function setCoachChatScope(scope: string): void {
  activeCoachChatScope = scope || PREVIEW_COACH_CHAT_SCOPE;
}

export function clearCoachChatScope(scope: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(coachChatStorageKey(scope));
    } catch {
      // Cache cleanup must never prevent the caller's primary action.
    }
  }
}

export function clearCoachChatForUser(userId: string): void {
  clearCoachChatScope(userId);

  if (activeCoachChatScope === userId) {
    activeCoachChatScope = PREVIEW_COACH_CHAT_SCOPE;
  }
}

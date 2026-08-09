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

export function clearCoachChatForUser(userId: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(coachChatStorageKey(userId));
    } catch {
      // Cache cleanup must never prevent sign-out.
    }
  }

  if (activeCoachChatScope === userId) {
    activeCoachChatScope = PREVIEW_COACH_CHAT_SCOPE;
  }
}

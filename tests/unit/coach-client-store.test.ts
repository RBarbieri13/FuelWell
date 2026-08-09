import { afterEach, describe, expect, it, vi } from "vitest";
import { todayIsoDate } from "@/lib/fuelwell-data";
import { resolveCoachHistoryHydration } from "@/lib/coach/client-store";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("coach client-store hydration", () => {
  it("treats signed-in empty server history as authoritative over stale local replay", () => {
    const result = resolveCoachHistoryHydration(
      {
        signedIn: true,
        userId: "user-b",
        conversationId: null,
        messages: [],
        hasMore: false,
        nextBefore: null,
      },
      {
        date: todayIsoDate(),
        conversationId: "stale-local-conversation",
        items: [
          {
            id: "chat-1",
            role: "assistant",
            text: "Leaked transcript",
            artifacts: [],
          },
        ],
      },
    );

    expect(result).toMatchObject({
      source: "server",
      scope: "user-b",
      conversationId: undefined,
      hasEarlier: false,
      nextBefore: null,
    });
    expect(result.items).toEqual([]);
  });
});

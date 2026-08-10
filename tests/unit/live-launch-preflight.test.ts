import { describe, expect, it, vi } from "vitest";

import { getLiveLaunchPreflight } from "@/lib/live-launch-preflight";

const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  AI_GATEWAY_API_KEY: "gateway-key",
};

describe("live launch preflight", () => {
  it("passes only after every live table and provider probe succeeds", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    const probeProvider = vi.fn().mockResolvedValue(undefined);

    const result = await getLiveLaunchPreflight({ fetcher, probeProvider, env });

    expect(result.liveReady).toBe(true);
    expect(result.liveChecks).toHaveLength(15);
    expect(fetcher).toHaveBeenCalledTimes(14);
    expect(probeProvider).toHaveBeenCalledOnce();
    expect(result.liveChecks.map((check) => check.id)).toContain("live-table-coach_knowledge_bases");
    expect(result.liveChecks.map((check) => check.id)).toContain("live-table-coach_confirmation_uses");
  });

  it("fails closed when a required table is absent", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response("[]", { status: 200 }))
      .mockResolvedValueOnce(new Response("[]", { status: 200 }))
      .mockResolvedValueOnce(new Response("missing", { status: 404 }))
      .mockResolvedValue(new Response("[]", { status: 200 }));

    const result = await getLiveLaunchPreflight({
      fetcher,
      probeProvider: vi.fn().mockResolvedValue(undefined),
      env,
    });

    expect(result.liveReady).toBe(false);
    expect(result.liveChecks).toContainEqual(expect.objectContaining({
      id: "live-table-workout_sessions",
      state: "fail",
      detail: "The live Data API returned HTTP 404.",
    }));
  });

  it("sanitizes provider failures without exposing raw credentials or messages", async () => {
    const result = await getLiveLaunchPreflight({
      fetcher: vi.fn().mockResolvedValue(new Response("[]", { status: 200 })),
      probeProvider: vi.fn().mockRejectedValue({
        status: 402,
        message: "credit balance secret-provider-detail",
      }),
      env,
    });

    expect(result.liveReady).toBe(false);
    const provider = result.liveChecks.find((check) => check.id === "live-coach-provider");
    expect(provider).toMatchObject({ state: "fail", detail: "The provider probe failed (billing_credit)." });
    expect(JSON.stringify(result)).not.toContain("secret-provider-detail");
  });
});

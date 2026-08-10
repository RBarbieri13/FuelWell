import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configured: true,
  user: { id: "user-a" } as { id: string } | null,
  load: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/lib/preview-session", () => ({
  hasSupabaseConfig: () => mocks.configured,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: mocks.user } })) },
  })),
}));

vi.mock("@/lib/meal-plan-repository", () => ({
  loadWeeklyMealPlan: mocks.load,
  replaceWeeklyMealPlan: mocks.replace,
}));

const days = [{
  id: "mon",
  label: "Mon",
  date: "Aug 10",
  iso: "2026-08-10",
  focus: "Training",
  meals: [],
}];

describe("/api/meal-plan", () => {
  beforeEach(() => {
    mocks.configured = true;
    mocks.user = { id: "user-a" };
    mocks.load.mockReset().mockResolvedValue([]);
    mocks.replace.mockReset().mockResolvedValue(days);
  });

  it("returns an authenticated empty week without substituting preview data", async () => {
    const { GET } = await import("@/app/api/meal-plan/route");
    const response = await GET(new Request("http://fuelwell.test/api/meal-plan?weekStart=2026-08-10"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      signedIn: true,
      userId: "user-a",
      weekStart: "2026-08-10",
      days: [],
    });
    expect(mocks.load).toHaveBeenCalledWith(expect.anything(), "user-a", "2026-08-10");
  });

  it("returns signed-out mode when Supabase is unavailable", async () => {
    mocks.configured = false;
    const { GET } = await import("@/app/api/meal-plan/route");
    const response = await GET(new Request("http://fuelwell.test/api/meal-plan?weekStart=2026-08-10"));
    await expect(response.json()).resolves.toEqual({ signedIn: false, days: [] });
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it("validates and replaces the authenticated user's complete week", async () => {
    const { PUT } = await import("@/app/api/meal-plan/route");
    const response = await PUT(new Request("http://fuelwell.test/api/meal-plan", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ weekStart: "2026-08-10", days }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.replace).toHaveBeenCalledWith(
      expect.anything(),
      "user-a",
      "2026-08-10",
      days,
    );
  });

  it("rejects signed-out writes and malformed week starts", async () => {
    const { GET, PUT } = await import("@/app/api/meal-plan/route");
    const invalid = await GET(new Request("http://fuelwell.test/api/meal-plan?weekStart=2026-08-11"));
    expect(invalid.status).toBe(400);

    mocks.user = null;
    const signedOut = await PUT(new Request("http://fuelwell.test/api/meal-plan", {
      method: "PUT",
      body: JSON.stringify({ weekStart: "2026-08-10", days }),
    }));
    expect(signedOut.status).toBe(401);
  });
});

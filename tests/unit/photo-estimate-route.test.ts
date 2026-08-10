import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  estimateFromDescription: vi.fn(),
  estimateFromImage: vi.fn(),
  getSupabaseDayCents: vi.fn(),
  hasSupabaseConfig: vi.fn(),
  insertSupabaseUsage: vi.fn(),
  currentUser: null as { id: string } | null,
}));

vi.mock("@/lib/food/photo-estimate", () => ({
  estimateFromDescription: mocks.estimateFromDescription,
  estimateFromImage: mocks.estimateFromImage,
}));

vi.mock("@/lib/preview-session", () => ({
  hasSupabaseConfig: mocks.hasSupabaseConfig,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/coach/persistence", () => ({
  getSupabaseDayCents: mocks.getSupabaseDayCents,
  insertSupabaseUsage: mocks.insertSupabaseUsage,
}));

const validImage = "data:image/png;base64,aaaa";
const descriptionCandidate = {
  name: "Chicken breast",
  portionLabel: "100 g",
  totals: { calories: 165, protein: 31, carbs: 0, fat: 4 },
  confidence: 0.52,
  source: "description_search" as const,
  sourceNote: "Review before saving.",
};

function post(body: unknown, headers?: HeadersInit) {
  return new Request("https://fuelwell.test/api/food/photo-estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("PHOTO_LOGGING_ENABLED", "true");
  mocks.currentUser = null;
  mocks.hasSupabaseConfig.mockReset();
  mocks.hasSupabaseConfig.mockReturnValue(true);
  mocks.createClient.mockReset();
  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mocks.currentUser },
        error: null,
      })),
    },
  });
  mocks.estimateFromDescription.mockReset();
  mocks.estimateFromDescription.mockReturnValue([descriptionCandidate]);
  mocks.estimateFromImage.mockReset();
  mocks.estimateFromImage.mockResolvedValue({
    enabled: true,
    candidates: [],
    reviewRequired: true,
    sourceNote: "AI photo estimate.",
  });
  mocks.getSupabaseDayCents.mockReset();
  mocks.getSupabaseDayCents.mockResolvedValue(0);
  mocks.insertSupabaseUsage.mockReset();
  mocks.insertSupabaseUsage.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("photo estimate route provider protection", () => {
  it("rejects unauthenticated paid image inference with zero provider calls", async () => {
    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const response = await POST(post({ imageDataUrl: validImage, description: "chicken" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Sign in to analyze a meal photo." });
    expect(mocks.estimateFromImage).not.toHaveBeenCalled();
    expect(mocks.getSupabaseDayCents).not.toHaveBeenCalled();
    expect(mocks.insertSupabaseUsage).not.toHaveBeenCalled();
  });

  it("allows an authenticated image estimate and records provider usage", async () => {
    mocks.currentUser = { id: "user-1" };
    mocks.estimateFromImage.mockImplementation(async (_input, options) => {
      await options?.onUsage?.({
        inputTokens: 120,
        outputTokens: 30,
        costUsdCents: 1,
        model: "claude-haiku-4-5",
      });
      return {
        enabled: true,
        candidates: [],
        reviewRequired: true,
        sourceNote: "AI photo estimate.",
      };
    });

    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const response = await POST(post({ imageDataUrl: validImage, description: "chicken" }));

    expect(response.status).toBe(200);
    expect(mocks.estimateFromImage).toHaveBeenCalledOnce();
    expect(mocks.insertSupabaseUsage).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-1",
        inputTokens: 120,
        outputTokens: 30,
        costUsdCents: 1,
        model: "claude-haiku-4-5",
      }),
    );
  });

  it("keeps description-only and disabled-mode requests deterministic", async () => {
    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const descriptionResponse = await POST(post({ description: "chicken" }));

    expect(descriptionResponse.status).toBe(200);
    expect(mocks.estimateFromDescription).toHaveBeenCalledWith("chicken");
    expect(mocks.estimateFromImage).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();

    vi.stubEnv("PHOTO_LOGGING_ENABLED", "false");
    const disabledResponse = await POST(post({ imageDataUrl: validImage, description: "chicken" }));

    expect(disabledResponse.status).toBe(200);
    expect(mocks.estimateFromImage).not.toHaveBeenCalled();
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects invalid and oversized input before auth or provider work", async () => {
    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const invalidResponse = await POST(post({
      imageDataUrl: "data:image/gif;base64,aaaa",
      description: "chicken",
    }));
    const oversizedResponse = await POST(post(
      { imageDataUrl: validImage },
      { "Content-Length": "8000000" },
    ));

    expect(invalidResponse.status).toBe(400);
    expect(oversizedResponse.status).toBe(413);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.estimateFromImage).not.toHaveBeenCalled();
  });

  it("refuses inference when the shared daily budget is exhausted", async () => {
    mocks.currentUser = { id: "user-1" };
    mocks.getSupabaseDayCents.mockResolvedValue(1_000);

    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const response = await POST(post({ imageDataUrl: validImage }));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.budgetExceeded).toBe(true);
    expect(body.error).not.toMatch(/anthropic|provider|api key/i);
    expect(mocks.estimateFromImage).not.toHaveBeenCalled();
    expect(mocks.insertSupabaseUsage).not.toHaveBeenCalled();
  });

  it("sanitizes unexpected provider failures", async () => {
    mocks.currentUser = { id: "user-1" };
    mocks.estimateFromImage.mockRejectedValue(new Error("secret provider account payload"));

    const { POST } = await import("@/app/api/food/photo-estimate/route");
    const response = await POST(post({ imageDataUrl: validImage }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ error: "Photo analysis is temporarily unavailable. Try again later." });
    expect(JSON.stringify(body)).not.toContain("secret provider account payload");
  });
});

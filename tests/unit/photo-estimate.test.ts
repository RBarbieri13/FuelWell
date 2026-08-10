import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { estimateFromDescription, estimateFromImage } from "@/lib/food/photo-estimate";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("@/lib/coach/provider-client", () => ({
  createCoachProviderClient: vi.fn(() => ({ messages: { create: mocks.create } })),
  providerModelCandidates: vi.fn(() => ["claude-haiku-4-5"]),
  resolveCoachProviderConfig: vi.fn(() => ({
    apiKey: "test-key",
    baseURL: "https://provider.test",
    credential: "direct-anthropic",
  })),
}));

describe("photo estimate", () => {
  beforeEach(() => {
    mocks.create.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates review candidates from a user description without auto-save", () => {
    const candidates = estimateFromDescription("chicken, rice, broccoli");
    expect(candidates.length).toBeGreaterThanOrEqual(2);
    expect(candidates[0].source).toBe("description_search");
  });

  it("honors the kill switch and reports that no image analysis ran", async () => {
    vi.stubEnv("PHOTO_LOGGING_ENABLED", "false");
    const result = await estimateFromImage({
      dataUrl: "data:image/png;base64,aaaa",
      description: "chicken",
    });
    expect(result.enabled).toBe(false);
    expect(result.reviewRequired).toBe(true);
    expect(result.sourceNote).toContain("kill switch");
    expect(result.candidates[0].name).toMatch(/chicken/i);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("reports successful vision usage for the shared cost ledger", async () => {
    vi.stubEnv("PHOTO_LOGGING_ENABLED", "true");
    mocks.create.mockResolvedValue({
      content: [{ type: "text", text: '{"foods":["chicken breast"]}' }],
      usage: { input_tokens: 120, output_tokens: 30 },
    });
    const onUsage = vi.fn();

    const result = await estimateFromImage(
      { dataUrl: "data:image/png;base64,aaaa" },
      { onUsage },
    );

    expect(result.enabled).toBe(true);
    expect(result.candidates[0]?.name).toMatch(/chicken/i);
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(onUsage).toHaveBeenCalledWith({
      inputTokens: 120,
      outputTokens: 30,
      costUsdCents: 1,
      model: "claude-haiku-4-5",
    });
  });
});

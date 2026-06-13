import { describe, expect, it, vi } from "vitest";
import { estimateFromDescription, estimateFromImage } from "@/lib/food/photo-estimate";

describe("photo estimate", () => {
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
    vi.unstubAllEnvs();
  });
});

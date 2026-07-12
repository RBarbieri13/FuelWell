import { afterEach, describe, expect, it, vi } from "vitest";
import { isPreviewHost } from "@/lib/preview-session";

describe("preview session boundary", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not infer preview access from a deployed hostname", () => {
    vi.stubEnv("FUELWELL_PREVIEW_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_FUELWELL_PREVIEW_MODE", "");

    expect(isPreviewHost("fuelwell-preview.vercel.app")).toBe(false);
    expect(isPreviewHost("fuelwell-candidate-123.vercel.app")).toBe(false);
    expect(isPreviewHost("app.fuelwell.com")).toBe(false);
  });

  it("allows an explicitly configured review deployment", () => {
    vi.stubEnv("FUELWELL_PREVIEW_MODE", "true");

    expect(isPreviewHost("fuelwell-review.vercel.app")).toBe(true);
  });

  it("keeps local development in preview mode", () => {
    vi.stubEnv("FUELWELL_PREVIEW_MODE", "");
    vi.stubEnv("NEXT_PUBLIC_FUELWELL_PREVIEW_MODE", "");

    expect(isPreviewHost("localhost:3000")).toBe(true);
    expect(isPreviewHost("127.0.0.1:3000")).toBe(true);
  });
});

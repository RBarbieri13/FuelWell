import { describe, expect, it } from "vitest";
import {
  providerModelId,
  providerModelCandidates,
  resolveCoachProviderConfig,
} from "@/lib/coach/provider-client";

describe("Coach provider routing", () => {
  it("uses an AI Gateway key before a direct provider key", () => {
    expect(resolveCoachProviderConfig({
      AI_GATEWAY_API_KEY: "gateway-key",
      ANTHROPIC_API_KEY: "anthropic-key",
    })).toMatchObject({
      provider: "vercel_ai_gateway",
      credential: "gateway-key",
      baseURL: "https://ai-gateway.vercel.sh",
    });
  });

  it("uses deployment OIDC for Gateway when a static Gateway key is absent", () => {
    expect(resolveCoachProviderConfig({
      VERCEL_OIDC_TOKEN: "deployment-token",
      ANTHROPIC_API_KEY: "anthropic-key",
    })?.provider).toBe("vercel_ai_gateway");
  });

  it("prefers an explicit Gateway key over blocked deployment OIDC", () => {
    expect(resolveCoachProviderConfig({
      VERCEL_OIDC_TOKEN: "deployment-token",
      AI_GATEWAY_API_KEY: "operator-key",
    })?.credential).toBe("operator-key");
  });

  it("falls back to direct Anthropic and reports missing configuration", () => {
    expect(resolveCoachProviderConfig({ ANTHROPIC_API_KEY: "direct-key" }))
      .toMatchObject({ provider: "anthropic", credential: "direct-key" });
    expect(resolveCoachProviderConfig({})).toBeNull();
  });

  it("uses creator-prefixed model ids only for Gateway", () => {
    const gateway = resolveCoachProviderConfig({ AI_GATEWAY_API_KEY: "key" })!;
    const direct = resolveCoachProviderConfig({ ANTHROPIC_API_KEY: "key" })!;
    expect(providerModelId(gateway, "claude-sonnet-4-6")).toBe("anthropic/claude-sonnet-4.6");
    expect(providerModelId(direct, "claude-sonnet-4-6")).toBe("claude-sonnet-4-6");
  });

  it("provides verified cross-model Gateway fallbacks", () => {
    const gateway = resolveCoachProviderConfig({ AI_GATEWAY_API_KEY: "key" })!;
    expect(providerModelCandidates(gateway, "claude-haiku-4-5")).toEqual([
      "anthropic/claude-haiku-4.5",
      "google/gemini-3-flash",
      "openai/gpt-5.4-mini",
    ]);
  });

  it("does not silently return to direct Anthropic in Vercel production", () => {
    expect(resolveCoachProviderConfig({
      VERCEL_ENV: "production",
      ANTHROPIC_API_KEY: "direct-key",
    })).toBeNull();
  });
});

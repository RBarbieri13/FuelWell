import { describe, expect, it } from "vitest";
import {
  providerModelId,
  resolveCoachProviderConfig,
} from "@/lib/coach/provider-client";

describe("Coach provider routing", () => {
  it("prefers an AI Gateway key over a direct provider key", () => {
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

  it("falls back to direct Anthropic and reports missing configuration", () => {
    expect(resolveCoachProviderConfig({ ANTHROPIC_API_KEY: "direct-key" }))
      .toMatchObject({ provider: "anthropic", credential: "direct-key" });
    expect(resolveCoachProviderConfig({})).toBeNull();
  });

  it("uses creator-prefixed model ids only for Gateway", () => {
    const gateway = resolveCoachProviderConfig({ AI_GATEWAY_API_KEY: "key" })!;
    const direct = resolveCoachProviderConfig({ ANTHROPIC_API_KEY: "key" })!;
    expect(providerModelId(gateway, "claude-sonnet-4-6")).toBe("anthropic/claude-sonnet-4-6");
    expect(providerModelId(direct, "claude-sonnet-4-6")).toBe("claude-sonnet-4-6");
  });
});

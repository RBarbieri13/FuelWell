import { afterEach, describe, expect, it, vi } from "vitest";
import { getLaunchPreflight } from "@/lib/launch-preflight";

afterEach(() => vi.unstubAllEnvs());

describe("launch preflight", () => {
  it("accepts deployment OIDC as the production Coach credential", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "deployment-token");
    const check = getLaunchPreflight().checks.find((candidate) => candidate.id === "coach-provider");
    expect(check?.state).toBe("pass");
  });

  it("does not count a direct Anthropic key as the production route", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "direct-only");
    const check = getLaunchPreflight().checks.find((candidate) => candidate.id === "coach-provider");
    expect(check?.state).toBe("fail");
  });

  it("requires goal and fitness ledger migrations for production", () => {
    const ids = getLaunchPreflight().checks.map((check) => check.id);
    expect(ids).toContain("goal-context-schema");
    expect(ids).toContain("fitness-grocery-schema");
    expect(ids).toContain("body-log-schema");
    expect(ids).toContain("profile-preferences-schema");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyProviderError,
  createSanitizedProviderIncident,
  describeProviderHealthForUser,
  getProviderHealth,
  recordProviderIncident,
} from "@/lib/coach/provider-health";

describe("provider error classification", () => {
  it.each([
    [{ message: "ANTHROPIC_API_KEY is missing" }, "missing_config"],
    [{ status: 401, error: { type: "authentication_error", message: "secret body" } }, "auth"],
    [{ status: 402, error: { code: "billing_error", message: "purchase credits" } }, "billing_credit"],
    [{ status: 403, error: { type: "permission_error", message: "model access denied" } }, "permission_model"],
    [{ status: 429, error: { type: "rate_limit_error", message: "slow down" } }, "rate_limit"],
    [{ name: "AbortError", message: "request timed out" }, "timeout"],
    [{ status: 503, error: { message: "upstream exploded" } }, "unavailable"],
  ])("classifies %j as %s", (error, expected) => {
    expect(classifyProviderError(error)).toBe(expected);
  });

  it("creates an allowlisted incident with no raw provider fields", () => {
    const raw = {
      status: 401,
      error: {
        type: "authentication_error",
        message: "raw secret provider JSON",
        request_id: "provider-request-secret",
      },
    };
    const incident = createSanitizedProviderIncident({
      failureClass: classifyProviderError(raw),
      statusCode: raw.status,
      model: "claude-haiku-4-5",
      occurredAt: "2026-07-12T12:00:00.000Z",
    });

    expect(incident).toEqual({
      provider: "anthropic",
      operation: "coach_turn",
      failureClass: "auth",
      occurredAt: "2026-07-12T12:00:00.000Z",
      retryable: false,
      statusCode: 401,
      model: "claude-haiku-4-5",
    });
    expect(JSON.stringify(incident)).not.toContain("raw secret");
    expect(JSON.stringify(incident)).not.toContain("provider-request-secret");
  });
});

describe("provider health", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call key presence healthy", () => {
    expect(getProviderHealth("configured-key")).toMatchObject({
      configured: true,
      healthy: false,
      state: "unverified",
    });
  });

  it("logs only the sanitized incident when persistence is unavailable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const incident = createSanitizedProviderIncident({
      failureClass: "billing_credit",
      statusCode: 402,
      occurredAt: "2026-07-12T12:00:00.000Z",
    });

    await recordProviderIncident(incident, async () => {
      throw new Error("database response with raw provider JSON");
    });

    expect(warn).toHaveBeenCalledWith("coach provider incident", incident);
    expect(JSON.stringify(warn.mock.calls)).not.toContain("database response");
  });
});

describe("describeProviderHealthForUser", () => {
  it("stays silent when the provider is healthy or merely unverified", () => {
    expect(describeProviderHealthForUser({ state: "healthy", lastFailureClass: null })).toBeNull();
    expect(
      describeProviderHealthForUser({ state: "unverified", lastFailureClass: null })
    ).toBeNull();
  });

  it("explains a missing configuration", () => {
    expect(
      describeProviderHealthForUser({ state: "missing_config", lastFailureClass: null })
    ).toMatch(/isn't configured/);
  });

  it.each([
    ["rate_limit", /rate-limiting/],
    ["timeout", /responding slowly/],
    ["billing_credit", /out of credit/],
    ["auth", /rejected FuelWell's credentials/],
    ["permission_model", /rejected FuelWell's credentials/],
    ["unavailable", /temporarily unavailable/],
  ] as const)("maps a degraded %s failure to readable copy", (failureClass, expected) => {
    expect(
      describeProviderHealthForUser({ state: "degraded", lastFailureClass: failureClass })
    ).toMatch(expected);
  });
});

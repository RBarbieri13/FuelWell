import { afterEach, describe, expect, it } from "vitest";
import {
  buildAppleAppSiteAssociation,
  GET,
} from "@/app/.well-known/apple-app-site-association/route";
import {
  parseNativeAuthCallback,
  safeNativeAuthNextPath,
} from "@/components/auth/native-oauth-bridge";

const previousTeamID = process.env.FUELWELL_APPLE_TEAM_ID;
const previousBundleID = process.env.FUELWELL_APP_IDENTIFIER;

afterEach(() => {
  if (previousTeamID === undefined) delete process.env.FUELWELL_APPLE_TEAM_ID;
  else process.env.FUELWELL_APPLE_TEAM_ID = previousTeamID;
  if (previousBundleID === undefined) delete process.env.FUELWELL_APP_IDENTIFIER;
  else process.env.FUELWELL_APP_IDENTIFIER = previousBundleID;
});

describe("FuelWell native authentication universal-link bridge", () => {
  it("publishes callback routes for the exact signed app identifier", () => {
    expect(buildAppleAppSiteAssociation("TEAM123", "com.fuelwell.app")).toEqual({
      applinks: {
        apps: [],
        details: [
          {
            appIDs: ["TEAM123.com.fuelwell.app"],
            components: [
              { "/": "/callback", comment: "FuelWell OAuth callback" },
              {
                "/": "/native-auth/*",
                comment: "FuelWell native authentication bridge",
              },
            ],
          },
        ],
      },
    });
  });

  it("fails closed when the Apple team identifier is not configured", async () => {
    delete process.env.FUELWELL_APPLE_TEAM_ID;
    const response = GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "FUELWELL_APPLE_TEAM_ID is required for universal links.",
    });
  });

  it("serves the configured application identifier", async () => {
    process.env.FUELWELL_APPLE_TEAM_ID = "TEAM123";
    process.env.FUELWELL_APP_IDENTIFIER = "com.fuelwell.app";
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      applinks: { details: [{ appIDs: ["TEAM123.com.fuelwell.app"] }] },
    });
  });
});

describe("FuelWell native authentication callback", () => {
  it("preserves a valid authorization code and trusted relative destination", () => {
    expect(parseNativeAuthCallback("?code=pkce-code&next=%2Fapp%2Fdashboard")).toEqual({
      code: "pkce-code",
      providerError: null,
      next: "/app/dashboard",
    });
  });

  it("preserves provider errors for the actionable callback state", () => {
    expect(parseNativeAuthCallback("?error_description=Access%20denied")).toEqual({
      code: null,
      providerError: "Access denied",
      next: "/app/dashboard",
    });
  });

  it.each([
    "https://attacker.example",
    "//attacker.example",
    "/\\attacker.example",
    "/app/dashboard\\@attacker.example",
    "/app/dashboard\u0000",
    "/login",
    "dashboard",
    null,
  ])(
    "rejects an unsafe next destination: %s",
    (next) => {
      const search = next === null ? "?code=pkce-code" : `?code=pkce-code&next=${encodeURIComponent(next)}`;
      expect(parseNativeAuthCallback(search).next).toBe("/app/dashboard");
    }
  );

  it("normalizes trusted app destinations without carrying fragments", () => {
    expect(safeNativeAuthNextPath("/app/coach?from=login#ignored")).toBe(
      "/app/coach?from=login"
    );
  });
});

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  deriveAgeRating,
  validatePrivacyInventoryDocument,
  validateSubmissionMetadataDocument,
} from "../../../tools/release/generate-app-store-readiness.mjs";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function readPrivacyManifest() {
  return JSON.parse(
    execFileSync(
      "plutil",
      [
        "-convert",
        "json",
        "-o",
        "-",
        path.join(root, "ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy"),
      ],
      { encoding: "utf8" },
    ),
  );
}

describe("App Store readiness repository gates", () => {
  it("fails readiness when critical product verifiers are absent", () => {
    const generator = readFileSync(
      path.join(root, "tools/release/generate-app-store-readiness.mjs"),
      "utf8",
    );

    expect(generator).toContain("validateRepositoryReleaseGates(results)");
    expect(generator).toContain("tests/unit/authenticated-storage-authority.test.ts");
    expect(generator).toContain("tests/unit/account-switch-isolation.test.ts");
    expect(generator).toContain("tests/unit/release/fuelwell-brand-release.test.ts");
    expect(generator).toContain("tests/testflight-live-coach.spec.ts");
    expect(generator).toContain("tests/testflight-authenticated-persistence.spec.ts");
    expect(generator).toContain("tools/release/verify-supabase-account-isolation.mjs");
    expect(generator).toContain("tests/mobile-component-clipping.spec.ts");
  });

  it("requires immutable candidate coverage on compact and large iPhones", () => {
    const generator = readFileSync(
      path.join(root, "tools/release/generate-app-store-readiness.mjs"),
      "utf8",
    );

    expect(generator).toContain("iPhone 16e");
    expect(generator).toContain("iPhone 17 Pro Max");
    expect(generator).toContain("FUELWELL_CANDIDATE_GIT_SHA");
    expect(generator).toContain("FUELWELL_SUPABASE_URL");
  });

  it("requires native OAuth, trusted navigation, and release permissions", () => {
    const generator = readFileSync(
      path.join(root, "tools/release/generate-app-store-readiness.mjs"),
      "utf8",
    );

    expect(generator).toContain("ASWebAuthenticationSession");
    expect(generator).toContain("WKNavigationAction");
    expect(generator).toContain("safeRelativePath");
    expect(generator).toContain("message.frameInfo.isMainFrame");
    expect(generator).toContain("message.frameInfo.securityOrigin");
    expect(generator).toContain("oauthOrigin");
    expect(generator).toContain("sameOrigin");
    expect(generator).toContain("openExternal");
    expect(generator).toContain("NSLocationWhenInUseUsageDescription");
    expect(generator).toContain("CFBundleURLTypes");
    expect(generator).toContain("FuelWellSupabaseURL");
    expect(generator).toContain("$(MARKETING_VERSION)");
    expect(generator).toContain("$(CURRENT_PROJECT_VERSION)");
  });

  it("requires live Google, Facebook, and Apple authorization checks before TestFlight", () => {
    const generator = readFileSync(
      path.join(root, "tools/release/generate-app-store-readiness.mjs"),
      "utf8",
    );

    expect(generator).toContain("Social OAuth provider handoff gate");
    expect(generator).toContain("/auth/v1/settings");
    expect(generator).toContain("for provider in google facebook apple");
    expect(generator).toContain(".external[$provider] == true");
    expect(generator).toContain("/auth/v1/authorize");
    expect(generator).toContain("accounts.google.com");
    expect(generator).toContain("facebook.com");
    expect(generator).toContain("appleid.apple.com");
  });

  it("owns complete App Store decisions and derives the declared age rating", () => {
    const submission = readJson("tools/release/data/app-store-submission.json");

    expect(validateSubmissionMetadataDocument(submission)).toEqual([]);
    expect(submission.app.categories).toEqual({
      primary: "Health & Fitness",
      secondary: "Food & Drink",
    });
    expect(submission.app.copyright).toMatch(/^2026 /);
    expect(submission.pricingAndAvailability).toMatchObject({
      price: "free",
      availability: "all_supported_storefronts",
    });
    expect(submission.contentRights.rightsConfirmed).toBe(true);
    expect(deriveAgeRating(submission.ageRating.answers)).toBe("9+");
    expect(submission.ageRating.result.finalGlobal).toBe("9+");
    expect(submission.review.signInRequired).toBe(true);
    expect(submission.review.demoAccount).not.toHaveProperty("username");
    expect(submission.review.demoAccount).not.toHaveProperty("password");
    expect(submission.review.demoAccount.usernameRef).toMatch(/^FUELWELL_APP_REVIEW_/);
    expect(submission.review.demoAccount.passwordRef).toMatch(/^FUELWELL_APP_REVIEW_/);
    expect(Buffer.byteLength(submission.review.notes, "utf8")).toBeLessThanOrEqual(4_000);
  });

  it("rejects stale age results and committed demo credentials", () => {
    const submission = readJson("tools/release/data/app-store-submission.json");
    submission.ageRating.answers.capabilities.unrestrictedWebAccess = true;
    submission.review.demoAccount.password = "must-not-be-committed";

    expect(validateSubmissionMetadataDocument(submission)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("derived 16+ rating"),
        expect.stringContaining("password must not be committed"),
      ]),
    );
  });

  it("reconciles the complete App Privacy inventory with PrivacyInfo.xcprivacy", () => {
    const inventory = readJson("tools/release/data/app-privacy-inventory.json");
    const manifest = readPrivacyManifest();

    expect(validatePrivacyInventoryDocument(inventory, manifest)).toEqual([]);
    expect(inventory.dataTypes.map((entry: { id: string }) => entry.id).sort()).toEqual([
      "account-email",
      "account-name",
      "account-user-id",
      "coach-free-form-and-documents",
      "crash-data",
      "fitness-activity",
      "nutrition-and-health",
      "photos-and-videos",
      "precise-location",
      "product-interaction",
    ]);
    expect(inventory.dataTypes.every((entry: { tracking: boolean }) => entry.tracking === false)).toBe(true);
    expect(manifest.NSPrivacyTracking).toBe(false);
    expect(manifest.NSPrivacyTrackingDomains).toEqual([]);
  });

  it("rejects privacy flag drift and missing inventory coverage", () => {
    const inventory = readJson("tools/release/data/app-privacy-inventory.json");
    const manifest = readPrivacyManifest();
    const health = manifest.NSPrivacyCollectedDataTypes.find(
      (entry: { NSPrivacyCollectedDataType: string }) =>
        entry.NSPrivacyCollectedDataType === "NSPrivacyCollectedDataTypeHealth",
    );
    health.NSPrivacyCollectedDataTypeLinked = false;
    inventory.dataTypes = inventory.dataTypes.filter(
      (entry: { id: string }) => entry.id !== "precise-location",
    );

    expect(validatePrivacyInventoryDocument(inventory, manifest)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Missing required privacy inventory row: precise-location"),
        expect.stringContaining("NSPrivacyCollectedDataTypeHealth linked-to-user flag"),
        expect.stringContaining("unowned data type NSPrivacyCollectedDataTypePreciseLocation"),
      ]),
    );
  });
});

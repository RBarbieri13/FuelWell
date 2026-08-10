import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

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
  });

  it("requires native OAuth, trusted navigation, and release permissions", () => {
    const generator = readFileSync(
      path.join(root, "tools/release/generate-app-store-readiness.mjs"),
      "utf8",
    );

    expect(generator).toContain("ASWebAuthenticationSession");
    expect(generator).toContain("WKNavigationAction");
    expect(generator).toContain("safeRelativePath");
    expect(generator).toContain("openExternal");
    expect(generator).toContain("NSLocationWhenInUseUsageDescription");
    expect(generator).toContain("CFBundleURLTypes");
  });
});

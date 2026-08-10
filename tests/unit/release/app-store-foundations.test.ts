import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SCREENSHOT_ATTESTATION_ALGORITHM,
  SCREENSHOT_ATTESTATION_KEY_ID,
  signScreenshotManifest,
  verifyScreenshotManifestAttestation
} from "../../../tools/release/screenshot-attestation.mjs";

const root = process.cwd();

describe("App Store foundations", () => {
  it("wires HealthKit entitlements into the iOS app target", () => {
    const entitlementsPath = path.join(root, "ios/FuelWellApp/FuelWellApp.entitlements");
    const projectSpecPath = path.join(root, "ios/project.yml");

    expect(existsSync(entitlementsPath)).toBe(true);
    expect(readFileSync(entitlementsPath, "utf8")).toContain("com.apple.developer.healthkit");
    expect(readFileSync(projectSpecPath, "utf8")).toContain(
      "CODE_SIGN_ENTITLEMENTS: FuelWellApp/FuelWellApp.entitlements"
    );
  });

  it("checks in repeatable Fastlane screenshot automation", () => {
    const snapfilePath = path.join(root, "ios/fastlane/Snapfile");
    const fastfilePath = path.join(root, "ios/fastlane/Fastfile");
    const uiTestsPath = path.join(root, "ios/FuelWellUITests/FuelWellCriticalPathUITests.swift");
    const helperPath = path.join(root, "ios/FuelWellUITests/SnapshotHelper.swift");

    const snapfile = readFileSync(snapfilePath, "utf8");
    const fastfile = readFileSync(fastfilePath, "utf8");
    const uiTests = readFileSync(uiTestsPath, "utf8");

    expect(snapfile).toContain('scheme("CandidateUITests")');
    expect(snapfile).toContain('output_directory("./fastlane/screenshots")');
    expect(snapfile).toContain('"iPhone 17 Pro Max"');
    expect(snapfile).toContain('"iPhone 15"');
    expect(existsSync(helperPath)).toBe(true);
    expect(fastfile).toContain("lane :screenshots do");
    expect(fastfile).toContain("ensure_app_store_screenshots!");
    expect(fastfile).toContain("write_screenshot_manifest!");
    expect(fastfile).toContain("Digest::SHA256.file(file).hexdigest");
    expect(fastfile).toContain("verify_screenshot_attestation!");
    expect(fastfile).toContain("ensure_screenshot_candidate_source!");
    expect(fastfile).toContain("Screenshot manifest #{key} does not match the release candidate");
    expect(uiTests).toContain("setupSnapshot(app)");
    expect(uiTests).toContain("snapshot(name, timeWaitingForIdle: 0)");
  });

  it("rejects screenshot manifests whose candidate fields or image hashes are changed", () => {
    const secret = "test-only-screenshot-attestation-secret-123456";
    const manifest = {
      schema_version: 1,
      captured_at: "2026-08-09T12:00:00Z",
      git_sha: "abc123",
      deployment_id: "dpl_123",
      deployment_url: "https://candidate.example.com",
      environment: "preview",
      package_version: "1.0.0",
      screenshots: { "en-US/iPhone-17-Pro-Max-dashboard.png": "a".repeat(64) },
      attestation: {
        algorithm: SCREENSHOT_ATTESTATION_ALGORITHM,
        key_id: SCREENSHOT_ATTESTATION_KEY_ID,
        value: ""
      }
    };
    manifest.attestation.value = signScreenshotManifest(manifest, secret);

    expect(verifyScreenshotManifestAttestation(manifest, secret)).toBe(true);
    expect(
      verifyScreenshotManifestAttestation({ ...manifest, git_sha: "different" }, secret)
    ).toBe(false);
    expect(
      verifyScreenshotManifestAttestation(
        {
          ...manifest,
          screenshots: {
            ...manifest.screenshots,
            "en-US/iPhone-17-Pro-Max-dashboard.png": "b".repeat(64)
          }
        },
        secret
      )
    ).toBe(false);
    expect(
      verifyScreenshotManifestAttestation(manifest, "wrong-secret-with-at-least-32-characters")
    ).toBe(false);
  });

  it("uses the checked-in revised brand artwork for the web logo and PWA icons", () => {
    const logoPath = path.join(root, "src/components/ui/logo.tsx");
    const manifestPath = path.join(root, "src/app/manifest.ts");

    expect(existsSync(path.join(root, "public/brand/fuelwell-lockup.png"))).toBe(true);
    expect(existsSync(path.join(root, "public/brand/fuelwell-lockup-ondark.png"))).toBe(true);
    expect(existsSync(path.join(root, "public/icon-192.png"))).toBe(true);
    expect(existsSync(path.join(root, "public/icon-512.png"))).toBe(true);
    expect(readFileSync(logoPath, "utf8")).toContain("/brand/fuelwell-lockup.png");
    expect(readFileSync(manifestPath, "utf8")).toContain("/icon-192.png");
    expect(readFileSync(manifestPath, "utf8")).toContain("/icon-512.png");
  });
});

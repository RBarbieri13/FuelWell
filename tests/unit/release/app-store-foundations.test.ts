import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

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
    expect(snapfile).toContain('"iPhone 16 Pro Max"');
    expect(snapfile).toContain('"iPhone 11 Pro Max"');
    expect(existsSync(helperPath)).toBe(true);
    expect(fastfile).toContain("lane :screenshots do");
    expect(fastfile).toContain("ensure_app_store_screenshots!");
    expect(uiTests).toContain("setupSnapshot(app)");
    expect(uiTests).toContain("snapshot(name, timeWaitingForIdle: 0)");
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

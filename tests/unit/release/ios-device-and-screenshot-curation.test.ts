import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const projectSpec = readFileSync(path.join(root, "ios/project.yml"), "utf8");
const xcodeProject = readFileSync(
  path.join(root, "ios/FuelWellApp.xcodeproj/project.pbxproj"),
  "utf8",
);
const snapfile = readFileSync(path.join(root, "ios/fastlane/Snapfile"), "utf8");
const uiTests = readFileSync(
  path.join(root, "ios/FuelWellUITests/FuelWellCriticalPathUITests.swift"),
  "utf8",
);

describe("iOS device and App Store screenshot curation", () => {
  it("ships the unreleased app for portrait-capable iPhone only", () => {
    expect(projectSpec).toContain('TARGETED_DEVICE_FAMILY: "1"');
    expect(projectSpec).not.toContain('TARGETED_DEVICE_FAMILY: "1,2"');
    expect(projectSpec).toMatch(
      /UISupportedInterfaceOrientations:\s*\n\s*- UIInterfaceOrientationPortrait/,
    );

    const appBuildSettings = xcodeProject.match(
      /PRODUCT_BUNDLE_IDENTIFIER = com\.fuelwell\.app;[\s\S]{0,300}?TARGETED_DEVICE_FAMILY = 1;/g,
    );
    expect(appBuildSettings).toHaveLength(2);
  });

  it("covers the 6.9-inch and 6.5-inch portrait screenshot families", () => {
    expect(snapfile).toContain('"iPhone 17 Pro Max"');
    expect(snapfile).toContain('"iPhone 13 Pro Max"');
    expect(snapfile).not.toMatch(/"iPad/);
    expect(uiTests).toContain("XCUIDevice.shared.orientation = .portrait");
  });

  it("allows Fastlane to run only the customer-facing screenshot journey", () => {
    expect(snapfile).toContain(
      '"FuelWellUITests/FuelWellCriticalPathUITests/testAppStoreCustomerScreenshots"',
    );
    expect(uiTests).toContain("func testAppStoreCustomerScreenshots()");
    expect(uiTests.match(/\bsnapshot\(/g)).toHaveLength(1);

    for (const excludedLabel of [
      "Welcome back",
      "Sign in",
      "Create your account",
      "Shell test home",
      "FuelWell could not load",
      "Choose File",
      "Photo Library",
      "Take Photo or Video",
    ]) {
      expect(uiTests).toContain(`"${excludedLabel}"`);
    }
  });
});

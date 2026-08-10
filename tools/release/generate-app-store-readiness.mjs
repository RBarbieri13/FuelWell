#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { verifyScreenshotManifestAttestation } from "./screenshot-attestation.mjs";

const root = process.cwd();
const metadataRoot = path.join(root, "ios/fastlane/metadata/en-US");
const screenshotsRoot = path.join(root, "ios/fastlane/screenshots/en-US");
const screenshotManifestPath = path.join(root, "ios/fastlane/screenshots/candidate-manifest.json");
const screenshotConfigPath = path.join(root, "ios/fastlane/Snapfile");
const snapshotHelperPath = path.join(root, "ios/FuelWellUITests/SnapshotHelper.swift");
const uiTestCapturePath = path.join(root, "ios/FuelWellUITests/FuelWellCriticalPathUITests.swift");
const privacyManifestPath = path.join(root, "ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy");
const healthKitEntitlementsPath = path.join(root, "ios/FuelWellApp/FuelWellApp.entitlements");
const infoPlistPath = path.join(root, "ios/FuelWellApp/Info.plist");
const shellRoutingPath = path.join(root, "ios/FuelWellApp/Sources/FuelWellShellRouting.swift");
const shellWebViewPath = path.join(root, "ios/FuelWellApp/Sources/FuelWellWebView.swift");
const projectSpecPath = path.join(root, "ios/project.yml");
const xcodeProjectPath = path.join(root, "ios/FuelWellApp.xcodeproj/project.pbxproj");
const candidateUiGatePath = path.join(root, "tools/release/test-ios-candidate-ui.sh");
const storageAuthorityTestPath = path.join(root, "tests/unit/authenticated-storage-authority.test.ts");
const accountIsolationTestPath = path.join(root, "tests/unit/account-switch-isolation.test.ts");
const brandReleaseTestPath = path.join(root, "tests/unit/release/fuelwell-brand-release.test.ts");
const liveCoachTestPath = path.join(root, "tests/testflight-live-coach.spec.ts");
const authenticatedPersistenceTestPath = path.join(root, "tests/testflight-authenticated-persistence.spec.ts");
const mobileContainmentTestPath = path.join(root, "tests/mobile-component-clipping.spec.ts");
const jsonOutputPath = path.join(root, "tools/release/data/app-store-readiness.json");
const markdownOutputPath = path.join(root, "docs/APP-STORE-READINESS.md");

const args = new Set(process.argv.slice(2));
const writeOutputs = args.has("--write");
const failOnBlockers = args.has("--strict");

const requiredMetadata = [
  { file: "name.txt", label: "App name", max: 30 },
  { file: "subtitle.txt", label: "Subtitle", max: 30 },
  { file: "promotional_text.txt", label: "Promotional text", max: 170 },
  { file: "description.txt", label: "Description", max: 4_000 },
  { file: "keywords.txt", label: "Keywords", max: 100 },
  { file: "release_notes.txt", label: "Release notes", max: 4_000 },
  { file: "marketing_url.txt", label: "Marketing URL", url: true },
  { file: "privacy_url.txt", label: "Privacy URL", url: true },
  { file: "support_url.txt", label: "Support URL", url: true }
];

const expectedPrivacyDataTypes = [
  "NSPrivacyCollectedDataTypeHealth",
  "NSPrivacyCollectedDataTypePhotosorVideos",
  "NSPrivacyCollectedDataTypeFitness",
  "NSPrivacyCollectedDataTypeCrashData",
  "NSPrivacyCollectedDataTypeProductInteraction"
];

const expectedPrivacyApiTypes = [
  "NSPrivacyAccessedAPICategoryFileTimestamp",
  "NSPrivacyAccessedAPICategoryUserDefaults"
];

const requiredEnv = [
  "FUELWELL_APP_IDENTIFIER",
  "FUELWELL_APPLE_ID",
  "FUELWELL_APPLE_TEAM_ID",
  "FUELWELL_APP_STORE_CONNECT_TEAM_ID",
  "FUELWELL_MATCH_GIT_URL",
  "FUELWELL_SCREENSHOT_ATTESTATION_KEY"
];

const requiredScreenshotFamilies = [
  { label: "Large iPhone", patterns: [/iphone.*17.*pro.*max/i] },
  { label: "Standard iPhone", patterns: [/iphone.*15/i] }
];

const requiredScreenshotDevices = ["iPhone 17 Pro Max", "iPhone 15"];
const screenshotExtensions = new Set([".png", ".jpg", ".jpeg"]);

function rel(filePath) {
  return path.relative(root, filePath);
}

function readTrimmed(filePath) {
  return readFileSync(filePath, "utf8").trim();
}

function listFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dir, entry.parentPath ?? "", entry.name));
}

function addResult(results, area, status, label, detail, filePath = null) {
  results.push({
    area,
    status,
    label,
    detail,
    file: filePath ? rel(filePath) : null
  });
}

function validateMetadata(results) {
  for (const item of requiredMetadata) {
    const filePath = path.join(metadataRoot, item.file);

    if (!existsSync(filePath)) {
      addResult(results, "metadata", "fail", `${item.label} missing`, `${item.file} is required by Fastlane deliver.`, filePath);
      continue;
    }

    const value = readTrimmed(filePath);
    if (!value) {
      addResult(results, "metadata", "fail", `${item.label} empty`, `${item.file} cannot be blank.`, filePath);
      continue;
    }

    if (item.url && !/^https:\/\/[^ ]+\.[^ ]+/.test(value)) {
      addResult(results, "metadata", "fail", `${item.label} URL invalid`, "Use a public https URL for App Review.", filePath);
      continue;
    }

    if (item.max && value.length > item.max) {
      addResult(results, "metadata", "fail", `${item.label} too long`, `${value.length}/${item.max} characters.`, filePath);
      continue;
    }

    addResult(results, "metadata", "pass", `${item.label} ready`, `${value.length}${item.max ? `/${item.max}` : ""} characters.`, filePath);
  }
}

function parsePlistJson(filePath) {
  const json = execFileSync("plutil", ["-convert", "json", "-o", "-", filePath], {
    cwd: root,
    encoding: "utf8"
  });

  return JSON.parse(json);
}

function validatePrivacyManifest(results) {
  if (!existsSync(privacyManifestPath)) {
    addResult(results, "privacy", "fail", "Privacy manifest missing", "PrivacyInfo.xcprivacy is required before App Store submission.", privacyManifestPath);
    return;
  }

  let manifest;
  try {
    manifest = parsePlistJson(privacyManifestPath);
  } catch (error) {
    addResult(results, "privacy", "fail", "Privacy manifest invalid", error.message, privacyManifestPath);
    return;
  }

  if (manifest.NSPrivacyTracking === false && Array.isArray(manifest.NSPrivacyTrackingDomains) && manifest.NSPrivacyTrackingDomains.length === 0) {
    addResult(results, "privacy", "pass", "Tracking disabled", "Manifest declares no tracking domains.", privacyManifestPath);
  } else {
    addResult(results, "privacy", "fail", "Tracking declaration needs review", "Expected NSPrivacyTracking=false and no tracking domains.", privacyManifestPath);
  }

  const dataTypes = new Set((manifest.NSPrivacyCollectedDataTypes ?? []).map((entry) => entry.NSPrivacyCollectedDataType));
  for (const type of expectedPrivacyDataTypes) {
    addResult(
      results,
      "privacy",
      dataTypes.has(type) ? "pass" : "fail",
      `Privacy data type: ${type}`,
      dataTypes.has(type) ? "Declared in privacy manifest." : "Missing from privacy manifest.",
      privacyManifestPath
    );
  }

  const apiTypes = new Set((manifest.NSPrivacyAccessedAPITypes ?? []).map((entry) => entry.NSPrivacyAccessedAPIType));
  for (const type of expectedPrivacyApiTypes) {
    addResult(
      results,
      "privacy",
      apiTypes.has(type) ? "pass" : "fail",
      `Required API type: ${type}`,
      apiTypes.has(type) ? "Declared in privacy manifest." : "Missing from privacy manifest.",
      privacyManifestPath
    );
  }
}

function validateHealthKitSigning(results) {
  if (!existsSync(healthKitEntitlementsPath)) {
    addResult(
      results,
      "signing",
      "fail",
      "HealthKit entitlements missing",
      "Commit the app entitlements file before signing a build that requests HealthKit data.",
      healthKitEntitlementsPath
    );
    return;
  }

  let entitlements;
  try {
    entitlements = parsePlistJson(healthKitEntitlementsPath);
  } catch (error) {
    addResult(results, "signing", "fail", "HealthKit entitlements invalid", error.message, healthKitEntitlementsPath);
    return;
  }

  addResult(
    results,
    "signing",
    entitlements["com.apple.developer.healthkit"] === true ? "pass" : "fail",
    "HealthKit entitlement enabled",
    entitlements["com.apple.developer.healthkit"] === true
      ? "The app entitlements declare HealthKit access."
      : "Set com.apple.developer.healthkit=true in the app entitlements file.",
    healthKitEntitlementsPath
  );

  const projectSpec = existsSync(projectSpecPath) ? readTrimmed(projectSpecPath) : "";
  const xcodeProject = existsSync(xcodeProjectPath) ? readTrimmed(xcodeProjectPath) : "";
  const entitlementsSetting = "FuelWellApp/FuelWellApp.entitlements";
  addResult(
    results,
    "signing",
    projectSpec.includes(`CODE_SIGN_ENTITLEMENTS: ${entitlementsSetting}`) ? "pass" : "fail",
    "XcodeGen source wires HealthKit entitlements",
    projectSpec.includes(`CODE_SIGN_ENTITLEMENTS: ${entitlementsSetting}`)
      ? "ios/project.yml points FuelWellApp at the committed entitlements file."
      : "Add CODE_SIGN_ENTITLEMENTS to ios/project.yml for FuelWellApp.",
    projectSpecPath
  );
  addResult(
    results,
    "signing",
    xcodeProject.includes(`CODE_SIGN_ENTITLEMENTS = ${entitlementsSetting};`) ? "pass" : "fail",
    "Generated Xcode project wires HealthKit entitlements",
    xcodeProject.includes(`CODE_SIGN_ENTITLEMENTS = ${entitlementsSetting};`)
      ? "FuelWellApp.xcodeproj carries the entitlements build setting."
      : "Regenerate and commit FuelWellApp.xcodeproj after wiring entitlements.",
    xcodeProjectPath
  );
}

function validateScreenshots(results) {
  if (!existsSync(screenshotConfigPath)) {
    addResult(
      results,
      "screenshots",
      "fail",
      "Fastlane screenshot config missing",
      "Commit ios/fastlane/Snapfile so screenshot capture stays repeatable.",
      screenshotConfigPath
    );
  } else {
    const snapfile = readTrimmed(screenshotConfigPath);
    addResult(results, "screenshots", "pass", "Fastlane screenshot config present", "Snapfile is committed.", screenshotConfigPath);
    addResult(
      results,
      "screenshots",
      requiredScreenshotDevices.every((device) => snapfile.includes(device)) ? "pass" : "fail",
      "Required screenshot devices configured",
      requiredScreenshotDevices.every((device) => snapfile.includes(device))
        ? "Snapfile covers the required App Store iPhone families."
        : "Snapfile must name both 6.7-inch and 6.5-inch screenshot simulators.",
      screenshotConfigPath
    );

    try {
      const availableDevices = execFileSync("xcrun", ["simctl", "list", "devices", "available"], {
        cwd: root,
        encoding: "utf8"
      });
      const missingDevices = requiredScreenshotDevices.filter((device) => !availableDevices.includes(device));
      addResult(
        results,
        "screenshots",
        missingDevices.length === 0 ? "pass" : "blocker",
        "Screenshot simulators installed",
        missingDevices.length === 0
          ? "Every Snapfile device is available in the installed Xcode runtime."
          : `Install or select runnable simulators for: ${missingDevices.join(", ")}.`,
        screenshotConfigPath
      );
    } catch (error) {
      addResult(
        results,
        "screenshots",
        "blocker",
        "Screenshot simulators unverified",
        `Could not query the installed Xcode simulator runtime: ${error.message}`,
        screenshotConfigPath
      );
    }
  }

  addResult(
    results,
    "screenshots",
    existsSync(snapshotHelperPath) ? "pass" : "fail",
    "Snapshot helper committed",
    existsSync(snapshotHelperPath)
      ? "FuelWellUITests includes Fastlane's SnapshotHelper.swift."
      : "Add SnapshotHelper.swift to the UI test target so fastlane can write screenshots.",
    snapshotHelperPath
  );

  const uiTestSource = existsSync(uiTestCapturePath) ? readTrimmed(uiTestCapturePath) : "";
  addResult(
    results,
    "screenshots",
    uiTestSource.includes("setupSnapshot(app)") && uiTestSource.includes("snapshot(") ? "pass" : "fail",
    "UI tests emit fastlane snapshots",
    uiTestSource.includes("setupSnapshot(app)") && uiTestSource.includes("snapshot(")
      ? "Candidate UI tests call setupSnapshot(app) and snapshot(...)."
      : "Candidate UI tests must call setupSnapshot(app) plus snapshot(...) to generate store assets.",
    uiTestCapturePath
  );

  const screenshotFiles = listFiles(screenshotsRoot).filter((filePath) =>
    screenshotExtensions.has(path.extname(filePath).toLowerCase())
  );
  const screenshotCount = screenshotFiles.length;
  if (screenshotCount === 0) {
    addResult(results, "screenshots", "blocker", "App Store screenshots missing", "No screenshots are present under ios/fastlane/screenshots/en-US.", screenshotsRoot);
    return;
  }

  const files = screenshotFiles.map((filePath) => path.relative(screenshotsRoot, filePath));
  addResult(results, "screenshots", "pass", "Screenshot files present", `${screenshotCount} screenshot file(s) found.`, screenshotsRoot);

  for (const family of requiredScreenshotFamilies) {
    const matched = files.some((file) => family.patterns.some((pattern) => pattern.test(file)));
    addResult(
      results,
      "screenshots",
      matched ? "pass" : "blocker",
      `${family.label} screenshots`,
      matched ? "Required screenshot family appears present." : "Add screenshots named for this App Store device family.",
      screenshotsRoot
    );
  }


  if (!existsSync(screenshotManifestPath)) {
    addResult(results, "screenshots", "blocker", "Candidate screenshot manifest missing", "Recapture screenshots from the immutable candidate so provenance and hashes can be verified.", screenshotManifestPath);
    return;
  }

  try {
    const manifest = JSON.parse(readTrimmed(screenshotManifestPath));
    const manifestScreenshots = manifest.screenshots ?? {};
    const expectedFiles = screenshotFiles.map((filePath) => path.relative(path.dirname(screenshotsRoot), filePath)).sort();
    const manifestFiles = Object.keys(manifestScreenshots).sort();
    const hashesMatch = expectedFiles.length === manifestFiles.length && expectedFiles.every((file, index) => {
      if (file !== manifestFiles[index]) return false;
      const digest = createHash("sha256").update(readFileSync(path.join(path.dirname(screenshotsRoot), file))).digest("hex");
      return manifestScreenshots[file] === digest;
    });
    const requiredProvenance = ["git_sha", "deployment_id", "deployment_url", "environment", "package_version"];
    const provenancePresent = requiredProvenance.every((key) => typeof manifest[key] === "string" && manifest[key].trim());
    const attestationKey = process.env.FUELWELL_SCREENSHOT_ATTESTATION_KEY ?? "";
    const attestationValid = verifyScreenshotManifestAttestation(manifest, attestationKey);
    addResult(
      results,
      "screenshots",
      hashesMatch && provenancePresent && attestationValid ? "pass" : "blocker",
      "Screenshot candidate provenance",
      hashesMatch && provenancePresent && attestationValid
        ? "Every screenshot hash and candidate field is covered by a protected attestation."
        : "The screenshot manifest is unsigned, incomplete, stale, or does not match every captured image.",
      screenshotManifestPath
    );
  } catch (error) {
    addResult(results, "screenshots", "blocker", "Candidate screenshot manifest invalid", error.message, screenshotManifestPath);
  }
}

function validateHumanGates(results) {
  for (const name of requiredEnv) {
    addResult(
      results,
      "human-gates",
      process.env[name] ? "pass" : "blocker",
      `${name} configured`,
      process.env[name] ? "Environment variable is present." : "Required for Fastlane beta/release, but should not be committed.",
      null
    );
  }

  addResult(
    results,
    "human-gates",
    "blocker",
    "App Store submission requires Robert",
    "The release lane intentionally sets submit_for_review=false; App Review submission is a Vital Question.",
    "ios/fastlane/Fastfile"
  );
}

function validateRepositoryReleaseGates(results) {
  const requiredEvidence = [
    {
      label: "Authenticated storage authority regression",
      filePath: storageAuthorityTestPath,
      detail: "A repository test must reject browser-authoritative signed-in state."
    },
    {
      label: "Account-switch isolation regression",
      filePath: accountIsolationTestPath,
      detail: "A repository test must cover user A signing out before user B signs in."
    },
    {
      label: "Release brand regression",
      filePath: brandReleaseTestPath,
      detail: "A repository test must protect the approved web and native logo assets."
    },
    {
      label: "Authenticated persistence journey",
      filePath: authenticatedPersistenceTestPath,
      detail: "The immutable candidate gate must prove signed-in data survives navigation and reload."
    },
    {
      label: "Live Coach journey",
      filePath: liveCoachTestPath,
      detail: "The immutable candidate gate must prove real Coach inference instead of a fallback response."
    },
    {
      label: "Phone containment journey",
      filePath: mobileContainmentTestPath,
      detail: "The candidate gate must reject whole-page horizontal overflow at supported phone widths."
    }
  ];

  for (const evidence of requiredEvidence) {
    addResult(
      results,
      "repository-gates",
      existsSync(evidence.filePath) ? "pass" : "fail",
      evidence.label,
      existsSync(evidence.filePath) ? "Required verifier is committed." : evidence.detail,
      evidence.filePath
    );
  }

  const candidateGate = existsSync(candidateUiGatePath) ? readTrimmed(candidateUiGatePath) : "";
  const coversCompactAndLarge = candidateGate.includes("iPhone 16e")
    && candidateGate.includes("iPhone 17 Pro Max")
    && candidateGate.includes("FUELWELL_CANDIDATE_GIT_SHA")
    && candidateGate.includes("FUELWELL_SUPABASE_URL")
    && candidateGate.includes("testflight-live-coach.spec.ts")
    && candidateGate.includes("testflight-authenticated-persistence.spec.ts");
  addResult(
    results,
    "repository-gates",
    coversCompactAndLarge ? "pass" : "fail",
    "Immutable candidate device and live-service gate",
    coversCompactAndLarge
      ? "The candidate script binds an exact Git SHA and runs live Coach and persistence journeys on compact and large iPhones."
      : "The candidate script must bind an exact Git SHA, test live Coach and persistence, and run on compact and large iPhones.",
    candidateUiGatePath
  );

  const shellRouting = existsSync(shellRoutingPath) ? readTrimmed(shellRoutingPath) : "";
  const shellWebView = existsSync(shellWebViewPath) ? readTrimmed(shellWebViewPath) : "";
  const nativeShellCovered = shellWebView.includes("ASWebAuthenticationSession")
    && shellWebView.includes("WKNavigationAction")
    && shellWebView.includes("message.frameInfo.isMainFrame")
    && shellWebView.includes("message.frameInfo.securityOrigin")
    && shellRouting.includes("safeRelativePath")
    && shellRouting.includes("oauthOrigin")
    && shellRouting.includes("sameOrigin")
    && shellRouting.includes("openExternal")
    && shellWebView.includes("openExternally");
  addResult(
    results,
    "repository-gates",
    nativeShellCovered ? "pass" : "fail",
    "Native OAuth and trusted navigation shell",
    nativeShellCovered
      ? "The iOS shell separates OAuth/external navigation from trusted in-app routes."
      : "The iOS shell must use a native authentication session, enforce trusted navigation, and validate relative routes.",
    shellWebViewPath
  );

  const infoPlist = existsSync(infoPlistPath) ? readTrimmed(infoPlistPath) : "";
  const permissionAndCallbackCoverage = infoPlist.includes("NSLocationWhenInUseUsageDescription")
    && infoPlist.includes("CFBundleURLTypes")
    && infoPlist.includes("FuelWellSupabaseURL")
    && infoPlist.includes("$(MARKETING_VERSION)")
    && infoPlist.includes("$(CURRENT_PROJECT_VERSION)");
  addResult(
    results,
    "repository-gates",
    permissionAndCallbackCoverage ? "pass" : "fail",
    "iOS permission and OAuth callback declarations",
    permissionAndCallbackCoverage
      ? "Location, callback, exact OAuth origin, and build-version substitutions are declared."
      : "Declare location, callback, exact OAuth origin, and build-version substitutions before shipping the signed app.",
    infoPlistPath
  );
}

function summarize(results) {
  const counts = { pass: 0, blocker: 0, fail: 0 };
  for (const result of results) {
    counts[result.status] += 1;
  }

  return {
    status: counts.fail > 0 ? "failed" : counts.blocker > 0 ? "externally_blocked" : "ready",
    counts
  };
}

function renderMarkdown(report) {
  const statusLabel = {
    ready: "Ready",
    externally_blocked: "Externally Blocked",
    failed: "Failed"
  }[report.status];

  const lines = [
    "# FuelWell App Store Readiness",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${statusLabel}`,
    "",
    "This snapshot checks repository-owned TestFlight and App Store evidence. It does not perform Apple Developer, TestFlight, paid-account, or App Review actions.",
    "",
    "## Summary",
    "",
    `- Passed: ${report.counts.pass}`,
    `- Human/external blockers: ${report.counts.blocker}`,
    `- Failures: ${report.counts.fail}`,
    "",
    "## Checks",
    "",
    "| Area | Status | Check | Detail | File |",
    "|---|---:|---|---|---|"
  ];

  for (const result of report.results) {
    lines.push(`| ${result.area} | ${result.status} | ${result.label} | ${result.detail} | ${result.file ?? ""} |`);
  }

  lines.push(
    "",
    "## Next Actions",
    "",
    "- Run `bundle exec fastlane ios screenshots` from `ios/` after the immutable candidate, App Store Connect env vars, and a Bundler 2.6.9-compatible Ruby environment are ready.",
    "- Configure Apple/Fastlane environment variables locally or in CI secrets before running `fastlane beta`.",
    "- Keep App Review submission manual; Robert must approve before any public submission."
  );

  return `${lines.join("\n")}\n`;
}

const results = [];
validateMetadata(results);
validatePrivacyManifest(results);
validateHealthKitSigning(results);
validateScreenshots(results);
validateRepositoryReleaseGates(results);
validateHumanGates(results);

const summary = summarize(results);
const report = {
  generatedAt: new Date().toISOString(),
  status: summary.status,
  counts: summary.counts,
  paths: {
    metadata: rel(metadataRoot),
    screenshots: rel(screenshotsRoot),
    screenshotConfig: rel(screenshotConfigPath),
    privacyManifest: rel(privacyManifestPath),
    healthKitEntitlements: rel(healthKitEntitlementsPath)
  },
  results
};

if (writeOutputs) {
  mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownOutputPath, renderMarkdown(report));
}

console.log(renderMarkdown(report));

if (report.status === "failed") {
  process.exit(1);
}

if (report.status === "externally_blocked") {
  process.exit(failOnBlockers ? 1 : 3);
}

#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const metadataRoot = path.join(root, "ios/fastlane/metadata/en-US");
const screenshotsRoot = path.join(root, "ios/fastlane/screenshots/en-US");
const privacyManifestPath = path.join(root, "ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy");
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
  "FUELWELL_MATCH_GIT_URL"
];

const requiredScreenshotFamilies = [
  { label: "iPhone 6.7-inch", patterns: [/iphone.*6\.7/i, /iphone.*15.*pro.*max/i, /iphone.*16.*pro.*max/i] },
  { label: "iPhone 6.5-inch", patterns: [/iphone.*6\.5/i, /iphone.*11.*pro.*max/i, /iphone.*xs.*max/i] }
];

function rel(filePath) {
  return path.relative(root, filePath);
}

function readTrimmed(filePath) {
  return readFileSync(filePath, "utf8").trim();
}

function countFiles(dir) {
  if (!existsSync(dir)) {
    return 0;
  }

  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .length;
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

function parsePrivacyManifest() {
  const json = execFileSync("plutil", ["-convert", "json", "-o", "-", privacyManifestPath], {
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
    manifest = parsePrivacyManifest();
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

function validateScreenshots(results) {
  const screenshotCount = countFiles(screenshotsRoot);
  if (screenshotCount === 0) {
    addResult(results, "screenshots", "blocker", "App Store screenshots missing", "No screenshots are present under ios/fastlane/screenshots/en-US.", screenshotsRoot);
    return;
  }

  const files = readdirSync(screenshotsRoot, { recursive: true }).map(String);
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
    "- Add final App Store screenshots under `ios/fastlane/screenshots/en-US/` once the pilot build UI is locked.",
    "- Configure Apple/Fastlane environment variables locally or in CI secrets before running `fastlane beta`.",
    "- Keep App Review submission manual; Robert must approve before any public submission."
  );

  return `${lines.join("\n")}\n`;
}

const results = [];
validateMetadata(results);
validatePrivacyManifest(results);
validateScreenshots(results);
validateHumanGates(results);

const report = {
  generatedAt: new Date().toISOString(),
  status: summarize(results).status,
  counts: summarize(results).counts,
  paths: {
    metadata: rel(metadataRoot),
    screenshots: rel(screenshotsRoot),
    privacyManifest: rel(privacyManifestPath)
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

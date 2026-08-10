#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
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
const fastfilePath = path.join(root, "ios/fastlane/Fastfile");
const storageAuthorityTestPath = path.join(root, "tests/unit/authenticated-storage-authority.test.ts");
const accountIsolationTestPath = path.join(root, "tests/unit/account-switch-isolation.test.ts");
const brandReleaseTestPath = path.join(root, "tests/unit/release/fuelwell-brand-release.test.ts");
const liveCoachTestPath = path.join(root, "tests/testflight-live-coach.spec.ts");
const authenticatedPersistenceTestPath = path.join(root, "tests/testflight-authenticated-persistence.spec.ts");
const accountIsolationGatePath = path.join(root, "tools/release/verify-supabase-account-isolation.mjs");
const mobileContainmentTestPath = path.join(root, "tests/mobile-component-clipping.spec.ts");
const privacyPagePath = path.join(root, "src/app/privacy/page.tsx");
const supportPagePath = path.join(root, "src/app/support/page.tsx");
const submissionMetadataPath = path.join(root, "tools/release/data/app-store-submission.json");
const privacyInventoryPath = path.join(root, "tools/release/data/app-privacy-inventory.json");
const jsonOutputPath = path.join(root, "tools/release/data/app-store-readiness.json");
const markdownOutputPath = path.join(root, "docs/APP-STORE-READINESS.md");
const publicListingOrigin = "https://fuelwell-preview.vercel.app";

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

const expectedPrivacyApiTypes = [
  "NSPrivacyAccessedAPICategoryFileTimestamp",
  "NSPrivacyAccessedAPICategoryUserDefaults"
];

const requiredEnv = [
  "FUELWELL_APP_IDENTIFIER",
  "FUELWELL_APPLE_ID",
  "FUELWELL_APPLE_TEAM_ID",
  "FUELWELL_MATCH_GIT_URL"
];

const requiredScreenshotFamilies = [
  { label: "Large iPhone", patterns: [/iphone.*17.*pro.*max/i] },
  { label: "Standard iPhone", patterns: [/iphone.*15/i] }
];

const requiredScreenshotDevices = ["iPhone 17 Pro Max", "iPhone 15"];
const screenshotExtensions = new Set([".png", ".jpg", ".jpeg"]);
const appStoreCategories = new Set([
  "Books",
  "Business",
  "Developer Tools",
  "Education",
  "Entertainment",
  "Finance",
  "Food & Drink",
  "Games",
  "Graphics & Design",
  "Health & Fitness",
  "Kids",
  "Lifestyle",
  "Magazines & Newspapers",
  "Medical",
  "Music",
  "Navigation",
  "News",
  "Photo & Video",
  "Productivity",
  "Reference",
  "Shopping",
  "Social Networking",
  "Sports",
  "Travel",
  "Utilities",
  "Weather"
]);
const ageRatingFrequencyValues = new Set(["none", "infrequent", "frequent"]);
const ageRatingAnswerSchema = {
  inAppControls: {
    parentalControls: "boolean",
    ageAssurance: "boolean"
  },
  capabilities: {
    unrestrictedWebAccess: "boolean",
    userGeneratedContent: "boolean",
    socialMedia: "boolean",
    socialMediaDisabledForUsersUnder13: "boolean",
    messagingAndChat: "boolean",
    advertising: "boolean"
  },
  matureThemes: {
    profanityOrCrudeHumor: "frequency",
    horrorOrFearThemes: "frequency",
    alcoholTobaccoOrDrugUseOrReferences: "frequency"
  },
  medicalOrWellness: {
    medicalOrTreatmentInformation: "frequency",
    healthOrWellnessTopics: "frequency"
  },
  sexualityOrNudity: {
    matureOrSuggestiveThemes: "frequency",
    sexualContentOrNudity: "frequency",
    graphicSexualContentAndNudity: "frequency"
  },
  violence: {
    cartoonOrFantasyViolence: "frequency",
    realisticViolence: "frequency",
    prolongedGraphicOrSadisticRealisticViolence: "frequency",
    gunsOrOtherWeapons: "frequency"
  },
  chanceBasedActivities: {
    gambling: "boolean",
    simulatedGambling: "frequency",
    contests: "frequency",
    lootBoxes: "boolean"
  }
};
const requiredPrivacyInventory = new Map([
  ["account-name", ["Contact Info", "Name", "NSPrivacyCollectedDataTypeName"]],
  ["account-email", ["Contact Info", "Email Address", "NSPrivacyCollectedDataTypeEmailAddress"]],
  ["account-user-id", ["Identifiers", "User ID", "NSPrivacyCollectedDataTypeUserID"]],
  ["coach-free-form-and-documents", ["User Content", "Other User Content", "NSPrivacyCollectedDataTypeOtherUserContent"]],
  ["nutrition-and-health", ["Health & Fitness", "Health", "NSPrivacyCollectedDataTypeHealth"]],
  ["fitness-activity", ["Health & Fitness", "Fitness", "NSPrivacyCollectedDataTypeFitness"]],
  ["photos-and-videos", ["User Content", "Photos or Videos", "NSPrivacyCollectedDataTypePhotosorVideos"]],
  ["precise-location", ["Location", "Precise Location", "NSPrivacyCollectedDataTypePreciseLocation"]],
  ["product-interaction", ["Usage Data", "Product Interaction", "NSPrivacyCollectedDataTypeProductInteraction"]],
  ["crash-data", ["Diagnostics", "Crash Data", "NSPrivacyCollectedDataTypeCrashData"]]
]);
const privacyPurposeValues = new Set([
  "NSPrivacyCollectedDataTypePurposeThirdPartyAdvertising",
  "NSPrivacyCollectedDataTypePurposeDeveloperAdvertising",
  "NSPrivacyCollectedDataTypePurposeAnalytics",
  "NSPrivacyCollectedDataTypePurposeProductPersonalization",
  "NSPrivacyCollectedDataTypePurposeAppFunctionality",
  "NSPrivacyCollectedDataTypePurposeOther"
]);

function rel(filePath) {
  return path.relative(root, filePath);
}

function readTrimmed(filePath) {
  return readFileSync(filePath, "utf8").trim();
}

function readJson(filePath) {
  return JSON.parse(readTrimmed(filePath));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function sameMembers(left, right) {
  return left.length === right.length
    && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function ratingForFrequency(value, infrequentRating, frequentRating = infrequentRating) {
  if (value === "frequent") return frequentRating;
  if (value === "infrequent") return infrequentRating;
  return "4+";
}

export function deriveAgeRating(answers) {
  const ratings = ["4+", "9+", "13+", "16+", "18+"];
  let ratingIndex = 0;
  const raiseTo = (rating) => {
    ratingIndex = Math.max(ratingIndex, ratings.indexOf(rating));
  };

  const capabilities = answers?.capabilities ?? {};
  const matureThemes = answers?.matureThemes ?? {};
  const medicalOrWellness = answers?.medicalOrWellness ?? {};
  const sexualityOrNudity = answers?.sexualityOrNudity ?? {};
  const violence = answers?.violence ?? {};
  const chanceBasedActivities = answers?.chanceBasedActivities ?? {};

  if (sexualityOrNudity.graphicSexualContentAndNudity !== "none"
    || violence.prolongedGraphicOrSadisticRealisticViolence !== "none") {
    return "Unrated";
  }

  if (capabilities.unrestrictedWebAccess) raiseTo("16+");
  if (capabilities.socialMedia || capabilities.socialMediaDisabledForUsersUnder13) raiseTo("13+");

  raiseTo(ratingForFrequency(matureThemes.profanityOrCrudeHumor, "9+", "13+"));
  raiseTo(ratingForFrequency(matureThemes.horrorOrFearThemes, "9+", "13+"));
  raiseTo(ratingForFrequency(matureThemes.alcoholTobaccoOrDrugUseOrReferences, "13+", "18+"));
  if (medicalOrWellness.healthOrWellnessTopics !== "none") raiseTo("9+");
  raiseTo(ratingForFrequency(medicalOrWellness.medicalOrTreatmentInformation, "13+", "16+"));
  raiseTo(ratingForFrequency(sexualityOrNudity.matureOrSuggestiveThemes, "9+", "16+"));
  raiseTo(ratingForFrequency(sexualityOrNudity.sexualContentOrNudity, "13+", "18+"));
  raiseTo(ratingForFrequency(violence.cartoonOrFantasyViolence, "9+", "13+"));
  raiseTo(ratingForFrequency(violence.realisticViolence, "13+", "18+"));
  raiseTo(ratingForFrequency(violence.gunsOrOtherWeapons, "9+", "13+"));
  if (chanceBasedActivities.gambling) raiseTo("18+");
  raiseTo(ratingForFrequency(chanceBasedActivities.simulatedGambling, "13+", "18+"));
  if (chanceBasedActivities.contests === "frequent") raiseTo("13+");
  if (chanceBasedActivities.lootBoxes) raiseTo("9+");

  return ratings[ratingIndex];
}

export function validateSubmissionMetadataDocument(document) {
  const errors = [];
  if (!isRecord(document)) return ["Submission metadata must be a JSON object."];

  if (document.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(document.lastReviewed ?? "")) {
    errors.push("lastReviewed must use YYYY-MM-DD.");
  }

  const app = isRecord(document.app) ? document.app : {};
  for (const field of ["name", "bundleId", "version", "primaryLanguage", "copyright"]) {
    if (typeof app[field] !== "string" || !app[field].trim()) {
      errors.push(`app.${field} must be a non-empty string.`);
    }
  }
  if (!/^\d{4} .+/.test(app.copyright ?? "")) {
    errors.push("app.copyright must start with the four-digit rights year and owner name.");
  }

  const categories = isRecord(app.categories) ? app.categories : {};
  if (!appStoreCategories.has(categories.primary)) {
    errors.push("app.categories.primary must be a recognized App Store category.");
  }
  if (!appStoreCategories.has(categories.secondary)) {
    errors.push("app.categories.secondary must be a recognized App Store category.");
  }
  if (categories.primary === categories.secondary) {
    errors.push("Primary and secondary App Store categories must differ.");
  }

  const ageRating = isRecord(document.ageRating) ? document.ageRating : {};
  if (ageRating.questionnaireVersion !== "ios-26-and-later") {
    errors.push("ageRating.questionnaireVersion must be ios-26-and-later.");
  }
  const answers = isRecord(ageRating.answers) ? ageRating.answers : {};
  for (const [group, schema] of Object.entries(ageRatingAnswerSchema)) {
    const groupAnswers = isRecord(answers[group]) ? answers[group] : {};
    const expectedKeys = Object.keys(schema);
    const actualKeys = Object.keys(groupAnswers);
    if (!sameMembers(actualKeys, expectedKeys)) {
      errors.push(`ageRating.answers.${group} must contain every current questionnaire field and no unknown fields.`);
      continue;
    }

    for (const [field, valueType] of Object.entries(schema)) {
      const value = groupAnswers[field];
      if (valueType === "boolean" && typeof value !== "boolean") {
        errors.push(`ageRating.answers.${group}.${field} must be boolean.`);
      }
      if (valueType === "frequency" && !ageRatingFrequencyValues.has(value)) {
        errors.push(`ageRating.answers.${group}.${field} must be none, infrequent, or frequent.`);
      }
    }
  }
  if (answers.capabilities?.socialMediaDisabledForUsersUnder13 && !answers.capabilities?.socialMedia) {
    errors.push("Social media cannot be disabled for users under 13 when the app declares no social media capability.");
  }

  const derivedRating = deriveAgeRating(answers);
  const result = isRecord(ageRating.result) ? ageRating.result : {};
  if (result.calculatedGlobal !== derivedRating) {
    errors.push(`ageRating.result.calculatedGlobal must match the derived ${derivedRating} rating.`);
  }
  if (result.override !== "not_applicable") {
    errors.push("ageRating.result.override must be not_applicable unless a reviewed higher-rating decision is recorded.");
  }
  if (result.finalGlobal !== result.calculatedGlobal) {
    errors.push("ageRating.result.finalGlobal must match the calculated rating when no override applies.");
  }
  if (result.madeForKids !== false) {
    errors.push("ageRating.result.madeForKids must be false for FuelWell.");
  }

  const pricing = isRecord(document.pricingAndAvailability) ? document.pricingAndAvailability : {};
  if (pricing.price !== "free") errors.push("pricingAndAvailability.price must record the free launch decision.");
  if (pricing.availability !== "all_supported_storefronts") {
    errors.push("pricingAndAvailability.availability must record the all-supported-storefronts decision.");
  }
  if (pricing.distribution !== "public") errors.push("pricingAndAvailability.distribution must be public.");
  if (pricing.preorder !== false) errors.push("pricingAndAvailability.preorder must be false.");
  if (pricing.releaseMode !== "manual") errors.push("pricingAndAvailability.releaseMode must preserve manual release control.");

  const contentRights = isRecord(document.contentRights) ? document.contentRights : {};
  if (typeof contentRights.containsThirdPartyContent !== "boolean") {
    errors.push("contentRights.containsThirdPartyContent must be answered.");
  }
  if (contentRights.rightsConfirmed !== true) errors.push("contentRights.rightsConfirmed must be true.");
  if (typeof contentRights.declaration !== "string" || !contentRights.declaration.trim()) {
    errors.push("contentRights.declaration must explain the rights basis.");
  }

  const medicalDevice = isRecord(document.regulatedMedicalDevice) ? document.regulatedMedicalDevice : {};
  for (const region of ["euEea", "unitedKingdom", "unitedStates"]) {
    if (typeof medicalDevice[region] !== "boolean") {
      errors.push(`regulatedMedicalDevice.${region} must be answered.`);
    }
  }
  if (typeof medicalDevice.declaration !== "string" || !medicalDevice.declaration.trim()) {
    errors.push("regulatedMedicalDevice.declaration must explain the decision.");
  }

  const review = isRecord(document.review) ? document.review : {};
  const contact = isRecord(review.contact) ? review.contact : {};
  const demoAccount = isRecord(review.demoAccount) ? review.demoAccount : {};
  const referenceFields = [
    [contact, "firstNameRef"],
    [contact, "lastNameRef"],
    [contact, "emailRef"],
    [contact, "phoneRef"],
    [demoAccount, "usernameRef"],
    [demoAccount, "passwordRef"]
  ];
  for (const [owner, field] of referenceFields) {
    if (!/^FUELWELL_APP_REVIEW_[A-Z0-9_]+$/.test(owner[field] ?? "")) {
      errors.push(`review ${field} must be a FUELWELL_APP_REVIEW_* environment-variable reference.`);
    }
  }
  for (const field of ["firstName", "lastName", "email", "phone"]) {
    if (Object.hasOwn(contact, field)) errors.push(`review.contact.${field} must not be committed; use its Ref field.`);
  }
  for (const field of ["username", "password"]) {
    if (Object.hasOwn(demoAccount, field)) errors.push(`review.demoAccount.${field} must not be committed; use its Ref field.`);
  }
  if (review.signInRequired !== true || demoAccount.required !== true) {
    errors.push("review must declare sign-in and a demo account as required.");
  }
  if (demoAccount.mustRemainActive !== true || demoAccount.mustNotRequireOneTimeCode !== true) {
    errors.push("The App Review demo account must remain active and avoid one-time-code dependencies.");
  }
  const notesBytes = typeof review.notes === "string" ? Buffer.byteLength(review.notes, "utf8") : 0;
  if (notesBytes === 0 || notesBytes > 4_000) {
    errors.push("review.notes must contain 1-4000 UTF-8 bytes.");
  }

  return errors;
}

export function validatePrivacyInventoryDocument(document, manifest) {
  const errors = [];
  if (!isRecord(document)) return ["Privacy inventory must be a JSON object."];
  if (document.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(document.lastReviewed ?? "")) {
    errors.push("lastReviewed must use YYYY-MM-DD.");
  }
  if (document.collectsData !== true) errors.push("collectsData must be true for FuelWell.");
  if (document.tracking !== false) errors.push("tracking must be false for FuelWell.");
  if (!Array.isArray(document.trackingDomains) || document.trackingDomains.length !== 0) {
    errors.push("trackingDomains must be an empty array when tracking is false.");
  }

  const rows = Array.isArray(document.dataTypes) ? document.dataTypes : [];
  if (rows.length !== requiredPrivacyInventory.size) {
    errors.push(`dataTypes must contain exactly ${requiredPrivacyInventory.size} current FuelWell inventory rows.`);
  }
  const rowsById = new Map();
  const manifestTypes = new Set();
  for (const row of rows) {
    if (!isRecord(row) || typeof row.id !== "string") {
      errors.push("Every privacy inventory row must be an object with an id.");
      continue;
    }
    if (rowsById.has(row.id)) errors.push(`Duplicate privacy inventory id: ${row.id}.`);
    rowsById.set(row.id, row);
    if (typeof row.privacyManifestType === "string") {
      if (manifestTypes.has(row.privacyManifestType)) {
        errors.push(`Duplicate privacy manifest type: ${row.privacyManifestType}.`);
      }
      manifestTypes.add(row.privacyManifestType);
    }
    if (!Array.isArray(row.purposes) || row.purposes.length === 0
      || row.purposes.some((purpose) => !privacyPurposeValues.has(purpose))) {
      errors.push(`${row.id}.purposes must use one or more Apple privacy purpose values.`);
    }
    if (new Set(row.purposes ?? []).size !== (row.purposes ?? []).length) {
      errors.push(`${row.id}.purposes must not contain duplicates.`);
    }
    if (typeof row.linkedToUser !== "boolean") errors.push(`${row.id}.linkedToUser must be boolean.`);
    if (row.tracking !== false) errors.push(`${row.id}.tracking must be false.`);
    if (!Array.isArray(row.contexts) || row.contexts.length === 0) {
      errors.push(`${row.id}.contexts must document the collected product data.`);
    }
    if (!Array.isArray(row.processors) || row.processors.length === 0) {
      errors.push(`${row.id}.processors must document first- and third-party processing.`);
    }
  }

  for (const [id, [category, dataType, manifestType]] of requiredPrivacyInventory) {
    const row = rowsById.get(id);
    if (!row) {
      errors.push(`Missing required privacy inventory row: ${id}.`);
      continue;
    }
    if (row.appPrivacyCategory !== category) errors.push(`${id}.appPrivacyCategory must be ${category}.`);
    if (row.appPrivacyDataType !== dataType) errors.push(`${id}.appPrivacyDataType must be ${dataType}.`);
    if (row.privacyManifestType !== manifestType) errors.push(`${id}.privacyManifestType must be ${manifestType}.`);
  }
  for (const id of rowsById.keys()) {
    if (!requiredPrivacyInventory.has(id)) errors.push(`Unknown privacy inventory row: ${id}.`);
  }

  if (!isRecord(manifest)) return [...errors, "PrivacyInfo.xcprivacy must parse as a dictionary."];
  if (manifest.NSPrivacyTracking !== document.tracking) {
    errors.push("PrivacyInfo.xcprivacy tracking flag does not match the privacy inventory.");
  }
  const domains = Array.isArray(manifest.NSPrivacyTrackingDomains) ? manifest.NSPrivacyTrackingDomains : [];
  if (!sameMembers(domains, document.trackingDomains ?? [])) {
    errors.push("PrivacyInfo.xcprivacy tracking domains do not match the privacy inventory.");
  }

  const manifestRows = Array.isArray(manifest.NSPrivacyCollectedDataTypes)
    ? manifest.NSPrivacyCollectedDataTypes
    : [];
  const manifestRowsByType = new Map();
  for (const manifestRow of manifestRows) {
    const type = manifestRow?.NSPrivacyCollectedDataType;
    if (manifestRowsByType.has(type)) errors.push(`PrivacyInfo.xcprivacy repeats ${type}.`);
    manifestRowsByType.set(type, manifestRow);
  }
  if (manifestRows.length !== rows.length) {
    errors.push("PrivacyInfo.xcprivacy and the privacy inventory must declare the same number of data types.");
  }

  for (const row of rows) {
    const manifestRow = manifestRowsByType.get(row.privacyManifestType);
    if (!manifestRow) {
      errors.push(`PrivacyInfo.xcprivacy is missing ${row.privacyManifestType}.`);
      continue;
    }
    if (manifestRow.NSPrivacyCollectedDataTypeLinked !== row.linkedToUser) {
      errors.push(`${row.privacyManifestType} linked-to-user flag does not match the privacy inventory.`);
    }
    if (manifestRow.NSPrivacyCollectedDataTypeTracking !== row.tracking) {
      errors.push(`${row.privacyManifestType} tracking flag does not match the privacy inventory.`);
    }
    const purposes = Array.isArray(manifestRow.NSPrivacyCollectedDataTypePurposes)
      ? manifestRow.NSPrivacyCollectedDataTypePurposes
      : [];
    if (!sameMembers(purposes, row.purposes ?? [])) {
      errors.push(`${row.privacyManifestType} purposes do not match the privacy inventory.`);
    }
  }
  for (const type of manifestRowsByType.keys()) {
    if (!manifestTypes.has(type)) errors.push(`PrivacyInfo.xcprivacy has unowned data type ${type}.`);
  }

  return errors;
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

function validatePublicListingSurfaces(results) {
  const publicPages = [
    { label: "Privacy", route: "/privacy", filePath: privacyPagePath, metadataFile: "privacy_url.txt" },
    { label: "Support", route: "/support", filePath: supportPagePath, metadataFile: "support_url.txt" }
  ];

  for (const page of publicPages) {
    addResult(
      results,
      "public-listing",
      existsSync(page.filePath) ? "pass" : "fail",
      `${page.label} page source`,
      existsSync(page.filePath)
        ? `${page.route} is implemented as a public App Router page.`
        : `Add a public ${page.route} page before App Review.`,
      page.filePath
    );

    const metadataPath = path.join(metadataRoot, page.metadataFile);
    const expectedUrl = `${publicListingOrigin}${page.route}`;
    const actualUrl = existsSync(metadataPath) ? readTrimmed(metadataPath) : "";
    addResult(
      results,
      "public-listing",
      actualUrl === expectedUrl ? "pass" : "fail",
      `${page.label} metadata destination`,
      actualUrl === expectedUrl
        ? `Fastlane metadata points to ${expectedUrl}.`
        : `${page.metadataFile} must point to ${expectedUrl}.`,
      metadataPath
    );
  }

  const marketingUrlPath = path.join(metadataRoot, "marketing_url.txt");
  const marketingUrl = existsSync(marketingUrlPath) ? readTrimmed(marketingUrlPath) : "";
  addResult(
    results,
    "public-listing",
    marketingUrl === publicListingOrigin ? "pass" : "fail",
    "Marketing metadata destination",
    marketingUrl === publicListingOrigin
      ? `Fastlane metadata points to ${publicListingOrigin}.`
      : `marketing_url.txt must point to ${publicListingOrigin}.`,
    marketingUrlPath
  );

  const candidateGate = existsSync(candidateUiGatePath) ? readTrimmed(candidateUiGatePath) : "";
  const checksPublicPages = candidateGate.includes("for public_path in /privacy /support")
    && candidateGate.includes("${candidate_origin}${public_path}")
    && candidateGate.includes("public page ${public_path} returned HTTP");
  addResult(
    results,
    "public-listing",
    checksPublicPages ? "pass" : "fail",
    "Immutable candidate public-page gate",
    checksPublicPages
      ? "The immutable candidate gate requires HTTP 200 from Privacy and Support."
      : "The immutable candidate gate must reject missing Privacy or Support pages.",
    candidateUiGatePath
  );
}

function parsePlistJson(filePath) {
  const json = execFileSync("plutil", ["-convert", "json", "-o", "-", filePath], {
    cwd: root,
    encoding: "utf8"
  });

  return JSON.parse(json);
}

function validateSubmissionMetadata(results) {
  if (!existsSync(submissionMetadataPath)) {
    addResult(
      results,
      "submission-metadata",
      "fail",
      "Submission metadata inventory missing",
      "Commit the repository-owned App Store submission decisions.",
      submissionMetadataPath
    );
    return;
  }

  let submission;
  try {
    submission = readJson(submissionMetadataPath);
  } catch (error) {
    addResult(results, "submission-metadata", "fail", "Submission metadata inventory invalid", error.message, submissionMetadataPath);
    return;
  }

  const errors = validateSubmissionMetadataDocument(submission);
  const packageVersion = readJson(path.join(root, "package.json")).version;
  const metadataNamePath = path.join(metadataRoot, "name.txt");
  const metadataName = existsSync(metadataNamePath) ? readTrimmed(metadataNamePath) : "";
  if (submission.app?.version !== packageVersion) {
    errors.push(`app.version must match package.json (${packageVersion}).`);
  }
  if (submission.app?.name !== metadataName) {
    errors.push(`app.name must match Fastlane metadata (${metadataName || "missing"}).`);
  }

  if (errors.length > 0) {
    for (const error of errors) {
      addResult(results, "submission-metadata", "fail", "Submission metadata inventory invalid", error, submissionMetadataPath);
    }
    return;
  }

  addResult(
    results,
    "submission-metadata",
    "pass",
    "Categories and copyright recorded",
    `${submission.app.categories.primary} / ${submission.app.categories.secondary}; ${submission.app.copyright}.`,
    submissionMetadataPath
  );
  addResult(
    results,
    "submission-metadata",
    "pass",
    "Age rating questionnaire reconciled",
    `Every current answer is recorded and derives the declared ${submission.ageRating.result.finalGlobal} global rating.`,
    submissionMetadataPath
  );
  addResult(
    results,
    "submission-metadata",
    "pass",
    "Free pricing and availability recorded",
    "Free public distribution in all supported storefronts with manual release control.",
    submissionMetadataPath
  );
  addResult(
    results,
    "submission-metadata",
    "pass",
    "Content rights confirmed",
    submission.contentRights.declaration,
    submissionMetadataPath
  );
  addResult(
    results,
    "submission-metadata",
    "pass",
    "App Review fields use secret-free references",
    "Contact fields and the required non-expiring demo account use environment-variable references; review notes are populated.",
    submissionMetadataPath
  );

  const contactReferences = Object.values(submission.review.contact);
  const missingContactValues = contactReferences.filter((name) => !process.env[name]);
  addResult(
    results,
    "human-gates",
    missingContactValues.length === 0 ? "pass" : "blocker",
    "App Review contact values configured",
    missingContactValues.length === 0
      ? "Every referenced App Review contact value is present in the environment."
      : `Set the referenced contact values outside the repository: ${missingContactValues.join(", ")}.`,
    null
  );

  const demoReferences = [
    submission.review.demoAccount.usernameRef,
    submission.review.demoAccount.passwordRef
  ];
  const missingDemoValues = demoReferences.filter((name) => !process.env[name]);
  addResult(
    results,
    "human-gates",
    missingDemoValues.length === 0 ? "pass" : "blocker",
    "App Review demo account configured",
    missingDemoValues.length === 0
      ? "The referenced non-expiring App Review demo credentials are present in the environment."
      : `Set the referenced demo credentials outside the repository: ${missingDemoValues.join(", ")}.`,
    null
  );
}

function validatePrivacyManifest(results) {
  if (!existsSync(privacyInventoryPath)) {
    addResult(results, "privacy", "fail", "Privacy inventory missing", "Commit the repository-owned App Privacy inventory.", privacyInventoryPath);
    return;
  }
  if (!existsSync(privacyManifestPath)) {
    addResult(results, "privacy", "fail", "Privacy manifest missing", "PrivacyInfo.xcprivacy is required before App Store submission.", privacyManifestPath);
    return;
  }

  let inventory;
  let manifest;
  try {
    inventory = readJson(privacyInventoryPath);
  } catch (error) {
    addResult(results, "privacy", "fail", "Privacy inventory invalid", error.message, privacyInventoryPath);
    return;
  }
  try {
    manifest = parsePlistJson(privacyManifestPath);
  } catch (error) {
    addResult(results, "privacy", "fail", "Privacy manifest invalid", error.message, privacyManifestPath);
    return;
  }

  const errors = validatePrivacyInventoryDocument(inventory, manifest);
  if (errors.length > 0) {
    for (const error of errors) {
      addResult(results, "privacy", "fail", "Privacy inventory reconciliation failed", error, privacyInventoryPath);
    }
  } else {
    addResult(
      results,
      "privacy",
      "pass",
      "App Privacy inventory complete",
      `${inventory.dataTypes.length} required data types are inventoried with product contexts and processors.`,
      privacyInventoryPath
    );
    addResult(
      results,
      "privacy",
      "pass",
      "Privacy manifest reconciled",
      "Every inventory type exactly matches PrivacyInfo.xcprivacy purposes, linked-to-user, and tracking flags.",
      privacyManifestPath
    );
  }

  if (errors.length === 0) {
    for (const row of inventory.dataTypes) {
      addResult(
        results,
        "privacy",
        "pass",
        `App Privacy: ${row.appPrivacyDataType}`,
        `${row.linkedToUser ? "Linked" : "Not linked"}; not used for tracking; ${row.purposes.join(", ")}.`,
        privacyInventoryPath
      );
    }
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
    "pass",
    "App Store Connect provider selection",
    process.env.FUELWELL_APP_STORE_CONNECT_TEAM_ID
      ? "FUELWELL_APP_STORE_CONNECT_TEAM_ID is present."
      : "The team ID is optional; Fastlane will use the App Store Connect API key's default provider.",
    null
  );

  addResult(
    results,
    "human-gates",
    process.env.FUELWELL_SCREENSHOT_ATTESTATION_KEY ? "pass" : "blocker",
    "FUELWELL_SCREENSHOT_ATTESTATION_KEY configured",
    process.env.FUELWELL_SCREENSHOT_ATTESTATION_KEY
      ? "The private screenshot provenance key is present."
      : "Required to sign the immutable candidate screenshot manifest before App Store release.",
    null
  );

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
      label: "Live account-isolation journey",
      filePath: accountIsolationGatePath,
      detail: "The immutable candidate gate must prove two authenticated users cannot read or mutate one another's app state."
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
    && candidateGate.includes("verify-supabase-account-isolation.mjs")
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

  const coversLiveSocialOAuth = candidateGate.includes("/auth/v1/settings")
    && candidateGate.includes("for provider in google facebook apple")
    && candidateGate.includes(".external[$provider] == true")
    && candidateGate.includes("/auth/v1/authorize")
    && candidateGate.includes("accounts.google.com")
    && candidateGate.includes("facebook.com")
    && candidateGate.includes("appleid.apple.com");
  addResult(
    results,
    "repository-gates",
    coversLiveSocialOAuth ? "pass" : "fail",
    "Social OAuth provider handoff gate",
    coversLiveSocialOAuth
      ? "The candidate gate requires enabled Google, Facebook, and Apple providers and validates each provider handoff. Completed provider sessions remain a live acceptance requirement."
      : "The candidate gate must reject disabled or broken Google, Facebook, or Apple provider handoffs before TestFlight.",
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

  const fastfile = existsSync(fastfilePath) ? readTrimmed(fastfilePath) : "";
  const releaseLaneStart = fastfile.indexOf("lane :release do");
  const screenshotLaneStart = fastfile.indexOf('desc "Capture App Store screenshots');
  const releaseLane = releaseLaneStart >= 0 && screenshotLaneStart > releaseLaneStart
    ? fastfile.slice(releaseLaneStart, screenshotLaneStart)
    : "";
  const uploadCall = releaseLane.match(/upload_to_app_store\(\n([\s\S]*?)^\s{4}\)/m)?.[1] ?? "";
  const reviewedBuildHelper = fastfile.match(
    /def ensure_reviewed_build_ready!\(app_version:, build_number:\)\n([\s\S]*?)^\s{2}end$/m
  )?.[1] ?? "";
  const buildLookup = reviewedBuildHelper.match(
    /builds = Spaceship::ConnectAPI::Build\.all\(\n([\s\S]*?)^\s{4}\)/m
  )?.[1] ?? "";
  const promotesReviewedBuild = releaseLane.includes('required_release_value("FUELWELL_REVIEWED_BUILD_NUMBER")')
    && releaseLane.includes("ensure_reviewed_build_ready!(")
    && uploadCall.includes("app_version: release_settings.fetch(:package_version)")
    && uploadCall.includes("build_number: reviewed_build_number")
    && uploadCall.includes("skip_binary_upload: true")
    && uploadCall.includes("submit_for_review: false")
    && !/^\s*beta\s*$/m.test(releaseLane)
    && !releaseLane.includes("build_app(")
    && !releaseLane.includes("upload_to_testflight(")
    && buildLookup.includes("app_id: app.id")
    && buildLookup.includes("version: app_version")
    && buildLookup.includes("build_number: build_number")
    && reviewedBuildHelper.includes('build.processing_state == "VALID"')
    && reviewedBuildHelper.includes("build.expired != true")
    && reviewedBuildHelper.includes("build.get_beta_build_localizations")
    && reviewedBuildHelper.includes("testflight_candidate_markers(testflight_release_settings)")
    && reviewedBuildHelper.includes('whats_new.include?("#{key}: #{value}")');
  addResult(
    results,
    "repository-gates",
    promotesReviewedBuild ? "pass" : "fail",
    "Reviewed TestFlight build promotion",
    promotesReviewedBuild
      ? "The App Store lane selects an explicit valid TestFlight build whose live provenance metadata matches the immutable candidate, without rebuilding or re-uploading it."
      : "Require and validate an exact provenance-bound TestFlight build before preparing the App Store version.",
    fastfilePath
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

  const exportComplianceCovered = /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(infoPlist);
  addResult(
    results,
    "repository-gates",
    exportComplianceCovered ? "pass" : "fail",
    "App Store export-compliance declaration",
    exportComplianceCovered
      ? "The app declares that it only uses exempt platform encryption, avoiding a redundant processing hold."
      : "Declare ITSAppUsesNonExemptEncryption=false when the app uses only Apple's standard encrypted transports.",
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

function run() {
  const results = [];
  validateMetadata(results);
  validateSubmissionMetadata(results);
  validatePublicListingSurfaces(results);
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
      submissionMetadata: rel(submissionMetadataPath),
      privacyInventory: rel(privacyInventoryPath),
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
}

const invokedAsScript = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (invokedAsScript) {
  run();
}

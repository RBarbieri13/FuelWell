import { createHmac, timingSafeEqual } from "node:crypto";

export const SCREENSHOT_ATTESTATION_ALGORITHM = "HMAC-SHA256";
export const SCREENSHOT_ATTESTATION_KEY_ID = "fuelwell-appstore-screenshots-v1";

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    );
  }

  return value;
}

export function screenshotManifestPayload(manifest) {
  const { attestation: _attestation, ...payload } = manifest;
  return JSON.stringify(canonicalize(payload));
}

export function signScreenshotManifest(manifest, secret) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("Screenshot attestation key must contain at least 32 characters.");
  }

  return createHmac("sha256", secret)
    .update(screenshotManifestPayload(manifest))
    .digest("hex");
}

export function verifyScreenshotManifestAttestation(manifest, secret) {
  const attestation = manifest?.attestation;
  if (
    attestation?.algorithm !== SCREENSHOT_ATTESTATION_ALGORITHM ||
    attestation?.key_id !== SCREENSHOT_ATTESTATION_KEY_ID ||
    typeof attestation?.value !== "string" ||
    !/^[a-f0-9]{64}$/i.test(attestation.value)
  ) {
    return false;
  }

  let expected;
  try {
    expected = signScreenshotManifest(manifest, secret);
  } catch {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(attestation.value, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

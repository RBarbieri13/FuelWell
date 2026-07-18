import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/.well-known/fuelwell-release/route";
import {
  createReleaseManifest,
  RELEASE_MANIFEST_SCHEMA_VERSION,
} from "@/lib/release-manifest";
import packageMetadata from "../../package.json";

const deployment = {
  VERCEL_GIT_COMMIT_SHA: "0123456789abcdef0123456789abcdef01234567",
  VERCEL_DEPLOYMENT_ID: "dpl_immutableCandidate123",
  VERCEL_URL: "fuelwell-a1b2c3.vercel.app",
  VERCEL_ENV: "preview",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("createReleaseManifest", () => {
  it("binds the package version to immutable Vercel provenance", () => {
    expect(createReleaseManifest(deployment)).toEqual({
      schemaVersion: RELEASE_MANIFEST_SCHEMA_VERSION,
      packageVersion: packageMetadata.version,
      gitSha: deployment.VERCEL_GIT_COMMIT_SHA,
      vercelDeploymentId: deployment.VERCEL_DEPLOYMENT_ID,
      deploymentUrl: `https://${deployment.VERCEL_URL}`,
      environment: deployment.VERCEL_ENV,
    });
  });

  it("accepts explicit immutable Git provenance for CLI release candidates", () => {
    const cliDeployment = {
      ...deployment,
      VERCEL_GIT_COMMIT_SHA: "",
      FUELWELL_RELEASE_GIT_SHA: deployment.VERCEL_GIT_COMMIT_SHA,
    };

    expect(createReleaseManifest(cliDeployment).gitSha).toBe(
      deployment.VERCEL_GIT_COMMIT_SHA,
    );
  });

  it.each(["VERCEL_DEPLOYMENT_ID", "VERCEL_URL", "VERCEL_ENV"])(
    "fails closed when %s is absent",
    (key) => {
    expect(() =>
      createReleaseManifest({ ...deployment, [key]: "" }),
    ).toThrow(key);
    },
  );

  it("fails closed without system or explicit Git provenance", () => {
    expect(() =>
      createReleaseManifest({
        ...deployment,
        VERCEL_GIT_COMMIT_SHA: "",
        FUELWELL_RELEASE_GIT_SHA: "",
      }),
    ).toThrow(/VERCEL_GIT_COMMIT_SHA or FUELWELL_RELEASE_GIT_SHA/);
  });

  it("rejects non-HTTPS deployment URLs", () => {
    expect(() =>
      createReleaseManifest({ ...deployment, VERCEL_URL: "http://example.test" }),
    ).toThrow(/HTTPS/);
  });
});

describe("GET /.well-known/fuelwell-release", () => {
  it("returns the immutable release manifest", async () => {
    for (const [key, value] of Object.entries(deployment)) {
      vi.stubEnv(key, value);
    }

    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(await response.json()).toEqual(createReleaseManifest(deployment));
  });

  it("returns a non-cacheable 503 when provenance is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const key of Object.keys(deployment)) {
      vi.stubEnv(key, "");
    }

    const response = GET();

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error: "Release manifest is unavailable",
    });
  });
});

import packageMetadata from "../../package.json";

export const RELEASE_MANIFEST_SCHEMA_VERSION = 1;

export interface ReleaseManifest {
  schemaVersion: number;
  packageVersion: string;
  gitSha: string;
  vercelDeploymentId: string;
  deploymentUrl: string;
  environment: string;
}

type ReleaseEnvironment = Readonly<Record<string, string | undefined>>;

function requireValue(environment: ReleaseEnvironment, key: string): string {
  const value = environment[key]?.trim();
  if (!value) {
    throw new Error(`Release manifest requires ${key}`);
  }
  return value;
}

function releaseGitSha(environment: ReleaseEnvironment): string {
  const value =
    environment.VERCEL_GIT_COMMIT_SHA?.trim() ||
    environment.FUELWELL_RELEASE_GIT_SHA?.trim();
  if (!value) {
    throw new Error(
      "Release manifest requires VERCEL_GIT_COMMIT_SHA or FUELWELL_RELEASE_GIT_SHA",
    );
  }
  return value;
}

function deploymentUrl(value: string): string {
  const candidate = value.includes("://") ? value : `https://${value}`;
  const url = new URL(candidate);

  if (url.protocol !== "https:" || !url.hostname) {
    throw new Error("Release manifest requires an HTTPS VERCEL_URL");
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export function createReleaseManifest(
  environment: ReleaseEnvironment = process.env,
): ReleaseManifest {
  return {
    schemaVersion: RELEASE_MANIFEST_SCHEMA_VERSION,
    packageVersion: packageMetadata.version,
    gitSha: releaseGitSha(environment),
    vercelDeploymentId: requireValue(environment, "VERCEL_DEPLOYMENT_ID"),
    deploymentUrl: deploymentUrl(requireValue(environment, "VERCEL_URL")),
    environment: requireValue(environment, "VERCEL_ENV"),
  };
}

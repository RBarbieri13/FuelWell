// Single source of truth for what repo/branch the dashboard watches.
// Overridable via env so the same build can point at a fork or another branch.

export const REPO_OWNER = process.env.FW_REPO_OWNER ?? "RBarbieri13";
export const REPO_NAME = process.env.FW_REPO_NAME ?? "FuelWell";
export const REPO_BRANCH = process.env.FW_REPO_BRANCH ?? "main";
export const PLAN_PATH = process.env.FW_PLAN_PATH ?? "docs/MASTER-PLAN.md";

export const REPO_SLUG = `${REPO_OWNER}/${REPO_NAME}`;
export const REPO_URL = `https://github.com/${REPO_SLUG}`;

// How fresh the data is. raw.githubusercontent has no rate limit, so the plan
// and session digest can refresh fast. The commits API is rate-limited when
// unauthenticated (60/hr), so it revalidates more slowly unless a token is set.
export const HAS_TOKEN = Boolean(process.env.GITHUB_TOKEN);
export const PLAN_REVALIDATE = 60; // seconds
export const COMMITS_REVALIDATE = HAS_TOKEN ? 60 : 120; // seconds

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, "../..");

function readRepoFile(path: string) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

describe("release CI workflow contracts", () => {
  it("defines a bounded mobile regression script for CI", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts?: Record<string, string>;
    };
    const script = packageJson.scripts?.["test:mobile:bounded"];

    expect(script).toContain("playwright test");
    expect(script).toContain("tests/mobile-component-clipping.spec.ts");
    expect(script).toContain("FUELWELL_PLAYWRIGHT_MOBILE_WEBKIT=1");
    expect(script).toContain("FUELWELL_PLAYWRIGHT_SERVER_COMMAND='npm run start:test'");
    expect(script).toContain("FUELWELL_PLAYWRIGHT_REUSE_SERVER=0");
    expect(script).toContain("FUELWELL_PLAYWRIGHT_PORT=3107");
    expect(script).toContain("--project=chromium");
    expect(script).toContain("--project=mobile-webkit");
  });

  it("runs root web quality gates for source, test, and config changes", () => {
    const workflow = readRepoFile(".github/workflows/root-web-ci.yml");

    for (const path of [
      '"src/**"',
      '"tests/**"',
      '"public/**"',
      '"package.json"',
      '"package-lock.json"',
      '"next.config.ts"',
      '"playwright.config.ts"',
      '"postcss.config.mjs"',
      '"vitest.config.ts"',
    ]) {
      expect(workflow).toContain(path);
    }

    for (const command of [
      "npm ci",
      "npm run lint",
      "npm run build",
      "npm run test:unit",
      "npx playwright install --with-deps chromium webkit",
      "npm run test:mobile:bounded",
    ]) {
      expect(workflow).toContain(command);
    }
  });

  it("blocks deploys unless Root Web CI has already passed on main", () => {
    const workflow = readRepoFile(".github/workflows/deploy.yml");

    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain("- Root Web CI");
    expect(workflow).toContain("- main");
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain('workflow_id: "root-web-ci.yml"');
    expect(workflow).toContain('event: "push"');
    expect(workflow).toContain(
      "Run Root Web CI on main before dispatching deploy.",
    );
    expect(workflow).toContain("ref: ${{ steps.target.outputs.sha }}");
  });

  it("authenticates the protected live preflight before TestFlight upload", () => {
    const workflow = readRepoFile(".github/workflows/ios-testflight.yml");
    const verifier = readRepoFile("tools/release/test-ios-candidate-ui.sh");

    expect(workflow).toContain("NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}");
    expect(workflow).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}");
    expect(verifier).toContain("/auth/v1/token?grant_type=password");
    expect(verifier).toContain('Authorization: Bearer ${access_token}');
    expect(verifier).toContain(".productionReady == true and .liveReady == true");
  });
});

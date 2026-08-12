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

  it("uses the maintained authenticated mobile containment gate for TestFlight", () => {
    const verifier = readRepoFile("tools/release/test-ios-candidate-ui.sh");

    expect(verifier).toContain("tests/mobile-component-clipping.spec.ts");
    expect(verifier).toContain("--project=chromium");
    expect(verifier).toContain("--project=mobile-webkit");
    expect(verifier).not.toContain("tests/mobile-persistence-journeys.spec.ts");
    expect(verifier).not.toContain("tests/workouts-progressive-disclosure.spec.ts");
  });

  it("runs candidate UI journeys on compact and large iPhones", () => {
    const verifier = readRepoFile("tools/release/test-ios-candidate-ui.sh");

    expect(verifier).toContain("FUELWELL_RELEASE_TEST_DEVICES");
    expect(verifier).toContain("iPhone 16e,iPhone 17 Pro Max");
    expect(verifier).toContain('for raw_device in "${devices[@]}"');
    expect(verifier).toContain('Running candidate UI tests on ${device}');
    expect(verifier).toContain('result_paths+=("${device_result_path}")');
  });

  it("builds the exact candidate SHA requested by the TestFlight dispatch", () => {
    const workflow = readRepoFile(".github/workflows/ios-testflight.yml");
    const checkoutIndex = workflow.indexOf("ref: ${{ inputs.candidate_git_sha }}");
    const verificationIndex = workflow.indexOf("git rev-parse HEAD");
    const buildIndex = workflow.indexOf("- name: Select Xcode");

    expect(checkoutIndex).toBeGreaterThan(-1);
    expect(workflow).toContain(
      'if [ "${actual_sha}" != "${FUELWELL_CANDIDATE_GIT_SHA}" ]; then',
    );
    expect(verificationIndex).toBeGreaterThan(checkoutIndex);
    expect(buildIndex).toBeGreaterThan(verificationIndex);
  });

  it("uses an existing root web test command in the W7 aggregate", () => {
    const readiness = readRepoFile("tools/release/check-w7-readiness.sh");
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["test:unit"]).toBeTruthy();
    expect(readiness).toContain(
      'run_gate "Root web unit tests" npm run test:unit',
    );
    expect(readiness).not.toContain("npm run test:website");
  });

  it("runs Networking package tests as a required TestFlight gate", () => {
    const workflow = readRepoFile(".github/workflows/ios-testflight.yml");
    const networkingIndex = workflow.indexOf(
      "- name: Run Networking package tests",
    );
    const uploadIndex = workflow.indexOf(
      "- name: Upload internal TestFlight build",
    );

    expect(networkingIndex).toBeGreaterThan(-1);
    expect(workflow).toContain("working-directory: ios/Packages/Networking");
    expect(workflow).toContain("xcodebuild test \\");
    expect(workflow).toContain("-scheme Networking \\");
    expect(workflow).toContain(
      "-resultBundlePath ../../build/reports/Networking.xcresult",
    );
    expect(uploadIndex).toBeGreaterThan(networkingIndex);
  });
});

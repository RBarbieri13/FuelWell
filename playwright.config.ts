import { defineConfig, devices } from "@playwright/test";

const candidateBaseURL = process.env.FUELWELL_PLAYWRIGHT_BASE_URL;
const browserChannel = process.env.FUELWELL_PLAYWRIGHT_BROWSER_CHANNEL;

/**
 * Smoke-test config. Runs against the local dev server in preview mode
 * (.env.local sets FUELWELL_PREVIEW_MODE) so /app/* is reachable without auth.
 */
export default defineConfig({
  testDir: "./tests",
  // Vitest owns tests/unit/**/*.test.ts; Playwright only collects specs.
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  outputDir: process.env.FUELWELL_PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
  preserveOutput: process.env.FUELWELL_PLAYWRIGHT_OUTPUT_DIR ? "always" : "failures-only",
  use: {
    baseURL: candidateBaseURL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(browserChannel ? { channel: browserChannel } : {}),
      },
    },
  ],
  webServer: candidateBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});

// Surf detail campaign: capture full-page screenshots of all app routes at mobile widths.
// Usage: node scripts/surf-detail-capture.mjs <outDir> [routeFilter] [widths]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL || "http://localhost:3013";
const outDir = process.argv[2] || "surf-evidence/detail/before";
const routeFilter = process.argv[3] || "";
const widths = (process.argv[4] || "320,390,430").split(",").map(Number);

const ROUTES = [
  ["dashboard", "/app/dashboard"],
  ["dashboard-score", "/app/dashboard/score"],
  ["daily-review", "/app/daily-review"],
  ["log", "/app/log"],
  ["coach", "/app/coach"],
  ["coach-attachments", "/app/coach/attachments"],
  ["coach-menu-review", "/app/coach/menu-review"],
  ["nutrition", "/app/nutrition"],
  ["workouts", "/app/workouts"],
  ["workouts-lis", "/app/workouts/low-impact-strength"],
  ["workouts-lis-live", "/app/workouts/low-impact-strength/live"],
  ["fitness", "/app/fitness"],
  ["grocery-list", "/app/grocery-list"],
  ["recipes", "/app/recipes"],
  ["meal-plan", "/app/meal-plan"],
  ["progress", "/app/progress"],
  ["recovery", "/app/recovery"],
  ["onboarding", "/app/onboarding"],
  ["profile", "/app/profile"],
  ["settings", "/app/settings"],
  ["activity", "/app/activity"],
  ["signup", "/signup?preview=new-user"],
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [name, path] of ROUTES) {
  if (routeFilter && !name.includes(routeFilter)) continue;
  for (const w of widths) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${outDir}/${name}-${w}.png`, fullPage: true });
      console.log(`ok ${name}-${w}`);
    } catch (e) {
      console.log(`FAIL ${name}-${w}: ${e.message.split("\n")[0]}`);
      try {
        await page.screenshot({ path: `${outDir}/${name}-${w}.png`, fullPage: true });
        console.log(`  (captured anyway)`);
      } catch {}
    }
    await ctx.close();
  }
}
await browser.close();

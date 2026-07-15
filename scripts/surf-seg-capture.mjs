// Scrolled-segment screenshots: the app scrolls inside <main>, so fullPage
// captures only the first viewport. This walks the scroll container instead.
// Usage: node scripts/surf-seg-capture.mjs <outDir> [widths] [routeFilter]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const outDir = process.argv[2];
const widths = (process.argv[3] || "390,1280").split(",").map(Number);
const routeFilter = process.argv[4] || "";

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
  ["marketing", "/"],
  ["login", "/login"],
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [name, path] of ROUTES) {
  if (routeFilter && !name.includes(routeFilter)) continue;
  for (const w of widths) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 },
      deviceScaleFactor: 1,
      isMobile: w < 800,
      hasTouch: w < 800,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1000);
      let seg = 0;
      let prevTop = -1;
      while (seg < 7) {
        await page.screenshot({ path: `${outDir}/${name}-${w}-s${seg}.png` });
        const top = await page.evaluate(() => {
          const el = document.querySelector("main") || document.scrollingElement;
          if (el === document.scrollingElement) {
            window.scrollBy(0, window.innerHeight - 60);
            return document.scrollingElement.scrollTop;
          }
          el.scrollBy(0, el.clientHeight - 60);
          return el.scrollTop;
        });
        await page.waitForTimeout(350);
        if (top === prevTop) break;
        prevTop = top;
        seg++;
      }
      console.log(`ok ${name}-${w} (${seg + 1} segs)`);
    } catch (e) {
      console.log(`FAIL ${name}-${w}: ${e.message.split("\n")[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();

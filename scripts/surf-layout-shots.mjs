// Screenshot harness for the layout surf campaign.
// Usage: node scripts/surf-layout-shots.mjs <outDir> [routeFilter]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL || "http://localhost:3011";
const outDir = process.argv[2] || "surf-evidence/layout/baseline";
const filter = process.argv[3];

const ROUTES = [
  ["/app/dashboard", "dashboard"],
  ["/app/daily-review", "daily-review"],
  ["/app/log", "log"],
  ["/app/coach", "coach"],
  ["/app/coach/attachments", "coach-attachments"],
  ["/app/coach/menu-review", "coach-menu-review"],
  ["/app/nutrition", "nutrition"],
  ["/app/workouts", "workouts"],
  ["/app/workouts/low-impact-strength", "workout-detail"],
  ["/app/workouts/low-impact-strength/live", "workout-live"],
  ["/app/fitness", "fitness"],
  ["/app/grocery-list", "grocery-list"],
  ["/app/recipes", "recipes"],
  ["/app/meal-plan", "meal-plan"],
  ["/app/progress", "progress"],
  ["/app/recovery", "recovery"],
  ["/app/onboarding", "onboarding"],
  ["/app/profile", "profile"],
  ["/app/settings", "settings"],
  ["/app/activity", "activity"],
  ["/app/dashboard/score", "dashboard-score"],
  ["/signup?preview=new-user", "signup-new-user"],
];

const WIDTHS = [320, 390, 430];

const browser = await chromium.launch();
mkdirSync(outDir, { recursive: true });

for (const [route, name] of ROUTES) {
  if (filter && !name.includes(filter)) continue;
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      await page
        .waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, {
          timeout: 15000,
        })
        .catch(() => {});
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      // The app shell scrolls inside <main> (h-dvh overflow-hidden), which makes
      // fullPage capture only the first viewport. Unclamp it for the shot.
      await page.evaluate(() => {
        const main = document.querySelector("main");
        if (main && main.scrollHeight > main.clientHeight + 8) {
          for (let el = main; el && el !== document.body; el = el.parentElement) {
            el.style.height = "auto";
            el.style.maxHeight = "none";
            el.style.overflow = "visible";
          }
        }
      });
      await page.screenshot({ path: `${outDir}/${name}-${width}.png`, fullPage: true });
      console.log(`${name}@${width} ok${overflow > 1 ? ` OVERFLOW=${overflow}px` : ""}`);
    } catch (e) {
      console.log(`${name}@${width} FAIL ${e.message.split("\n")[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();

// Visual QA anchor for the visual-polish graph run.
// Captures every app route at mobile + desktop and records hard yes/no facts:
// console errors, page errors, horizontal overflow, zero-size paint boxes.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const outDir = process.argv[2] || "visual-qa";

const ROUTES = [
  ["/", "marketing"],
  ["/login", "login"],
  ["/signup", "signup"],
  ["/forgot-password", "forgot-password"],
  ["/app/dashboard", "dashboard"],
  ["/app/dashboard/score", "dashboard-score"],
  ["/app/log", "log"],
  ["/app/daily-review", "daily-review"],
  ["/app/coach", "coach"],
  ["/app/coach/attachments", "coach-attachments"],
  ["/app/coach/menu-review", "coach-menu-review"],
  ["/app/nutrition", "nutrition"],
  ["/app/recipes", "recipes"],
  ["/app/meal-plan", "meal-plan"],
  ["/app/grocery-list", "grocery-list"],
  ["/app/workouts", "workouts"],
  ["/app/workouts/low-impact-strength", "workout-detail"],
  ["/app/workouts/low-impact-strength/live", "workout-live"],
  ["/app/fitness", "fitness"],
  ["/app/activity", "activity"],
  ["/app/recovery", "recovery"],
  ["/app/progress", "progress"],
  ["/app/onboarding", "onboarding"],
  ["/app/profile", "profile"],
  ["/app/settings", "settings"],
  ["/ios-preview", "ios-preview"],
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "desktop", width: 1280, height: 900, isMobile: false },
];

const browser = await chromium.launch();
mkdirSync(outDir, { recursive: true });
const report = [];

for (const [route, name] of ROUTES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") {
        const t = m.text();
        // Dev-server HMR chunk churn is infrastructure noise, not app error.
        if (!/ChunkLoadError|hmr-client|Failed to load chunk/.test(t)) {
          consoleErrors.push(t.slice(0, 240));
        }
      }
    });
    page.on("pageerror", (e) => {
      const t = String(e);
      if (!/ChunkLoadError|hmr-client|Failed to load chunk/.test(t)) {
        pageErrors.push(t.slice(0, 240));
      }
    });

    const entry = { route, name, viewport: vp.name };
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1500);

      entry.overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      entry.horizontalOverflow =
        entry.overflow.scrollWidth > entry.overflow.innerWidth + 1;

      entry.collapsedTextNodes = await page.evaluate(() => {
        // An element legitimately has no box when an ANCESTOR is hidden —
        // responsive `lg:hidden` blocks, closed drawers, collapsed disclosures.
        // Only a node that paints nothing despite a laid-out ancestor chain is
        // a real defect, so the whole chain has to be walked.
        const hiddenByAncestor = (el) => {
          let n = el.parentElement;
          while (n) {
            const s = getComputedStyle(n);
            if (
              s.display === "none" ||
              s.visibility === "hidden" ||
              s.contentVisibility === "hidden" ||
              n.hasAttribute("hidden")
            ) {
              return true;
            }
            const r = n.getBoundingClientRect();
            if (r.height === 0 && s.overflow !== "visible") return true;
            n = n.parentElement;
          }
          return false;
        };

        const bad = [];
        for (const el of document.querySelectorAll("h1,h2,h3,p,button")) {
          const text = (el.textContent || "").trim();
          if (!text) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          if (cs.position === "absolute" && cs.clip !== "auto") continue;
          const r = el.getBoundingClientRect();
          if (r.width >= 1 && r.height >= 1) continue;
          if (hiddenByAncestor(el)) continue;
          bad.push(`${el.tagName}.${String(el.className).slice(0, 60)}`);
        }
        return bad.slice(0, 8);
      });

      // The app scrolls inside <main>, not the document, so a plain fullPage
      // capture only ever shows the first viewport. Expand the inner scroller
      // so the screenshot covers the whole route.
      entry.expandedScroller = await page.evaluate(() => {
        const scroller = [...document.querySelectorAll("*")].find(
          (e) =>
            e.scrollHeight > e.clientHeight + 20 &&
            ["auto", "scroll"].includes(getComputedStyle(e).overflowY)
        );
        if (!scroller) return null;
        const h = scroller.scrollHeight;
        scroller.style.height = `${h}px`;
        scroller.style.maxHeight = "none";
        scroller.style.overflow = "visible";
        // The shell is `h-dvh overflow-hidden` with nested overflow-hidden
        // wrappers, so every ancestor up to <html> has to be unwound or the
        // capture stays pinned to one viewport.
        let n = scroller.parentElement;
        while (n) {
          n.style.height = "auto";
          n.style.maxHeight = "none";
          n.style.minHeight = "0";
          n.style.overflow = "visible";
          n = n.parentElement;
        }
        return h;
      });
      await page.waitForTimeout(400);

      await page.screenshot({ path: `${outDir}/${name}-${vp.name}.png`, fullPage: true });
      entry.ok = true;
    } catch (err) {
      entry.ok = false;
      entry.error = String(err).slice(0, 240);
    }
    entry.consoleErrors = consoleErrors;
    entry.pageErrors = pageErrors;
    report.push(entry);
    await ctx.close();
  }
}

await browser.close();
writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2));

const failed = report.filter((r) => !r.ok);
const overflow = report.filter((r) => r.horizontalOverflow);
const collapsed = report.filter((r) => (r.collapsedTextNodes || []).length > 0);
const errored = report.filter((r) => r.pageErrors.length || r.consoleErrors.length);

console.log(`captures:         ${report.length}`);
console.log(`nav failures:     ${failed.length}`);
console.log(`h-overflow:       ${overflow.length}`);
console.log(`collapsed text:   ${collapsed.length}`);
console.log(`console/page err: ${errored.length}`);
for (const r of failed) console.log(`  FAIL ${r.name}/${r.viewport}: ${r.error}`);
for (const r of overflow)
  console.log(`  OVERFLOW ${r.name}/${r.viewport}: ${r.overflow.scrollWidth} > ${r.overflow.innerWidth}`);
for (const r of collapsed)
  console.log(`  COLLAPSED ${r.name}/${r.viewport}: ${r.collapsedTextNodes.join(", ")}`);
for (const r of errored)
  console.log(`  ERR ${r.name}/${r.viewport}: ${[...r.pageErrors, ...r.consoleErrors].slice(0, 2).join(" | ")}`);

process.exit(failed.length + overflow.length + collapsed.length > 0 ? 1 : 0);

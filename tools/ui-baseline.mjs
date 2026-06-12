#!/usr/bin/env node
/**
 * Snapshot every app route at desktop (1280x800) and mobile (375x812) into
 * docs/ui-loop/<label>/. Uses the preview bypass (no auth needed locally).
 *
 *   node tools/ui-baseline.mjs [label]   # default label: baseline
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const label = process.argv[2] ?? "baseline";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "ui-loop", label);
mkdirSync(outDir, { recursive: true });

const ROUTES = [
  "/app/dashboard", "/app/log", "/app/coach", "/app/workouts", "/app/recipes",
  "/app/grocery-list", "/app/recovery", "/app/progress", "/app/profile",
  "/app/settings", "/app/nutrition", "/app/meal-plan", "/app/activity",
  "/app/onboarding", "/login", "/signup",
];
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
];

const browser = await chromium.launch();
let failures = 0;
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    const slug = route.replace(/^\//, "").replaceAll("/", "-");
    try {
      const res = await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 20000 });
      if (!res || res.status() >= 400) throw new Error(`status ${res?.status()}`);
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(outDir, `${slug}--${vp.name}.png`), fullPage: true });
      console.log(`ok  ${route} @ ${vp.name}`);
    } catch (e) {
      failures += 1;
      console.error(`FAIL ${route} @ ${vp.name}: ${e.message}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(failures ? `${failures} failures` : "all captured");
process.exit(failures ? 1 : 0);

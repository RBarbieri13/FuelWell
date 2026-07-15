// Surf sizing campaign: screenshot + density audit harness.
// Usage: node scripts/surf-sizing-audit.mjs <out-subdir> [routeFilter]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL ?? "http://localhost:3012";
const OUT = path.join("surf-evidence", "sizing", process.argv[2] ?? "before");
const FILTER = process.argv[3];

const ROUTES = [
  "/app/dashboard",
  "/app/daily-review",
  "/app/log",
  "/app/coach",
  "/app/coach/attachments",
  "/app/coach/menu-review",
  "/app/nutrition",
  "/app/workouts",
  "/app/workouts/low-impact-strength",
  "/app/workouts/low-impact-strength/live",
  "/app/fitness",
  "/app/grocery-list",
  "/app/recipes",
  "/app/meal-plan",
  "/app/progress",
  "/app/recovery",
  "/app/onboarding",
  "/app/profile",
  "/app/settings",
  "/app/activity",
  "/app/dashboard/score",
  "/signup?preview=new-user",
];

const WIDTHS = [320, 390, 430];
const HEIGHT = 844;

function slug(route) {
  return route.replace(/^\//, "").replace(/[/?=]+/g, "-");
}

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, undefined, {
      timeout: 15_000,
    })
    .catch(() => {});
  await page.waitForTimeout(400);
}

// First-viewport density metrics, evaluated in page.
const AUDIT_FN = `(() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const inViewport = (r) => r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textChars = 0;
  const textRects = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const t = node.textContent.trim();
    if (!t) continue;
    const el = node.parentElement;
    if (!el) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (!inViewport(r) || r.width === 0 || r.height === 0) continue;
    const clipped = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    textChars += Math.round(t.length * Math.max(0, Math.min(1, clipped / Math.max(r.height, 1))));
    textRects.push([Math.max(r.top,0), Math.min(r.bottom,vh)]);
  }
  // fraction of vertical viewport bands containing any text
  const bands = new Array(Math.ceil(vh / 4)).fill(0);
  for (const [t, b] of textRects) {
    for (let i = Math.floor(t / 4); i < Math.ceil(b / 4) && i < bands.length; i++) bands[i] = 1;
  }
  const textBandFraction = bands.reduce((a, b) => a + b, 0) / bands.length;

  const bigType = [];
  const smallType = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!inViewport(r)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const fs = parseFloat(cs.fontSize);
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!ownText) continue;
    if (fs >= 28) bigType.push({ fs, text: ownText.slice(0, 40), tag: el.tagName, cls: (el.className||"").toString().slice(0,80) });
    if (fs < 11) smallType.push({ fs, text: ownText.slice(0, 40), tag: el.tagName, cls: (el.className||"").toString().slice(0,80) });
  }
  // tallest visible "card-like" blocks in first viewport
  const cards = [];
  for (const el of document.body.querySelectorAll("div, section, article, a, button")) {
    const r = el.getBoundingClientRect();
    if (!inViewport(r)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    const radius = parseFloat(cs.borderRadius) || 0;
    const hasBg = cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.backgroundImage !== "none";
    if (radius >= 12 && hasBg && r.width > vw * 0.6 && r.height >= vh * 0.25) {
      cards.push({ h: Math.round(r.height), hFrac: +(r.height / vh).toFixed(2), cls: (el.className||"").toString().slice(0,100) });
    }
  }
  cards.sort((a, b) => b.h - a.h);
  return {
    scrollHeight: document.documentElement.scrollHeight,
    textChars,
    textBandFraction: +textBandFraction.toFixed(2),
    bigType: bigType.slice(0, 12),
    smallType: smallType.slice(0, 12),
    tallCards: cards.slice(0, 6),
  };
})()`;

const browser = await chromium.launch();
const results = {};
for (const route of ROUTES) {
  if (FILTER && !route.includes(FILTER)) continue;
  const s = slug(route);
  results[route] = {};
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: HEIGHT },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await settle(page);
      fs.mkdirSync(OUT, { recursive: true });
      await page.screenshot({ path: path.join(OUT, `${s}-${width}.png`) });
      if (width === 390) {
        results[route] = await page.evaluate(AUDIT_FN);
      }
    } catch (e) {
      results[route].error = String(e).slice(0, 200);
    } finally {
      await ctx.close();
    }
  }
  console.log(`done ${route}`);
}
await browser.close();
fs.writeFileSync(path.join(OUT, "audit.json"), JSON.stringify(results, null, 2));
console.log("audit written to", path.join(OUT, "audit.json"));

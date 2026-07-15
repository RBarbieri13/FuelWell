// Persona walks for the sizing campaign. Each persona has a width, a journey
// (list of routes), and lenses (measurements that would annoy them).
import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL ?? "http://localhost:3012";

const PERSONAS = [
  {
    name: "Maria (68, low vision, max readability)",
    width: 390,
    journey: ["/app/dashboard", "/app/log", "/app/nutrition", "/app/daily-review"],
    lenses: ["tinyText", "tapTargets"],
  },
  {
    name: "Dev (data-dense power user)",
    width: 390,
    journey: ["/app/dashboard", "/app/nutrition", "/app/progress", "/app/activity", "/app/fitness"],
    lenses: ["factDensity", "prosePct"],
  },
  {
    name: "Jess (one-handed, iPhone SE)",
    width: 320,
    journey: ["/app/dashboard", "/app/log", "/app/grocery-list", "/app/meal-plan"],
    lenses: ["ctaBelowFold", "hOverflow", "tinyText"],
  },
  {
    name: "Tom (brand-new user)",
    width: 390,
    journey: ["/signup?preview=new-user", "/app/onboarding", "/app/dashboard"],
    lenses: ["ctaBelowFold", "prosePct"],
  },
  {
    name: "Priya (athlete, mid-workout arm's length)",
    width: 390,
    journey: ["/app/workouts", "/app/workouts/low-impact-strength", "/app/workouts/low-impact-strength/live"],
    lenses: ["keyFigureTooSmall", "tapTargets"],
  },
  {
    name: "Sam (weekly meal planner, big phone)",
    width: 430,
    journey: ["/app/meal-plan", "/app/recipes", "/app/grocery-list"],
    lenses: ["tinyText", "factDensity"],
  },
  {
    name: "Ravi (score-chaser reviewing his day)",
    width: 390,
    journey: ["/app/dashboard/score", "/app/recovery", "/app/daily-review"],
    lenses: ["factDensity", "prosePct", "tinyText"],
  },
];

const MEASURE = `(() => {
  const vw = window.innerWidth, vh = window.innerHeight;
  const inVp = (r) => r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0 && r.width > 0 && r.height > 0;
  const out = { tiny: [], smallTargets: [], numericFacts: 0, textChars: 0, proseChars: 0, hOverflow: false, primaryCta: null, keyFigures: [] };

  if (document.documentElement.scrollWidth > vw + 1) out.hOverflow = true;

  const seen = new Set();
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!inVp(r)) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) continue;
    const ownText = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
    if (ownText) {
      const fs = parseFloat(cs.fontSize);
      out.textChars += ownText.length;
      if (ownText.length > 80) out.proseChars += ownText.length;
      if (fs < 11.5) out.tiny.push({ fs: +fs.toFixed(1), text: ownText.slice(0, 36) });
      const nums = ownText.match(/\\d[\\d,.:%gx\\/]*/g);
      if (nums) out.numericFacts += nums.length;
      if (fs >= 18 && /\\d/.test(ownText)) out.keyFigures.push({ fs: Math.round(fs), text: ownText.slice(0, 24) });
    }
    if ((el.matches("a,button,[role=button],input,select,textarea")) && !seen.has(el)) {
      seen.add(el);
      const h = r.height, w = r.width;
      if ((h < 40 || w < 40) && r.top > 0 && ownTextOrLabel(el)) {
        out.smallTargets.push({ h: Math.round(h), w: Math.round(w), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30) });
      }
    }
  }
  function ownTextOrLabel(el) {
    return (el.textContent || "").trim().length > 0 || el.getAttribute("aria-label");
  }
  // primary CTA: first visible button/link styled as filled primary in the main scroll area
  const ctas = Array.from(document.querySelectorAll("button, a")).filter((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return r.width > 100 && r.height >= 40 && cs.backgroundImage !== "none" || (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && /rgb\\((16|21|30), /.test(cs.backgroundColor));
  });
  if (ctas.length) {
    const r = ctas[0].getBoundingClientRect();
    out.primaryCta = { text: (ctas[0].textContent || "").trim().slice(0, 30), top: Math.round(r.top), belowFold: r.top > vh };
  }
  return out;
})()`;

const browser = await chromium.launch();
const report = [];
for (const p of PERSONAS) {
  const ctx = await browser.newContext({ viewport: { width: p.width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const route of p.journey) {
    try {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      await page.waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, undefined, { timeout: 12_000 }).catch(() => {});
      await page.waitForTimeout(300);
      const m = await page.evaluate(MEASURE);
      const friction = [];
      if (p.lenses.includes("tinyText") && m.tiny.length) friction.push(`tiny text (<11.5px): ${m.tiny.slice(0,3).map(t=>`${t.fs}px "${t.text}"`).join("; ")}`);
      if (p.lenses.includes("tapTargets") && m.smallTargets.length) friction.push(`small targets: ${m.smallTargets.slice(0,3).map(t=>`${t.w}x${t.h} "${t.text}"`).join("; ")}`);
      if (p.lenses.includes("factDensity") && m.numericFacts < 6) friction.push(`only ${m.numericFacts} numeric facts in first viewport`);
      if (p.lenses.includes("prosePct") && m.proseChars > m.textChars * 0.45) friction.push(`prose-heavy: ${m.proseChars}/${m.textChars} chars in long paragraphs`);
      if (p.lenses.includes("ctaBelowFold") && m.primaryCta?.belowFold) friction.push(`primary CTA "${m.primaryCta.text}" below fold (top=${m.primaryCta.top})`);
      if (p.lenses.includes("hOverflow") && m.hOverflow) friction.push("horizontal overflow");
      if (p.lenses.includes("keyFigureTooSmall")) {
        const big = m.keyFigures.filter(f => f.fs >= 22);
        if (m.keyFigures.length && !big.length) friction.push(`no key figure >=22px (max ${Math.max(...m.keyFigures.map(f=>f.fs))}px)`);
      }
      report.push({ persona: p.name, width: p.width, route, facts: m.numericFacts, textChars: m.textChars, friction });
    } catch (e) {
      report.push({ persona: p.name, width: p.width, route, error: String(e).slice(0, 120) });
    }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync("surf-evidence/sizing/persona-report.json", JSON.stringify(report, null, 2));
for (const r of report) {
  const flag = r.error ? `ERR ${r.error}` : r.friction.length ? r.friction.join(" | ") : "ok";
  console.log(`[${r.persona}] ${r.route} @${r.width}: facts=${r.facts ?? "-"} chars=${r.textChars ?? "-"} -> ${flag}`);
}

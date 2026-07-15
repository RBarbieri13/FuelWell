// Persona friction probe for the layout surf campaign.
// Measures how deep key affordances sit (in viewports) and walks core flows.
import { chromium } from "@playwright/test";

const BASE = process.env.FUELWELL_PLAYWRIGHT_BASE_URL || "http://localhost:3011";
const VH = 844;

const browser = await chromium.launch();

async function fresh(width = 390) {
  const ctx = await browser.newContext({
    viewport: { width, height: VH },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page
    .waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, {
      timeout: 10000,
    })
    .catch(() => {});
  await page.waitForTimeout(300);
}

// Depth (in viewports) of the first element matching `text` inside <main>.
async function depthOf(page, locator) {
  const el = locator.first();
  const count = await locator.count();
  if (count === 0) return null;
  return el.evaluate((node, vh) => {
    const main = document.querySelector("main");
    const mainRect = main.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const y = rect.top - mainRect.top + (main ? main.scrollTop : 0);
    return Math.round((y / vh) * 100) / 100;
  }, VH);
}

const report = [];
function log(persona, note) {
  report.push(`[${persona}] ${note}`);
  console.log(`[${persona}] ${note}`);
}

// 1. Impatient power user: dashboard depth-to-actions
{
  const { ctx, page } = await fresh(390);
  await page.goto(`${BASE}/app/dashboard`);
  await settle(page);
  log("power", `depth 'Quick actions': ${await depthOf(page, page.getByText("Quick actions", { exact: false }))}vh`);
  log("power", `depth 'Log Meal' tile: ${await depthOf(page, page.getByRole("link", { name: "Log Meal" }))}vh`);
  log("power", `depth 'Logged today': ${await depthOf(page, page.getByText("Logged today"))}vh`);
  await ctx.close();
}

// 2. Evening-only repeat logger: /app/log depth to Recent meals + one-tap repeat works
{
  const { ctx, page } = await fresh(390);
  await page.goto(`${BASE}/app/log`);
  await settle(page);
  log("evening", `depth search input: ${await depthOf(page, page.getByPlaceholder("Search 1,000+ foods by name"))}vh`);
  log("evening", `depth 'Recent meals': ${await depthOf(page, page.getByText("Recent meals", { exact: true }))}vh`);
  const repeatBtn = page.getByRole("button", { name: /kcal ·/ }).first();
  if (await repeatBtn.count()) {
    await repeatBtn.scrollIntoViewIfNeeded();
    await repeatBtn.click();
    await page.waitForTimeout(400);
    const confirm = await page.getByRole("status").first().textContent().catch(() => "none");
    log("evening", `one-tap repeat confirmation: ${confirm?.slice(0, 60)}`);
  } else {
    log("evening", "no recent-meal repeat button found");
  }
  await ctx.close();
}

// 3. Macro-focused athlete: protein visibility dashboard + log flow adjacency
{
  const { ctx, page } = await fresh(390);
  await page.goto(`${BASE}/app/dashboard`);
  await settle(page);
  log("athlete", `depth 'Protein left' (hero): ${await depthOf(page, page.getByText("Protein left").first())}vh`);
  log("athlete", `depth protein bar (plate card): ${await depthOf(page, page.getByText("Protein", { exact: true }))}vh`);
  await page.goto(`${BASE}/app/log`);
  await settle(page);
  await page.getByPlaceholder("Search 1,000+ foods by name").fill("chicken");
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Choose .*hicken/i }).first().click();
  await page.waitForTimeout(600);
  const picker = page.getByText("Add to Today's Plate");
  const pickerVisible = await picker
    .first()
    .evaluate((node) => {
      const r = node.getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight;
    })
    .catch(() => false);
  log("athlete", `portion picker visible after select (no manual scroll): ${pickerVisible}`);
  await ctx.close();
}

// 4. New user: signup CTA and onboarding start visibility at 320
{
  const { ctx, page } = await fresh(320);
  await page.goto(`${BASE}/signup?preview=new-user`);
  await settle(page);
  const cta = page.getByRole("button", { name: /Create preview account/i });
  const ctaDepth = await depthOf(page, cta);
  log("new-user", `signup CTA depth @320: ${ctaDepth}vh`);
  await page.goto(`${BASE}/app/onboarding`);
  await settle(page);
  log("new-user", `depth 'Start setup': ${await depthOf(page, page.getByRole("button", { name: /Start setup/i }))}vh`);
  await ctx.close();
}

// 5. Casual dieter: dashboard -> find meals that fit -> recipes -> open first recipe
{
  const { ctx, page } = await fresh(390);
  await page.goto(`${BASE}/app/dashboard`);
  await settle(page);
  const cta = page.getByRole("button", { name: /Find meals that fit/i });
  log("dieter", `hero CTA present: ${(await cta.count()) > 0}`);
  await page.goto(`${BASE}/app/recipes`);
  await settle(page);
  log("dieter", `depth recipes search: ${await depthOf(page, page.getByLabel("Search title, ingredients, or tags"))}vh`);
  log("dieter", `depth first 'Open recipe': ${await depthOf(page, page.getByRole("button", { name: "Open recipe" }))}vh`);
  const showMore = page.getByRole("button", { name: /Show .* more/ });
  log("dieter", `show-more control present: ${(await showMore.count()) > 0}`);
  await ctx.close();
}

// 6. Older user needing clarity: daily-review reading order at 320
{
  const { ctx, page } = await fresh(320);
  await page.goto(`${BASE}/app/daily-review`);
  await settle(page);
  log("older", `depth 'Food in' tile: ${await depthOf(page, page.getByText("Food in", { exact: true }))}vh`);
  log("older", `depth 'What needs attention': ${await depthOf(page, page.getByText("What needs attention"))}vh`);
  log("older", `depth 'Intake and output by day': ${await depthOf(page, page.getByText("Intake and output by day"))}vh`);
  log("older", `depth 'Next best review': ${await depthOf(page, page.getByText("Next best review"))}vh`);
  await ctx.close();
}

await browser.close();
console.log("\n--- persona probe complete ---");

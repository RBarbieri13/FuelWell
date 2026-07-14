import { expect, test, type Page } from "@playwright/test";

/**
 * Component-level clipping gate.
 *
 * The older mobile gate (mobile-route-containment.spec.ts) only asserts on
 * document/body width, so a child clipped by an `overflow-hidden` ancestor
 * can pass while being unreadable on a real phone. This spec inspects every
 * visible content-bearing element and fails when:
 *
 *   1. it extends past the viewport (outside an intentional horizontal
 *      scroller),
 *   2. it is cut off by an `overflow-hidden`/`clip` ancestor, or
 *   3. its own hidden overflow swallows content without an explicit
 *      single-line ellipsis treatment.
 *
 * Tables, code, and formulas may scroll inside their own bounded containers
 * (any ancestor with overflow-x auto/scroll is treated as intentional); the
 * page itself may not scroll horizontally.
 */

const WIDTHS = [320, 375, 390, 430] as const;
const VIEWPORT_HEIGHT = 844;

const ROUTES = [
  "/signup",
  "/signup?preview=new-user",
  "/app/dashboard",
  "/app/daily-review",
  "/app/log",
  "/app/coach",
  "/app/workouts",
  "/app/fitness",
  "/app/recipes",
  "/app/grocery-list",
  "/app/recovery",
  "/app/progress",
  "/app/profile",
  "/app/settings",
  "/app/onboarding",
  "/app/activity",
  "/app/nutrition",
  "/app/meal-plan",
  "/app/dashboard/score",
  "/app/coach/attachments",
  "/app/coach/menu-review",
  "/app/workouts/low-impact-strength",
  "/app/workouts/low-impact-strength/live",
] as const;

type Offender = {
  kind: "viewport-overflow" | "ancestor-clip" | "self-clip";
  tag: string;
  className: string;
  text: string;
  rect: { left: number; right: number; width: number };
  clip?: { tag: string; className: string; left: number; right: number };
};

async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page
    .waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, undefined, {
      timeout: 10_000,
    })
    .catch(() => {});
  await page.waitForTimeout(400);
}

async function clippedComponents(page: Page): Promise<{
  documentWidth: number;
  offenders: Offender[];
}> {
  return page.evaluate(() => {
    const EPSILON = 1;
    const vw = window.innerWidth;
    const styles = new Map<Element, CSSStyleDeclaration>();
    const styleOf = (el: Element) => {
      let s = styles.get(el);
      if (!s) {
        s = getComputedStyle(el);
        styles.set(el, s);
      }
      return s;
    };
    const scrollableX = (v: string) => v === "auto" || v === "scroll";
    const hiddenX = (v: string) => v === "hidden" || v === "clip";
    const CONTENT_TAGS = new Set([
      "IMG",
      "SVG",
      "INPUT",
      "BUTTON",
      "SELECT",
      "TEXTAREA",
      "VIDEO",
      "CANVAS",
    ]);
    const hasOwnText = (el: HTMLElement) =>
      Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0
      );
    // A styled box (visible background or border) getting chopped by a
    // clipping ancestor is just as broken as chopped text — the dashboard
    // EnergyStat card clip is exactly this case.
    const paintsBox = (el: HTMLElement, s: CSSStyleDeclaration) => {
      if (s.pointerEvents === "none") return false;
      const bg = s.backgroundColor;
      const hasBg = Boolean(bg) && bg !== "transparent" && !/rgba?\([^)]*,\s*0\)$/.test(bg);
      const hasBorder =
        parseFloat(s.borderLeftWidth) > 0 ||
        parseFloat(s.borderRightWidth) > 0 ||
        parseFloat(s.borderTopWidth) > 0 ||
        parseFloat(s.borderBottomWidth) > 0;
      return hasBg || hasBorder;
    };
    const describe = (el: HTMLElement) => ({
      tag: el.tagName,
      className: typeof el.className === "string" ? el.className : "",
      text: (el.textContent ?? "").trim().slice(0, 60),
    });

    const offenders: Array<Record<string, unknown>> = [];

    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      if (!(el instanceof HTMLElement)) continue;

      const style = styleOf(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (Number(style.opacity) === 0) continue;
      if (!hasOwnText(el) && !CONTENT_TAGS.has(el.tagName) && !paintsBox(el, style)) continue;
      if (el.closest('[aria-hidden="true"]')) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;

      let insideScroller = false;
      for (let a = el.parentElement; a; a = a.parentElement) {
        if (scrollableX(styleOf(a).overflowX)) {
          insideScroller = true;
          break;
        }
      }

      if (!insideScroller && (rect.right > vw + EPSILON || rect.left < -EPSILON)) {
        offenders.push({
          kind: "viewport-overflow",
          ...describe(el),
          rect: { left: rect.left, right: rect.right, width: rect.width },
        });
        continue;
      }

      if (!insideScroller) {
        for (let a = el.parentElement; a; a = a.parentElement) {
          const aStyle = styleOf(a);
          if (scrollableX(aStyle.overflowX)) break;
          if (hiddenX(aStyle.overflowX)) {
            const ar = a.getBoundingClientRect();
            if (rect.right > ar.right + EPSILON || rect.left < ar.left - EPSILON) {
              offenders.push({
                kind: "ancestor-clip",
                ...describe(el),
                rect: { left: rect.left, right: rect.right, width: rect.width },
                clip: {
                  tag: a.tagName,
                  className: typeof a.className === "string" ? a.className : "",
                  left: ar.left,
                  right: ar.right,
                },
              });
            }
            break;
          }
        }
      }

      // Self-clip only applies to an element's own text: painted containers
      // legitimately clip decorative (pointer-events-none) children, and any
      // real child that gets cut is reported by the ancestor-clip check.
      const deliberateEllipsis =
        style.textOverflow === "ellipsis" ||
        style.webkitLineClamp !== "none";
      if (
        hasOwnText(el) &&
        !deliberateEllipsis &&
        hiddenX(style.overflowX) &&
        el.scrollWidth > el.clientWidth + EPSILON
      ) {
        offenders.push({
          kind: "self-clip",
          ...describe(el),
          rect: { left: rect.left, right: rect.right, width: rect.width },
        });
      }
    }

    return {
      documentWidth: document.documentElement.scrollWidth,
      offenders: offenders.slice(0, 20) as never,
    };
  });
}

async function openRoute(page: Page, route: string, width: number) {
  const routePage = await page.context().newPage();
  await routePage.emulateMedia({ reducedMotion: "reduce" });
  await routePage.setViewportSize({ width, height: VIEWPORT_HEIGHT });
  await routePage.goto(route, { waitUntil: "domcontentloaded" });
  if (new URL(routePage.url()).pathname === "/login") {
    const email = process.env.FUELWELL_UI_TEST_EMAIL;
    const password = process.env.FUELWELL_UI_TEST_PASSWORD;
    expect(email, "FUELWELL_UI_TEST_EMAIL is required for an authenticated candidate.").toBeTruthy();
    expect(password, "FUELWELL_UI_TEST_PASSWORD is required for an authenticated candidate.").toBeTruthy();
    await routePage.getByLabel("Email").fill(email!);
    await routePage.getByLabel("Password").fill(password!);
    await routePage.getByRole("button", { name: "Sign in" }).click();
    await routePage.goto(route, { waitUntil: "domcontentloaded" });
  }
  expect(new URL(routePage.url()).pathname).toBe(route.split("?")[0]);
  await settle(routePage);
  return routePage;
}

test.describe("FuelWell phone component clipping", () => {
  for (const width of WIDTHS) {
    test(`${width}px keeps every component readable on every primary route`, async ({ page }, testInfo) => {
      test.setTimeout(300_000);
      const failures: string[] = [];
      for (const route of ROUTES) {
        const routePage = await openRoute(page, route, width);
        await routePage.screenshot({
          path: testInfo.outputPath(
            `${width}-${route.replaceAll("/", "-").replaceAll("?", "_").slice(1)}.png`
          ),
          fullPage: false,
        });
        const report = await clippedComponents(routePage);
        if (report.documentWidth > width) {
          failures.push(`${route} @${width}: document scrolls horizontally (${report.documentWidth}px)`);
        }
        if (report.offenders.length > 0) {
          failures.push(`${route} @${width}: ${JSON.stringify(report.offenders, null, 2)}`);
        }
        await routePage.close();
      }
      expect(failures, failures.join("\n\n")).toEqual([]);
    });
  }
});

test.describe("dashboard decision metrics", () => {
  for (const width of WIDTHS) {
    test(`${width}px shows both decision metrics fully`, async ({ page }, testInfo) => {
      const routePage = await openRoute(page, "/app/dashboard", width);
      await routePage.screenshot({
        path: testInfo.outputPath(`${width}-dashboard-metrics.png`),
        fullPage: false,
      });
      const panel = routePage.locator(".fw-dark-panel").first();
      for (const label of ["Calories left", "Protein left"]) {
        await expect(
          panel.getByText(label, { exact: true }),
          `${label} stat is missing from the decision panel`
        ).toBeVisible();
      }
      const report = await clippedComponents(routePage);
      expect(
        report.offenders,
        `dashboard has clipped components @${width}px:\n${JSON.stringify(report.offenders, null, 2)}`
      ).toEqual([]);
      await routePage.close();
    });
  }
});

test.describe("signup first viewport", () => {
  for (const width of WIDTHS) {
    test(`${width}px keeps the preview signup action in the first viewport`, async ({ page }, testInfo) => {
      const routePage = await openRoute(page, "/signup?preview=new-user", width);
      await routePage.screenshot({
        path: testInfo.outputPath(`${width}-signup-preview.png`),
        fullPage: false,
      });

      const disclosure = routePage.getByText("New-user preview account", { exact: false }).first();
      if (await disclosure.isVisible()) {
        const container = routePage
          .locator("div")
          .filter({ has: disclosure })
          .last();
        const disclosureBox = await container.boundingBox();
        expect(disclosureBox, "preview disclosure missing").toBeTruthy();
        expect(
          disclosureBox!.height,
          "preview disclosure dominates the first screen"
        ).toBeLessThanOrEqual(VIEWPORT_HEIGHT * 0.12);
      }

      const submit = routePage.getByRole("button", { name: /create preview account/i });
      await expect(submit).toBeVisible();
      const submitBox = await submit.boundingBox();
      expect(submitBox, "signup action missing").toBeTruthy();
      expect(
        submitBox!.y + submitBox!.height,
        "primary signup action is below the first viewport"
      ).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
      await routePage.close();
    });
  }
});

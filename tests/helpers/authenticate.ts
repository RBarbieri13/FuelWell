import { expect, type Page } from "@playwright/test";

const AUTH_TIMEOUT = 45_000;

export async function authenticateCandidate(page: Page, destination = "/app/dashboard") {
  const expected = new URL(destination, "https://fuelwell.test");
  const email = process.env.FUELWELL_UI_TEST_EMAIL;
  const password = process.env.FUELWELL_UI_TEST_PASSWORD;
  expect(email, "FUELWELL_UI_TEST_EMAIL is required for a release candidate.").toBeTruthy();
  expect(password, "FUELWELL_UI_TEST_PASSWORD is required for a release candidate.").toBeTruthy();

  // Always visit the real login route. Public preview deployments deliberately
  // allow anonymous sample browsing, so merely reaching an /app route does not
  // prove the TestFlight candidate has a durable user session.
  await page.goto(`/login?redirect=${encodeURIComponent(destination)}`, {
    waitUntil: "domcontentloaded",
  });

  if (new URL(page.url()).pathname === "/login") {
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith("/app/"), { timeout: AUTH_TIMEOUT }),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);
  }

  const current = new URL(page.url());
  if (current.pathname !== expected.pathname || current.search !== expected.search) {
    await page.goto(destination, { waitUntil: "domcontentloaded" });
  }
  await expect
    .poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}`;
    }, { timeout: AUTH_TIMEOUT })
    .toBe(`${expected.pathname}${expected.search}`);
  await page.waitForLoadState("networkidle", { timeout: AUTH_TIMEOUT }).catch(() => {});
  await expect(page.locator("main").first()).toBeVisible({ timeout: AUTH_TIMEOUT });

  const date = new Date().toISOString().slice(0, 10);
  const authProbe = await page.request.get(`/api/day-log?date=${date}`);
  expect(authProbe.status(), "Authenticated session probe must return HTTP 200.").toBe(200);
  const authPayload = (await authProbe.json()) as { signedIn?: boolean };
  expect(authPayload.signedIn, "TestFlight candidate must use a real signed-in session.").toBe(true);
}

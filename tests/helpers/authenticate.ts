import { expect, type Page } from "@playwright/test";

const AUTH_TIMEOUT = 45_000;

export async function authenticateCandidate(page: Page, destination = "/app/dashboard") {
  await page.goto(destination, { waitUntil: "domcontentloaded" });

  if (new URL(page.url()).pathname !== "/login") {
    return;
  }

  const email = process.env.FUELWELL_UI_TEST_EMAIL;
  const password = process.env.FUELWELL_UI_TEST_PASSWORD;
  expect(email, "FUELWELL_UI_TEST_EMAIL is required for a release candidate.").toBeTruthy();
  expect(password, "FUELWELL_UI_TEST_PASSWORD is required for a release candidate.").toBeTruthy();

  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await Promise.all([
    page.waitForURL((url) => url.pathname.startsWith("/app/"), { timeout: AUTH_TIMEOUT }),
    page.getByRole("button", { name: "Sign in" }).click(),
  ]);

  if (new URL(page.url()).pathname !== destination) {
    await page.goto(destination, { waitUntil: "domcontentloaded" });
  }
  await expect(page).toHaveURL(new RegExp(`${destination.replaceAll("/", "\\/")}(?:\\?.*)?$`), {
    timeout: AUTH_TIMEOUT,
  });
  await page.waitForLoadState("networkidle", { timeout: AUTH_TIMEOUT }).catch(() => {});
  await expect(page.locator("main").first()).toBeVisible({ timeout: AUTH_TIMEOUT });
}

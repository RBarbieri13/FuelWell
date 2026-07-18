import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { authenticateCandidate } from "./helpers/authenticate";

const LIVE_TIMEOUT = 90_000;
const REJECTED_RESPONSE =
  /local fallback|temporarily unavailable|credit balance|provider error|deterministic-provider-fallback|something broke mid-thought/i;

test.describe("TestFlight live Coach release gate", () => {
  test.describe.configure({ mode: "serial" });

  test("authenticated Coach answers a general-knowledge question with live inference", async ({ page }, testInfo) => {
    test.setTimeout(120_000);

    await authenticateCandidate(page, "/app/coach");
    await expect(page.getByLabel("Message Coach")).toBeVisible({ timeout: LIVE_TIMEOUT });

    const question = "What is Neptune? Answer in one short sentence.";
    const composer = page.getByLabel("Message Coach");
    const send = page.getByRole("button", { name: "Send" });
    await expect(composer).toBeEnabled({ timeout: LIVE_TIMEOUT });
    await composer.click();
    await composer.pressSequentially(question, { delay: 5 });
    await expect(composer).toHaveValue(question);
    await expect(send).toBeEnabled({ timeout: LIVE_TIMEOUT });

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/coach/turn") && response.request().method() === "POST",
      { timeout: LIVE_TIMEOUT }
    );
    await send.click();

    const response = await responsePromise;
    expect(response.status(), `Coach request failed with HTTP ${response.status()}`).toBe(200);
    await response.finished();
    await expect(composer).toBeEnabled({ timeout: LIVE_TIMEOUT });

    const assistant = page.getByTestId("coach-assistant-message").last();
    await expect(assistant).toBeVisible({ timeout: LIVE_TIMEOUT });
    await expect(assistant).toContainText(/Neptune/i, { timeout: LIVE_TIMEOUT });
    await expect(assistant).toContainText(/planet|ice giant|solar system|eighth/i, { timeout: LIVE_TIMEOUT });
    await expect
      .poll(() => assistant.innerText(), { timeout: LIVE_TIMEOUT })
      .toMatch(/[.!?]["')\]]?$/);

    const answer = (await assistant.innerText()).trim();
    expect(answer).not.toMatch(REJECTED_RESPONSE);
    expect(answer.length, "Coach returned an implausibly short answer.").toBeGreaterThan(35);

    const body = await response.text().catch(() => "");
    expect(body).not.toMatch(REJECTED_RESPONSE);

    await assistant.screenshot({ path: testInfo.outputPath("live-coach-neptune-answer.png") });
    await writeFile(
      testInfo.outputPath("live-coach-neptune-evidence.json"),
      JSON.stringify(
        {
          candidate: process.env.FUELWELL_PLAYWRIGHT_BASE_URL,
          question,
          answer,
          status: response.status(),
        },
        null,
        2
      )
    );
  });
});

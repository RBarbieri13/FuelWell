import { test, expect } from "@playwright/test";

/**
 * FuelWell smoke suite (Section D2). Verifies the meeting-decision surfaces
 * render and their core interactions work end-to-end against the dev server in
 * preview mode. Each test uses a fresh context, so localStorage starts clean.
 */

test("preview bypass: dashboard renders without auth", async ({ page }) => {
  await page.goto("/app/dashboard");
  await expect(page.getByText("Today's decision")).toBeVisible();
});

test("Health Score is a compact chip + working detail page, not a hero surface", async ({
  page,
}) => {
  await page.goto("/app/dashboard");
  // The only score surface on the dashboard is the compact chip linking to detail.
  const chip = page.getByRole("link", { name: /Health score/i });
  await expect(chip).toBeVisible();
  // The old prominent "Score inputs" section is gone (de-emphasis).
  await expect(page.getByRole("heading", { name: "Score inputs" })).toHaveCount(0);
  // Detail page still fully functional.
  await chip.click();
  await expect(page).toHaveURL(/\/app\/dashboard\/score/);
});

test("Log: live food search returns ranked results", async ({ page }) => {
  await page.goto("/app/log");
  await page.getByPlaceholder("Search 500+ foods by name").fill("chicken");
  await expect(page.getByRole("button", { name: /Choose .*hicken/i }).first()).toBeVisible();
});

test("Log: add-your-own custom meal creates an entry / updates the day log", async ({
  page,
}) => {
  await page.goto("/app/log");
  await page.getByRole("button", { name: "Add your own meal" }).click();
  await page.getByPlaceholder("Meal name (e.g. Homemade chili)").fill("Smoke Test Meal");
  // Fill all four macro fields (all are required to be valid numbers).
  const macros = page.getByRole("spinbutton");
  await macros.nth(0).fill("450"); // calories
  await macros.nth(1).fill("30"); // protein
  await macros.nth(2).fill("40"); // carbs
  await macros.nth(3).fill("15"); // fat
  await page.getByRole("button", { name: /Add to/i }).click();
  // The new meal shows up in today's logged meals (shared useDayLog store).
  await expect(page.getByText("Smoke Test Meal").first()).toBeVisible();
});

test("Log: barcode lookup saves through reviewed portion and shows goal impact", async ({
  page,
}) => {
  await page.goto("/app/log");
  await page.getByRole("button", { name: "Scan" }).click();
  await page.getByLabel("Barcode number").fill("000000000104");
  await page.getByRole("button", { name: /Look up/i }).click();
  await expect(page.getByText("Verified barcode match")).toBeVisible();
  await page.getByRole("button", { name: "Choose portion" }).click();
  await page.getByRole("button", { name: /Standard \(140 g\)/i }).click();
  await expect(page.getByText(/Chicken breast, grilled \(Standard \(140 g\)\) added/i)).toBeVisible();
  await expect(page.getByText("Goal impact · database")).toBeVisible();
  await expect(page.getByText(/Macro source: FuelWell food database/i)).toBeVisible();
});

test("Log: restaurant menu search logs a goal-aware menu item", async ({ page }) => {
  await page.route("**/api/restaurants/nearby?**", async (route) => {
    await route.fulfill({
      json: {
        center: { lat: 41.8781, lon: -87.6298, label: "Chicago" },
        places: [
          {
            id: "mock-cava",
            name: "CAVA",
            lat: 41.879,
            lon: -87.63,
            distanceMiles: 0.2,
            category: "fast_food",
            matchedRestaurantId: "cava",
            matchedRestaurantName: "CAVA",
          },
          {
            id: "mock-local",
            name: "Local Grill",
            lat: 41.877,
            lon: -87.628,
            distanceMiles: 0.4,
            category: "restaurant",
            matchedRestaurantId: null,
            matchedRestaurantName: null,
          },
        ],
        fallbackRestaurantIds: ["chipotle", "sweetgreen"],
        sourceNote:
          "Nearby places come from OpenStreetMap. FuelWell added database picks when fewer local places match published chain nutrition.",
      },
    });
  });
  await page.goto("/app/log");
  await page.getByRole("button", { name: "Restaurants" }).click();
  await expect(page.getByText("Restaurants nearby")).toBeVisible();
  await page.getByLabel("Search restaurants by ZIP or city").fill("60606");
  await page.getByRole("button", { name: "Search area" }).click();
  await expect(page.getByText("Local map")).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in restaurant map" })).toBeVisible();
  await page.getByTestId("nearby-place-mock-cava").click();
  await expect(page.getByText("Restaurant page")).toBeVisible();
  await expect(page.getByText(/Always actionable/i)).toBeVisible();
  await page.getByLabel("Search restaurant menu items").fill("cava chicken");
  await expect(page.getByText("CAVA").first()).toBeVisible();
  await expect(page.getByText(/Covers .*remaining protein/i).first()).toBeVisible();
  await page.getByRole("button", { name: /Log menu item/i }).first().click();
  await expect(page.getByText(/CAVA ·/i).first()).toBeVisible();
  await expect(page.getByText("Goal impact · database")).toBeVisible();
});

test("Log: photo draft requires review before saving an estimate", async ({ page }) => {
  await page.goto("/app/log");
  await page.getByRole("button", { name: "Photo" }).click();
  await page.getByLabel("Describe visible foods").fill("chicken, rice");
  await page.getByRole("button", { name: /Estimate draft/i }).click();
  await expect(page.getByText(/Review is required before anything is saved/i)).toBeVisible();
  await page.getByRole("button", { name: /Save reviewed/i }).first().click();
  await expect(page.getByText("Goal impact · estimate")).toBeVisible();
  await expect(page.getByText(/Macro source: estimate/i)).toBeVisible();
});

test("Coach: agentic chat surface renders", async ({ page }) => {
  // Full live-model log flow is covered in coach.spec.ts ("log meal updates
  // dashboard"); the smoke check just verifies the new surface renders.
  await page.goto("/app/coach");
  await expect(page.getByLabel("Message Coach")).toBeVisible();
  await expect(page.getByLabel("Attach files or photos")).toBeAttached();
  await expect(
    page.getByPlaceholder("Upload a food photo, email, label, workout image, or ask anything...")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New chat" })).toBeVisible();
});

test("Workouts: two paths and working category filters", async ({ page }) => {
  await page.goto("/app/workouts");
  await expect(page.getByText("Pick my own")).toBeVisible();
  await expect(page.getByText("Coach recommends")).toBeVisible();
  await page.getByLabel("Body part").selectOption("upper");
  await page.getByLabel("Workout type").selectOption("Strength");
  await expect(page.getByText("Upper push base")).toBeVisible();
  await expect(page.getByRole("link", { name: /Preview Upper push base/i })).toBeVisible();
});

test("Progress: stacked macro bars render and window toggles", async ({ page }) => {
  await page.goto("/app/progress");
  await expect(page.getByRole("button", { name: /30 days/i })).toBeVisible();
  await page.getByRole("button", { name: /30 days/i }).click();
  await expect(page.getByRole("button", { name: /7 days/i })).toBeVisible();
});

test("Settings: page loads with sign out", async ({ page }) => {
  await page.goto("/app/settings");
  await expect(page.getByRole("button", { name: /Sign out/i })).toBeVisible();
});

test("Settings: Garmin integration preview state is honest and source-labeled", async ({
  page,
}) => {
  await page.goto("/app/settings");
  await expect(page.getByText("Garmin Connect")).toBeVisible();
  await page.getByRole("button", { name: "Use preview sample" }).click();
  await expect(page.getByText("Preview sample", { exact: true })).toBeVisible();
  await expect(page.getByText(/Preview-only sample data; no Garmin account is connected/i)).toBeVisible();
  await expect(page.getByText(/430 active calories/i)).toBeVisible();
});

test("Auth: all three OAuth buttons present on login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Facebook/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Apple/i })).toBeVisible();
});

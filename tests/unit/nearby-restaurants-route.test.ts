import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/restaurants/nearby/route";

describe("/api/restaurants/nearby", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires either coordinates or a ZIP/city query", async () => {
    const response = await GET(new Request("http://fuelwell.test/api/restaurants/nearby"));
    expect(response.status).toBe(400);
  });

  it("geocodes ZIP search and sorts matched restaurants first", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.startsWith("https://nominatim.openstreetmap.org")) {
        return new Response(
          JSON.stringify([
            {
              lat: "41.8781",
              lon: "-87.6298",
              display_name: "Chicago, Cook County, Illinois, United States",
            },
          ]),
          { status: 200 },
        );
      }

      return new Response(
        JSON.stringify({
          elements: [
            {
              id: 1,
              type: "node",
              lat: 41.879,
              lon: -87.63,
              tags: { name: "Local Taco Counter", amenity: "restaurant" },
            },
            {
              id: 2,
              type: "node",
              lat: 41.8785,
              lon: -87.6299,
              tags: { name: "CAVA", amenity: "fast_food" },
            },
          ],
        }),
        { status: 200 },
      );
    });

    const response = await GET(
      new Request("http://fuelwell.test/api/restaurants/nearby?zip=60606&radius=1000"),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      center: { label: string };
      places: Array<{ name: string; matchedRestaurantId: string | null }>;
      fallbackRestaurantIds: string[];
    };

    expect(body.center.label).toContain("Chicago");
    expect(body.places[0].matchedRestaurantId).toBe("cava");
    expect(body.places.some((place) => place.name === "Local Taco Counter")).toBe(true);
    expect(body.fallbackRestaurantIds.length).toBeGreaterThan(0);
  });
});

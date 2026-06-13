import { z } from "zod";
import {
  ALL_RESTAURANTS,
  distanceMiles,
  matchRestaurantByName,
  type MapCenter,
  type NearbyPlace,
} from "@/lib/restaurant-menu";

export const maxDuration = 15;

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  zip: z.string().trim().min(3).max(80).optional(),
  radius: z.coerce.number().min(500).max(8000).default(3500),
}).refine((value) => (value.lat !== undefined && value.lon !== undefined) || Boolean(value.zip), {
  message: "Location coordinates or a ZIP/city query are required.",
});

type OverpassElement = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    amenity?: string;
    cuisine?: string;
    brand?: string;
  };
};

type NearbyResponseBody = {
  places: NearbyPlace[];
  center: MapCenter | null;
  fallbackRestaurantIds: string[];
  sourceNote: string;
};

function categoryFromAmenity(value?: string): NearbyPlace["category"] {
  if (value === "restaurant" || value === "fast_food" || value === "cafe") return value;
  return "other";
}

async function geocodeLocation(query: string): Promise<MapCenter | null> {
  const isZip = /^\d{5}(?:-\d{4})?$/.test(query);
  const params = new URLSearchParams({
    country: "USA",
    format: "jsonv2",
    limit: "1",
  });
  if (isZip) {
    params.set("postalcode", query);
  } else {
    params.set("q", query);
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "FuelWell preview restaurant finder",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
    name?: string;
  }>;
  const row = rows[0];
  const lat = Number(row?.lat);
  const lon = Number(row?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat,
    lon,
    label: row.name || row.display_name?.split(",").slice(0, 2).join(", ") || query,
  };
}

function fallbackRestaurantIds(places: NearbyPlace[]) {
  const matched = new Set(places.map((place) => place.matchedRestaurantId).filter(Boolean));
  const anchors = [
    "chipotle",
    "chick-fil-a",
    "cava",
    "sweetgreen",
    "starbucks",
    "subway",
    "panera-bread",
    "panda-express",
  ];
  return anchors
    .filter((id) => !matched.has(id) && ALL_RESTAURANTS.some((restaurant) => restaurant.id === id))
    .slice(0, Math.max(0, 4 - matched.size));
}

async function lookupPlaces(center: MapCenter, radius: number): Promise<NearbyPlace[]> {
  const { lat, lon } = center;
  const radii = [radius, Math.min(radius * 1.75, 8000)];
  const seen = new Set<string>();
  const places: NearbyPlace[] = [];

  for (const searchRadius of radii) {
    const query = `
      [out:json][timeout:8];
      (
        node["amenity"~"restaurant|fast_food|cafe"](around:${Math.round(searchRadius)},${lat},${lon});
        way["amenity"~"restaurant|fast_food|cafe"](around:${Math.round(searchRadius)},${lat},${lon});
        relation["amenity"~"restaurant|fast_food|cafe"](around:${Math.round(searchRadius)},${lat},${lon});
      );
      out center tags 100;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "FuelWell preview restaurant finder",
      },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Overpass returned ${response.status}`);
    }

    const payload = (await response.json()) as { elements?: OverpassElement[] };
    for (const element of payload.elements ?? []) {
      const name = element.tags?.brand || element.tags?.name;
      const placeLat = element.lat ?? element.center?.lat;
      const placeLon = element.lon ?? element.center?.lon;
      if (!name || placeLat === undefined || placeLon === undefined) continue;
      const match = matchRestaurantByName(name);
      const key = `${name.toLowerCase()}-${placeLat.toFixed(4)}-${placeLon.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      places.push({
        id: `${element.type}-${element.id}`,
        name,
        lat: placeLat,
        lon: placeLon,
        distanceMiles: Math.round(distanceMiles(center, { lat: placeLat, lon: placeLon }) * 10) / 10,
        category: categoryFromAmenity(element.tags?.amenity),
        matchedRestaurantId: match?.id ?? null,
        matchedRestaurantName: match?.name ?? null,
      });
    }

    if (places.filter((place) => place.matchedRestaurantId).length >= 3 || places.length >= 24) break;
  }

  return places
    .sort((a, b) => {
      if (a.matchedRestaurantId && !b.matchedRestaurantId) return -1;
      if (!a.matchedRestaurantId && b.matchedRestaurantId) return 1;
      return a.distanceMiles - b.distanceMiles;
    })
    .slice(0, 50);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat") ?? undefined,
    lon: url.searchParams.get("lon") ?? undefined,
    zip: url.searchParams.get("zip") ?? undefined,
    radius: url.searchParams.get("radius") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: "A valid current location or ZIP/city search is required." }, { status: 400 });
  }

  const { radius } = parsed.data;
  let center: MapCenter | null = null;
  try {
    center =
      parsed.data.lat !== undefined && parsed.data.lon !== undefined
        ? { lat: parsed.data.lat, lon: parsed.data.lon, label: "Current location" }
        : parsed.data.zip
          ? await geocodeLocation(parsed.data.zip)
          : null;
  } catch {
    center = null;
  }

  if (!center) {
    return Response.json(
      {
        places: [],
        center: null,
        fallbackRestaurantIds: fallbackRestaurantIds([]),
        sourceNote:
          "FuelWell could not find that ZIP or city. You can still search the restaurant nutrition database.",
      } satisfies NearbyResponseBody,
      { status: 200 },
    );
  }

  try {
    const places = await lookupPlaces(center, radius);
    const fallback = fallbackRestaurantIds(places);

    return Response.json({
      places,
      center,
      fallbackRestaurantIds: fallback,
      sourceNote:
        fallback.length > 0
          ? "Nearby places come from OpenStreetMap. FuelWell added database picks when fewer local places match published chain nutrition."
          : "Nearby places come from OpenStreetMap. Menu nutrition is available when FuelWell can match the local place to a restaurant database chain.",
    } satisfies NearbyResponseBody);
  } catch {
    return Response.json({
      places: [],
      center,
      fallbackRestaurantIds: fallbackRestaurantIds([]),
      sourceNote:
        "Nearby restaurant lookup is unavailable right now. FuelWell is showing reliable database picks you can still log.",
    } satisfies NearbyResponseBody);
  }
}

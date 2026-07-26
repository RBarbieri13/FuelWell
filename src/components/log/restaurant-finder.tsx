"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Check,
  Compass,
  ExternalLink,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Search,
  SearchX,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import {
  ALL_RESTAURANTS,
  menuItemTotals,
  restaurantBrand,
  restaurantStats,
  searchRestaurantMenus,
  type MapCenter,
  type NearbyPlace,
  type RestaurantMenuSearchResult,
} from "@/lib/restaurant-menu";
import type { MacroTotals } from "@/lib/fuelwell-data";
import type { Restaurant } from "@/lib/restaurant-database";
import { cn } from "@/lib/utils/cn";

type NearbyResponse = {
  places: NearbyPlace[];
  center: MapCenter | null;
  fallbackRestaurantIds: string[];
  sourceNote: string;
};

const QUICK_FILTERS = [
  { label: "High protein", value: "high protein" },
  { label: "Under 600", value: "under 600" },
  { label: "Chicken", value: "chicken" },
  { label: "Salad", value: "salad" },
  { label: "Bowl", value: "bowl" },
  { label: "Breakfast", value: "breakfast" },
];

const FEATURED_LOCAL_PINS = [
  { id: "chipotle", left: 18, top: 34 },
  { id: "chick-fil-a", left: 62, top: 27 },
  { id: "cava", left: 43, top: 58 },
  { id: "sweetgreen", left: 76, top: 66 },
  { id: "starbucks", left: 31, top: 74 },
  { id: "panera-bread", left: 68, top: 48 },
];

type Props = {
  totals: MacroTotals;
  targets: MacroTotals;
  onLogItem: (input: {
    restaurantName: string;
    itemName: string;
    serving: string;
    totals: MacroTotals;
    sourceUrl: string;
  }) => void;
};

function remaining(current: number, target: number) {
  return Math.max(0, Math.round(target - current));
}

function restaurantById(id: string | null | undefined) {
  if (!id) return null;
  return ALL_RESTAURANTS.find((restaurant) => restaurant.id === id) ?? null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pinPosition(
  point: { lat: number; lon: number },
  center: MapCenter | null,
  places: NearbyPlace[],
  zoom: number,
) {
  if (center) {
    const latMiles = (center.lat - point.lat) * 69;
    const lonMiles = (point.lon - center.lon) * 69 * Math.cos((center.lat * Math.PI) / 180);
    const spanMiles = Math.max(1.1, 16 / 2 ** (zoom - 11));
    return {
      left: clamp(50 + (lonMiles / spanMiles) * 46, 7, 93),
      top: clamp(50 + (latMiles / spanMiles) * 46, 7, 93),
    };
  }

  const lats = places.map((p) => p.lat);
  const lons = places.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const lonSpan = Math.max(0.0001, maxLon - minLon);
  const latSpan = Math.max(0.0001, maxLat - minLat);
  return {
    left: 12 + ((point.lon - minLon) / lonSpan) * 76,
    top: 12 + ((maxLat - point.lat) / latSpan) * 76,
  };
}

function resultMacros(result: RestaurantMenuSearchResult) {
  const { item } = result;
  return `${item.calories} kcal · ${item.protein}g P · ${item.carbs}g C · ${item.fat}g F`;
}

/** Ranking score badge tone — the same mapping used in both result surfaces. */
function scoreTone(tone: RestaurantMenuSearchResult["insight"]["tone"]) {
  return tone === "success" ? "success" : tone === "warning" ? "warning" : "info";
}

const SCORE_BAR_TONE: Record<"success" | "warning" | "info", string> = {
  success: "bg-primary-500",
  warning: "bg-lemon-500",
  info: "bg-sky-500",
};

/**
 * Fit score as a chip plus a 0–100 meter. A bare number tells you nothing about
 * whether 62 is good; sitting on a track against a fixed scale, it does.
 */
function FitScore({ result }: { result: RestaurantMenuSearchResult }) {
  const tone = scoreTone(result.insight.tone);
  const score = Math.max(0, Math.min(100, Math.round(result.score * 100)));
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <Badge variant={tone} size="sm">
        <span className="tabular-nums">{score}</span> fit
      </Badge>
      <span
        role="img"
        aria-label={`Fit score ${score} out of 100`}
        className="block h-1 w-16 overflow-hidden rounded-full bg-surface-sunken"
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500 ease-out-soft",
            SCORE_BAR_TONE[tone]
          )}
          style={{ width: `${Math.max(3, score)}%` }}
        />
      </span>
    </div>
  );
}

function BrandLogo({
  restaurant,
  className,
  label = "logo",
}: {
  restaurant: Pick<Restaurant, "id" | "name">;
  className?: string;
  label?: "logo" | "name";
}) {
  const brand = restaurantBrand(restaurant);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-black",
        className
      )}
      style={{
        backgroundColor: brand.bg,
        color: brand.fg,
        // Inset ring instead of a 2px border: same brand edge, no layout shift
        // and no competing box-shadow on the parent.
        boxShadow: `inset 0 0 0 2px ${brand.ring}`,
      }}
      aria-hidden="true"
    >
      {label === "name" ? brand.shortName : brand.initials}
    </span>
  );
}

function logRestaurantItem(
  result: RestaurantMenuSearchResult,
  onLogItem: Props["onLogItem"],
) {
  onLogItem({
    restaurantName: result.restaurant.name,
    itemName: result.item.name,
    serving: result.item.serving,
    totals: menuItemTotals(result.item),
    sourceUrl: result.item.sourceUrl,
  });
}

export function RestaurantFinder({ totals, targets, onLogItem }: Props) {
  const stats = restaurantStats();
  const [query, setQuery] = useState("");
  const [preference, setPreference] = useState("high protein");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [fallbackRestaurantIds, setFallbackRestaurantIds] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<MapCenter | null>(null);
  const [zoom, setZoom] = useState(12);
  const [zipQuery, setZipQuery] = useState("");
  const [sourceNote, setSourceNote] = useState(
    "Use your location or enter a ZIP/city to prioritize nearby restaurants, then search every menu in FuelWell."
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "ready" | "denied" | "error"
  >("idle");

  const remainingMacros = {
    calories: remaining(totals.calories, targets.calories),
    protein: remaining(totals.protein, targets.protein),
    carbs: remaining(totals.carbs, targets.carbs),
    fat: remaining(totals.fat, targets.fat),
  };

  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;
  const selectedRestaurant = restaurantById(selectedRestaurantId);

  const matchedPlaces = places.filter((place) => place.matchedRestaurantId);
  const nearbyRestaurantIds = matchedPlaces
    .map((place) => place.matchedRestaurantId)
    .filter((id): id is string => Boolean(id));

  const nearbyRestaurants = ALL_RESTAURANTS.filter((restaurant) =>
    nearbyRestaurantIds.includes(restaurant.id)
  );
  const fallbackRestaurants = fallbackRestaurantIds
    .map((id) => restaurantById(id))
    .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
  const popularRestaurants = ALL_RESTAURANTS.filter((restaurant) =>
    ["chipotle", "chick-fil-a", "cava", "sweetgreen", "starbucks", "subway"].includes(restaurant.id)
  );
  const seenRestaurants = new Set<string>();
  const visibleRestaurants = [...nearbyRestaurants, ...fallbackRestaurants, ...popularRestaurants, ...ALL_RESTAURANTS].filter(
    (restaurant) => {
      if (seenRestaurants.has(restaurant.id)) return false;
      seenRestaurants.add(restaurant.id);
      return true;
    }
  );

  const results = searchRestaurantMenus({
    query,
    restaurantId: selectedRestaurantId,
    preference,
    remaining: remainingMacros,
    limit: 18,
  });

  const detailResults = selectedRestaurantId
    ? searchRestaurantMenus({
        restaurantId: selectedRestaurantId,
        preference,
        remaining: remainingMacros,
        limit: 4,
      })
    : [];

  async function loadNearby(params: URLSearchParams) {
    setLocationStatus("loading");
    const res = await fetch(`/api/restaurants/nearby?${params.toString()}`);
    const data = (await res.json()) as NearbyResponse;
    setPlaces(data.places ?? []);
    setFallbackRestaurantIds(data.fallbackRestaurantIds ?? []);
    setMapCenter(data.center ?? null);
    setSourceNote(data.sourceNote);
    setSelectedPlaceId(null);
    setLocationStatus("ready");
  }

  async function useLocation() {
    setSourceNote("FuelWell will ask for location permission, then look for nearby restaurants and fast food.");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setSourceNote("Location is not available in this browser. Enter a ZIP or city instead.");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const params = new URLSearchParams({
            lat: String(position.coords.latitude),
            lon: String(position.coords.longitude),
            radius: "4500",
          });
          await loadNearby(params);
        } catch {
          setLocationStatus("error");
          setSourceNote("Nearby lookup failed. Enter a ZIP or search the restaurant database instead.");
        }
      },
      () => {
        setLocationStatus("denied");
        setSourceNote("Location permission was not granted. Enter a ZIP/city or search every restaurant in FuelWell.");
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 }
    );
  }

  async function lookupZip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = zipQuery.trim();
    if (!value) return;
    try {
      setSourceNote(`Looking for restaurants near ${value}.`);
      await loadNearby(new URLSearchParams({ zip: value, radius: "4500" }));
    } catch {
      setLocationStatus("error");
      setSourceNote("FuelWell could not complete that place search. You can still search the full restaurant database.");
    }
  }

  function pickRestaurant(id: string | null, placeId?: string | null) {
    setSelectedRestaurantId(id);
    setSelectedPlaceId(placeId ?? null);
    setQuery("");
  }

  function pickPlace(place: NearbyPlace) {
    pickRestaurant(place.matchedRestaurantId, place.id);
  }

  const previewPins = fallbackRestaurantIds.length > 0 ? fallbackRestaurantIds : FEATURED_LOCAL_PINS.map((pin) => pin.id);

  const mapControlButton =
    "fw-press flex h-11 w-11 items-center justify-center text-ink-muted hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-primary-600 md:h-9 md:w-9";

  return (
    <Card className="space-y-5">
      <SectionHeader
        as="h2"
        icon={Store}
        title="Restaurants nearby"
        description="Browse nearby restaurants and fast food, search menu items, and preview how each order fits today's macro plan."
        action={
          <Button onClick={useLocation} loading={locationStatus === "loading"} variant="secondary">
            <LocateFixed className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Use my location
          </Button>
        }
      />

      <div className="grid gap-4 2xl:grid-cols-[0.94fr_1.06fr]">
        <div className="min-w-0 space-y-4">
          <form
            onSubmit={lookupZip}
            className="flex flex-col gap-2 rounded-[1.35rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <MapPin
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
                strokeWidth={2}
              />
              <input
                value={zipQuery}
                onChange={(event) => setZipQuery(event.target.value)}
                placeholder="ZIP or city"
                aria-label="Search restaurants by ZIP or city"
                className="min-h-11 w-full min-w-0 rounded-[1.15rem] bg-surface pl-10 pr-4 text-sm font-bold text-ink ring-1 ring-inset ring-hairline-strong transition placeholder:font-semibold placeholder:text-ink-faint hover:ring-primary-200 focus:outline-none focus:ring-[3px] focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="secondary" loading={locationStatus === "loading"} className="shrink-0 sm:min-w-28">
              <Search className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              Search area
            </Button>
          </form>

          <div
            className="relative min-h-80 overflow-hidden rounded-[1.5rem] bg-surface-sunken ring-1 ring-inset ring-hairline-strong"
            role="region"
            aria-label="Restaurant map with current location, nearby places, and FuelWell menu database picks"
            aria-busy={locationStatus === "loading" || undefined}
            data-testid="restaurant-map"
          >
            <div aria-hidden="true" className="absolute inset-0 opacity-80">
              <div className="absolute left-0 top-1/4 h-10 w-full -rotate-12 bg-surface/65" />
              <div className="absolute left-1/4 top-0 h-full w-8 rotate-12 bg-surface/55" />
              <div className="absolute bottom-10 left-0 h-8 w-full rotate-6 bg-surface/45" />
              <div className="absolute right-0 top-12 h-7 w-3/4 -rotate-3 bg-surface/45" />
              <div className="absolute left-12 top-12 h-24 w-28 rounded-full bg-primary-100/40 ring-1 ring-inset ring-primary-200/60" />
              <div className="absolute bottom-8 right-10 h-28 w-36 rounded-full bg-sky-100/30 ring-1 ring-inset ring-sky-200/60" />
            </div>

            <div className="absolute right-3 top-3 z-20 flex flex-col divide-y divide-hairline overflow-hidden rounded-[0.9rem] bg-surface shadow-e2 ring-1 ring-inset ring-hairline">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(16, value + 1))}
                className={mapControlButton}
                aria-label="Zoom in restaurant map"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(10, value - 1))}
                className={mapControlButton}
                aria-label="Zoom out restaurant map"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(12)}
                className={mapControlButton}
                aria-label="Recenter restaurant map"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>

            <div
              className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-black text-white shadow-e3"
              aria-label={mapCenter ? `Current location: ${mapCenter.label}` : "Current location preview"}
            >
              <Navigation className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
              You
            </div>

            {places.length > 0
              ? places.slice(0, 22).map((place) => {
                  const position = pinPosition(place, mapCenter, places, zoom);
                  const restaurant = restaurantById(place.matchedRestaurantId);
                  const matched = Boolean(restaurant);
                  return (
                    <button
                      key={place.id}
                      type="button"
                      title={`${place.name}${place.distanceMiles ? ` · ${place.distanceMiles} mi` : ""}`}
                      aria-label={`${place.name}${matched ? `, opens ${restaurant?.name} menu page` : ", local restaurant without matched menu yet"}`}
                      data-testid={`restaurant-map-pin-${place.id}`}
                      onClick={() => pickPlace(place)}
                      className={cn(
                        "fw-press absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-1.5 py-1 text-[10px] font-black shadow-e2 ring-1 ring-inset hover:z-20 hover:scale-105 hover:shadow-e3 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600",
                        selectedPlaceId === place.id
                          ? "bg-surface text-ink ring-2 ring-ink"
                          : matched
                            ? "bg-surface text-ink-muted ring-hairline-strong"
                            : "bg-surface/90 text-ink-subtle ring-hairline"
                      )}
                      style={{ left: `${position.left}%`, top: `${position.top}%` }}
                    >
                      {restaurant ? (
                        <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted text-ink-subtle"
                        >
                          <Store className="h-3.5 w-3.5" strokeWidth={2} />
                        </span>
                      )}
                      <span className="hidden max-w-24 truncate md:inline">{restaurant?.name ?? place.name}</span>
                    </button>
                  );
                })
              : (fallbackRestaurantIds.length > 0 ? [] : FEATURED_LOCAL_PINS).map((pin) => {
                  const restaurant = restaurantById(pin.id);
                  if (!restaurant) return null;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => pickRestaurant(pin.id)}
                      aria-label={`Open ${restaurant.name} menu page`}
                      className={cn(
                        "fw-press absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-surface px-1.5 py-1 text-[10px] font-black text-ink-muted shadow-e2 ring-1 ring-inset ring-hairline-strong hover:z-20 hover:scale-105 hover:bg-primary-50 hover:shadow-e3 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600",
                        selectedRestaurantId === restaurant.id && "ring-2 ring-ink"
                      )}
                      style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
                    >
                      <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                      <span className="hidden max-w-24 truncate md:inline">{restaurant.name}</span>
                    </button>
                  );
                })}

            {places.length === 0 &&
              fallbackRestaurantIds.length > 0 &&
              previewPins.slice(0, 4).map((id, index) => {
                const restaurant = restaurantById(id);
                if (!restaurant) return null;
                const fallbackPositions = [
                  { left: 24, top: 32 },
                  { left: 68, top: 30 },
                  { left: 38, top: 68 },
                  { left: 74, top: 66 },
                ];
                const position = fallbackPositions[index] ?? fallbackPositions[0];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pickRestaurant(id)}
                    aria-label={`Open ${restaurant.name} FuelWell database pick`}
                    className="fw-press absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-surface px-1.5 py-1 text-[10px] font-black text-ink-muted shadow-e2 ring-1 ring-inset ring-hairline-strong hover:z-20 hover:scale-105 hover:shadow-e3 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
                    style={{ left: `${position.left}%`, top: `${position.top}%` }}
                  >
                    <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                    <span className="hidden md:inline">Menu pick</span>
                  </button>
                );
              })}

            <div className="absolute bottom-3 left-3 right-3 z-20 rounded-[1.25rem] bg-surface/92 p-3 shadow-e2 ring-1 ring-inset ring-hairline backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {/* Preview vs live is the single most important thing to be
                      honest about here — a badge, not a caption. */}
                  {locationStatus === "ready" ? (
                    <Badge variant="success" size="sm" dot>
                      Local map
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" dot>
                      Preview map · not your location
                    </Badge>
                  )}
                  <p className="mt-1.5 text-sm font-black text-ink">
                    {matchedPlaces.length > 0 ? (
                      <>
                        <span className="tabular-nums">{matchedPlaces.length}</span>{" "}
                        local places matched to menu nutrition
                      </>
                    ) : (
                      <>
                        <span className="tabular-nums">{stats.restaurantCount}</span>{" "}
                        chains ·{" "}
                        <span className="tabular-nums">{stats.itemCount}</span> menu
                        items
                      </>
                    )}
                  </p>
                  {mapCenter && (
                    <p className="mt-0.5 truncate text-xs font-semibold text-ink-muted">
                      Centered on {mapCenter.label} · zoom{" "}
                      <span className="tabular-nums">{zoom}</span>
                    </p>
                  )}
                </div>
                <Compass
                  className="h-5 w-5 shrink-0 text-primary-700"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Legend: a pin map with two pin states needs a key, or the muted
              pins read as broken rather than as "no menu match yet". */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[0.6875rem] font-bold text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-surface ring-1 ring-inset ring-hairline-strong"
              />
              Matched menu
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-surface/90 ring-1 ring-inset ring-hairline"
              />
              No menu match yet
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-ink" />
              You
            </span>
          </div>

          <div
            className="rounded-[1.25rem] bg-primary-50/55 p-3 ring-1 ring-inset ring-primary-100"
            role="status"
            aria-live="polite"
            data-testid="restaurant-source-note"
          >
            <p className="text-xs font-bold leading-5 text-ink-muted">{sourceNote}</p>
          </div>

          <div className="grid max-h-80 gap-2 overflow-y-auto overscroll-contain pr-1">
            {places.length > 0 ? (
              places.slice(0, 18).map((place) => {
                const restaurant = restaurantById(place.matchedRestaurantId);
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => pickPlace(place)}
                    data-testid={`nearby-place-${place.id}`}
                    className={cn(
                      "fw-press flex min-h-14 items-center justify-between gap-3 rounded-[1.15rem] px-3 py-2 text-left ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                      selectedPlaceId === place.id
                        ? "bg-primary-50 shadow-e1 ring-2 ring-primary-400"
                        : restaurant
                          ? "bg-surface ring-hairline hover:bg-primary-50/60 hover:ring-primary-200"
                          : "bg-surface/70 ring-hairline hover:ring-hairline-strong"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {restaurant ? (
                        <BrandLogo restaurant={restaurant} className="h-9 w-9" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-subtle"
                        >
                          <Store className="h-4 w-4" strokeWidth={2} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-ink">{place.name}</p>
                        <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                          <span className="tabular-nums">{place.distanceMiles}</span> mi ·{" "}
                          {restaurant?.name ?? "Local place; use database picks below"}
                        </p>
                      </div>
                    </div>
                    {restaurant ? (
                      <Badge variant="success" size="sm">Menu</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Nearby</Badge>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {visibleRestaurants.slice(0, 10).map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => pickRestaurant(restaurant.id)}
                    className={cn(
                      "fw-press flex min-h-12 items-center gap-2 rounded-[1.15rem] px-3 py-2 text-left text-sm font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                      selectedRestaurantId === restaurant.id
                        ? "bg-primary-50 text-primary-800 shadow-e1 ring-2 ring-primary-400"
                        : "bg-surface text-ink-muted ring-hairline hover:bg-primary-50/50 hover:ring-primary-200"
                    )}
                  >
                    <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                    <span className="min-w-0 truncate">{restaurant.name}</span>
                  </button>
                ))}
              </div>
            )}

            {fallbackRestaurants.length > 0 && (
              <div className="mt-1 rounded-[1.35rem] bg-primary-50/50 p-3 ring-1 ring-inset ring-primary-100">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-primary-700">
                  Always actionable
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {fallbackRestaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      type="button"
                      onClick={() => pickRestaurant(restaurant.id)}
                      className="fw-press flex min-h-11 items-center gap-2 rounded-[0.9rem] bg-surface px-2.5 py-2 text-left text-xs font-black text-ink ring-1 ring-inset ring-hairline hover:bg-primary-50/60 hover:ring-primary-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                    >
                      <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                      <span className="min-w-0 truncate">{restaurant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {(selectedRestaurant || selectedPlace) && (
            <div className="rounded-[1.35rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline-strong">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedRestaurant ? (
                    <BrandLogo restaurant={selectedRestaurant} className="h-12 w-12 text-sm" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-subtle"
                    >
                      <Store className="h-5 w-5" strokeWidth={2} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-primary-700">
                      Restaurant page
                    </p>
                    <h3 className="truncate text-lg font-black text-ink">
                      {selectedRestaurant?.name ?? selectedPlace?.name}
                    </h3>
                    <p className="text-xs font-semibold text-ink-muted">
                      {selectedPlace
                        ? `${selectedPlace.distanceMiles} mi from ${mapCenter?.label ?? "you"}`
                        : "FuelWell menu database pick"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => pickRestaurant(null)}
                  className="fw-press inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] text-ink-subtle ring-1 ring-inset ring-transparent hover:bg-surface-muted hover:text-ink hover:ring-hairline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:h-9 md:w-9"
                  aria-label="Close restaurant page"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>

              {selectedRestaurant ? (
                <div className="mt-4 grid gap-2">
                  {detailResults.map((result) => (
                    <div
                      key={result.item.id}
                      className="rounded-[1.15rem] bg-surface p-3 ring-1 ring-inset ring-hairline"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-ink">{result.item.name}</p>
                          <p className="mt-0.5 text-xs font-bold tabular-nums text-ink-muted">
                            {resultMacros(result)}
                          </p>
                        </div>
                        <FitScore result={result} />
                      </div>
                      <p className="mt-2 text-xs font-bold leading-5 text-ink-muted">
                        {result.insight.headline}. {result.insight.proteinLine}.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[1.15rem] border border-dashed border-hairline-strong bg-surface-muted p-3">
                  <p className="text-sm font-bold text-ink">FuelWell has this local place on the map, but no published menu match yet.</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-ink-muted">
                    Use the database picks below for exact macros, or search a similar chain/item and log it with lower confidence later.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-[1.35rem] bg-surface-muted p-3 ring-1 ring-inset ring-hairline">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-600"
                strokeWidth={2}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search menu items or restaurants"
                aria-label="Search restaurant menu items"
                className="min-h-12 w-full min-w-0 rounded-[1.15rem] bg-surface pl-10 pr-4 text-base font-bold text-ink ring-1 ring-inset ring-hairline-strong transition placeholder:font-semibold placeholder:text-ink-faint hover:ring-primary-200 focus:outline-none focus:ring-[3px] focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Quick menu filters" role="group">
              {QUICK_FILTERS.map((filter) => {
                const isOn = preference === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setPreference(isOn ? "" : filter.value)}
                    aria-pressed={isOn}
                    className={cn(
                      "fw-press inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black ring-1 ring-inset focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-9",
                      isOn
                        ? "bg-primary-700 text-white shadow-e1 ring-primary-800"
                        : "bg-surface text-ink-muted ring-hairline hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200"
                    )}
                  >
                    {isOn && (
                      <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                    )}
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-black text-ink-muted">
                {selectedRestaurant ? selectedRestaurant.name : "Searching all restaurants"}
              </p>
              {selectedRestaurant && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => pickRestaurant(null)}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="grid max-h-[34rem] gap-3 overflow-y-auto overscroll-contain pr-1">
            {results.length === 0 ? (
              <div className="rounded-[1.35rem] border border-dashed border-primary-200 bg-primary-50/60">
                <EmptyState
                  size="inline"
                  icon={SearchX}
                  title="No menu matches yet."
                  description="Try a restaurant name, item name, or a quick filter like chicken."
                />
              </div>
            ) : (
              results.map((result) => (
                <article
                  key={result.item.id}
                  // Sits inside the finder Card, so it steps down to the tinted
                  // face rather than repeating the card's own white.
                  className="rounded-[1.35rem] bg-surface-subtle p-4 ring-1 ring-inset ring-hairline-strong"
                  data-testid={`restaurant-menu-result-${result.item.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <BrandLogo restaurant={result.restaurant} className="mt-0.5 h-9 w-9" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-primary-700">
                          {result.restaurant.name}
                        </p>
                        <h3 className="mt-1 text-base font-black leading-5 text-ink">
                          {result.item.name}
                        </h3>
                        <p className="mt-1 text-xs font-bold tabular-nums text-ink-muted">
                          {result.item.serving} · {resultMacros(result)}
                        </p>
                      </div>
                    </div>
                    <FitScore result={result} />
                  </div>

                  <div className="mt-3 grid gap-2 rounded-[1.15rem] bg-surface px-3 py-2.5 ring-1 ring-inset ring-hairline sm:grid-cols-2">
                    <p className="text-xs font-bold leading-5 text-ink">
                      {result.insight.headline}
                    </p>
                    <p className="text-xs font-bold leading-5 text-ink-muted">
                      {result.insight.proteinLine}
                    </p>
                    <p className="text-xs font-semibold leading-5 text-ink-muted">
                      {result.insight.carbLine}
                    </p>
                    <p className="text-xs font-semibold leading-5 text-ink-muted">
                      {result.insight.fatLine}
                    </p>
                    <p className="sm:col-span-2 border-t border-hairline pt-2 text-xs font-bold leading-5 text-primary-800">
                      {result.insight.nextMove}
                    </p>
                  </div>

                  <p className="mt-2 text-xs font-semibold leading-5 text-ink-subtle">
                    {result.sourceLabel}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <a
                      href={result.item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full text-xs font-bold text-ink-subtle underline-offset-2 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 md:min-h-0"
                    >
                      Nutrition source
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    </a>
                    <Button size="sm" className="shrink-0" onClick={() => logRestaurantItem(result, onLogItem)}>
                      <UtensilsCrossed className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      Log menu item
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

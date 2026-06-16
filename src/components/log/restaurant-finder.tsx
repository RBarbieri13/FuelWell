"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Compass,
  ExternalLink,
  LocateFixed,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Search,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black shadow-sm",
        className
      )}
      style={{
        backgroundColor: brand.bg,
        borderColor: brand.ring,
        color: brand.fg,
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

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary-700" />
            <h2 className="text-lg font-black text-neutral-900">Restaurants nearby</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-neutral-500">
            Browse nearby restaurants and fast food, search menu items, and preview how each order fits today&apos;s macro plan.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={useLocation} loading={locationStatus === "loading"} variant="secondary">
            <LocateFixed className="h-4 w-4" />
            Use my location
          </Button>
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[0.94fr_1.06fr]">
        <div className="space-y-4">
          <form onSubmit={lookupZip} className="flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-3 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={zipQuery}
                onChange={(event) => setZipQuery(event.target.value)}
                placeholder="ZIP or city"
                aria-label="Search restaurants by ZIP or city"
                className="min-h-11 w-full rounded-2xl border border-neutral-200 bg-white pl-10 pr-4 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="secondary" loading={locationStatus === "loading"} className="sm:min-w-28">
              <Search className="h-4 w-4" />
              Search area
            </Button>
          </form>

          <div
            className="relative min-h-80 overflow-hidden rounded-2xl border border-neutral-200 bg-[#e8eee9]"
            role="region"
            aria-label="Restaurant map with current location, nearby places, and FuelWell menu database picks"
            data-testid="restaurant-map"
          >
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-0 top-1/4 h-10 w-full -rotate-12 bg-white/65" />
              <div className="absolute left-1/4 top-0 h-full w-8 rotate-12 bg-white/55" />
              <div className="absolute bottom-10 left-0 h-8 w-full rotate-6 bg-white/45" />
              <div className="absolute right-0 top-12 h-7 w-3/4 -rotate-3 bg-white/45" />
              <div className="absolute left-12 top-12 h-24 w-28 rounded-full border border-primary-200/60 bg-primary-100/40" />
              <div className="absolute bottom-8 right-10 h-28 w-36 rounded-full border border-sky-200/60 bg-sky-100/30" />
            </div>

            <div className="absolute right-3 top-3 z-20 flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(16, value + 1))}
                className="flex h-9 w-9 items-center justify-center text-neutral-700 hover:bg-neutral-50"
                aria-label="Zoom in restaurant map"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(10, value - 1))}
                className="flex h-9 w-9 items-center justify-center border-t border-neutral-100 text-neutral-700 hover:bg-neutral-50"
                aria-label="Zoom out restaurant map"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(12)}
                className="flex h-9 w-9 items-center justify-center border-t border-neutral-100 text-neutral-700 hover:bg-neutral-50"
                aria-label="Recenter restaurant map"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div
              className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-neutral-950 px-3 py-2 text-xs font-black text-white shadow-xl"
              aria-label={mapCenter ? `Current location: ${mapCenter.label}` : "Current location preview"}
            >
              <Navigation className="h-3.5 w-3.5" />
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
                        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-1.5 py-1 text-[10px] font-black shadow-lg transition hover:z-20 hover:scale-105",
                        selectedPlaceId === place.id
                          ? "border-neutral-950 bg-white text-neutral-950 ring-4 ring-primary-200"
                          : matched
                            ? "border-white bg-white text-neutral-800 shadow-primary-700/20"
                            : "border-neutral-200 bg-white/90 text-neutral-500 shadow-neutral-400/20"
                      )}
                      style={{ left: `${position.left}%`, top: `${position.top}%` }}
                    >
                      {restaurant ? (
                        <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                          <Store className="h-3.5 w-3.5" />
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
                        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-white bg-white px-1.5 py-1 text-[10px] font-black text-neutral-700 shadow-lg shadow-neutral-400/20 transition hover:z-20 hover:scale-105 hover:bg-primary-50",
                        selectedRestaurantId === restaurant.id && "ring-4 ring-primary-200"
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
                    className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-white bg-white px-1.5 py-1 text-[10px] font-black text-neutral-700 shadow-lg transition hover:z-20 hover:scale-105"
                    style={{ left: `${position.left}%`, top: `${position.top}%` }}
                  >
                    <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                    <span className="hidden md:inline">Menu pick</span>
                  </button>
                );
              })}

            <div className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl bg-white/90 p-3 shadow-lg shadow-neutral-500/10 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-neutral-400">
                    {locationStatus === "ready" ? "Local map" : "Preview map"}
                  </p>
                  <p className="text-sm font-bold text-neutral-800">
                    {matchedPlaces.length > 0
                      ? `${matchedPlaces.length} local places matched to menu nutrition`
                      : `${stats.restaurantCount} chains · ${stats.itemCount} menu items`}
                  </p>
                  {mapCenter && (
                    <p className="mt-0.5 truncate text-xs font-medium text-neutral-500">
                      Centered on {mapCenter.label} · zoom {zoom}
                    </p>
                  )}
                </div>
                <Compass className="h-5 w-5 text-primary-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3" role="status" aria-live="polite" data-testid="restaurant-source-note">
            <p className="text-xs font-bold leading-5 text-neutral-500">{sourceNote}</p>
          </div>

          <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
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
                      "flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition",
                      selectedPlaceId === place.id
                        ? "border-primary-300 bg-primary-50"
                        : restaurant
                          ? "border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/60"
                          : "border-dashed border-neutral-200 bg-white/70 text-neutral-500 hover:border-neutral-300"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {restaurant ? (
                        <BrandLogo restaurant={restaurant} className="h-9 w-9" />
                      ) : (
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                          <Store className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-neutral-900">{place.name}</p>
                        <p className="mt-0.5 text-xs font-medium text-neutral-500">
                          {place.distanceMiles} mi · {restaurant?.name ?? "Local place; use database picks below"}
                        </p>
                      </div>
                    </div>
                    {restaurant ? <Badge variant="success">Menu</Badge> : <Badge>Nearby</Badge>}
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
                      "flex min-h-12 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-black transition",
                      selectedRestaurantId === restaurant.id
                        ? "border-primary-300 bg-primary-50 text-primary-800"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-200"
                    )}
                  >
                    <BrandLogo restaurant={restaurant} className="h-7 w-7" />
                    <span className="min-w-0 truncate">{restaurant.name}</span>
                  </button>
                ))}
              </div>
            )}

            {fallbackRestaurants.length > 0 && (
              <div className="mt-1 rounded-2xl border border-primary-100 bg-primary-50/50 p-3">
                <p className="text-xs font-black uppercase text-primary-700">Always actionable</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {fallbackRestaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      type="button"
                      onClick={() => pickRestaurant(restaurant.id)}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-white bg-white px-2.5 py-2 text-left text-xs font-black text-neutral-800 shadow-sm"
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

        <div className="space-y-4">
          {(selectedRestaurant || selectedPlace) && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm shadow-neutral-200/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedRestaurant ? (
                    <BrandLogo restaurant={selectedRestaurant} className="h-12 w-12 text-sm" />
                  ) : (
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      <Store className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-primary-700">Restaurant page</p>
                    <h3 className="truncate text-lg font-black text-neutral-900">
                      {selectedRestaurant?.name ?? selectedPlace?.name}
                    </h3>
                    <p className="text-xs font-medium text-neutral-500">
                      {selectedPlace
                        ? `${selectedPlace.distanceMiles} mi from ${mapCenter?.label ?? "you"}`
                        : "FuelWell menu database pick"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => pickRestaurant(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
                  aria-label="Close restaurant page"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>

              {selectedRestaurant ? (
                <div className="mt-4 grid gap-3">
                  {detailResults.map((result) => (
                    <div key={result.item.id} className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-neutral-900">{result.item.name}</p>
                          <p className="mt-0.5 text-xs font-bold text-neutral-500">{resultMacros(result)}</p>
                        </div>
                        <Badge variant={result.insight.tone === "success" ? "success" : result.insight.tone === "warning" ? "warning" : "info"}>
                          {Math.round(result.score * 100)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs font-bold leading-5 text-neutral-600">
                        {result.insight.headline}. {result.insight.proteinLine}.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-sm font-bold text-neutral-800">FuelWell has this local place on the map, but no published menu match yet.</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-neutral-500">
                    Use the database picks below for exact macros, or search a similar chain/item and log it with lower confidence later.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search menu items or restaurants"
                aria-label="Search restaurant menu items"
                className="min-h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-10 pr-4 text-base font-bold text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Quick menu filters" role="group">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setPreference(preference === filter.value ? "" : filter.value)}
                  aria-pressed={preference === filter.value}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-black transition",
                    preference === filter.value
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-700"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-bold text-neutral-600">
                {selectedRestaurant ? selectedRestaurant.name : "Searching all restaurants"}
              </p>
              {selectedRestaurant && (
                <button
                  type="button"
                  onClick={() => pickRestaurant(null)}
                  className="text-xs font-black text-primary-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                <p className="font-bold text-neutral-900">No menu matches yet.</p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Try a restaurant name, item name, or a quick filter like chicken.
                </p>
              </div>
            ) : (
              results.map((result) => (
                <article
                  key={result.item.id}
                  className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm shadow-neutral-200/60"
                  data-testid={`restaurant-menu-result-${result.item.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <BrandLogo restaurant={result.restaurant} className="mt-0.5 h-9 w-9" />
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase text-primary-700">
                          {result.restaurant.name}
                        </p>
                        <h3 className="mt-1 text-base font-black leading-5 text-neutral-900">
                          {result.item.name}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-neutral-500">
                          {result.item.serving} · {resultMacros(result)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={result.insight.tone === "success" ? "success" : result.insight.tone === "warning" ? "warning" : "info"}>
                      {Math.round(result.score * 100)}
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-xl bg-neutral-50 px-3 py-2 sm:grid-cols-2">
                    <p className="text-xs font-bold leading-5 text-neutral-700">
                      {result.insight.headline}
                    </p>
                    <p className="text-xs font-bold leading-5 text-neutral-600">
                      {result.insight.proteinLine}
                    </p>
                    <p className="text-xs font-medium leading-5 text-neutral-500">
                      {result.insight.carbLine}
                    </p>
                    <p className="text-xs font-medium leading-5 text-neutral-500">
                      {result.insight.fatLine}
                    </p>
                    <p className="sm:col-span-2 text-xs font-bold leading-5 text-primary-800">
                      {result.insight.nextMove}
                    </p>
                  </div>

                  <p className="mt-2 text-xs font-medium leading-5 text-neutral-400">
                    {result.sourceLabel}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <a
                      href={result.item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-neutral-700"
                    >
                      Nutrition source
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Button size="sm" onClick={() => logRestaurantItem(result, onLogItem)}>
                      <UtensilsCrossed className="h-4 w-4" />
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

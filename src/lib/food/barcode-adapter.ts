import { FOOD_DATABASE, type FoodItem } from "@/lib/food-database";

export type BarcodeFoodResult = {
  barcode: string;
  provider: "fuelwell_seed";
  verified: boolean;
  food: FoodItem;
  sourceNote: string;
};

const BARCODE_TO_FOOD_NAME: Record<string, string> = {
  "000000000101": "Banana",
  "000000000102": "Apple",
  "000000000103": "Greek yogurt, nonfat plain",
  "000000000104": "Chicken breast, grilled",
  "000000000105": "Whey protein powder (dry)",
};

export function lookupBarcode(barcode: string): BarcodeFoodResult | null {
  const normalized = barcode.replace(/\D/g, "");
  if (normalized.length < 8 || normalized.length > 14) return null;
  const name = BARCODE_TO_FOOD_NAME[normalized];
  if (!name) return null;
  const food = FOOD_DATABASE.find((item) => item.name === name);
  if (!food) return null;
  return {
    barcode: normalized,
    provider: "fuelwell_seed",
    verified: true,
    food,
    sourceNote:
      "Matched by FuelWell's verified seed adapter. This adapter can be replaced with a commercial barcode provider without changing the Log flow.",
  };
}

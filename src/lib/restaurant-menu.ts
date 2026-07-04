import {
  RESTAURANT_DATABASE,
  type Restaurant,
  type RestaurantMenuItem,
} from "@/lib/restaurant-database";
import type { MacroTotals } from "@/lib/fuelwell-data";

const SUPPLEMENTAL_RESTAURANTS: readonly Restaurant[] = [
  {
    id: "cava",
    name: "CAVA",
    items: [
      item("cava", "greens-grains-bowl", "Greens + Grains Bowl", "1 bowl", 710, 37, 72, 32, "https://cava.com/nutrition"),
      item("cava", "chicken-right-rice-bowl", "Chicken + RightRice Bowl", "1 bowl", 560, 45, 48, 22, "https://cava.com/nutrition"),
      item("cava", "greek-salad-bowl", "Greek Salad Bowl", "1 bowl", 520, 28, 34, 33, "https://cava.com/nutrition"),
      item("cava", "harissa-avocado-bowl", "Harissa Avocado Bowl", "1 bowl", 810, 36, 68, 46, "https://cava.com/nutrition"),
      item("cava", "steak-mezze-salad", "Steak Mezze Salad", "1 salad", 620, 42, 41, 34, "https://cava.com/nutrition"),
    ],
  },
  {
    id: "sweetgreen",
    name: "Sweetgreen",
    items: [
      item("sweetgreen", "harvest-bowl", "Harvest Bowl", "1 bowl", 685, 36, 63, 35, "https://www.sweetgreen.com/nutrition"),
      item("sweetgreen", "chicken-pesto-parm", "Chicken Pesto Parm", "1 bowl", 525, 37, 42, 24, "https://www.sweetgreen.com/nutrition"),
      item("sweetgreen", "guacamole-greens", "Guacamole Greens", "1 salad", 540, 27, 28, 38, "https://www.sweetgreen.com/nutrition"),
      item("sweetgreen", "hot-honey-chicken", "Hot Honey Chicken", "1 bowl", 650, 39, 67, 28, "https://www.sweetgreen.com/nutrition"),
      item("sweetgreen", "shroomami", "Shroomami", "1 bowl", 640, 23, 80, 27, "https://www.sweetgreen.com/nutrition"),
    ],
  },
  {
    id: "moes-southwest-grill",
    name: "Moe's Southwest Grill",
    items: [
      item("moes-southwest-grill", "homewrecker-burrito-chicken", "Homewrecker Burrito, Chicken", "1 burrito", 846, 44, 95, 33, "https://www.moes.com/nutrition"),
      item("moes-southwest-grill", "burrito-bowl-chicken", "Chicken Burrito Bowl", "1 bowl", 590, 42, 61, 22, "https://www.moes.com/nutrition"),
      item("moes-southwest-grill", "stack-chicken", "Chicken Stack", "1 stack", 760, 47, 74, 32, "https://www.moes.com/nutrition"),
      item("moes-southwest-grill", "taco-chicken", "Chicken Taco", "1 taco", 230, 16, 23, 8, "https://www.moes.com/nutrition"),
      item("moes-southwest-grill", "kids-chicken-taco", "Kids Chicken Taco", "1 taco", 180, 12, 19, 7, "https://www.moes.com/nutrition"),
    ],
  },
  {
    id: "potbelly",
    name: "Potbelly",
    items: [
      item("potbelly", "turkey-original", "Turkey Sandwich, Original", "1 sandwich", 560, 36, 68, 18, "https://www.potbelly.com/nutrition"),
      item("potbelly", "skinny-turkey", "Skinny Turkey Sandwich", "1 sandwich", 350, 28, 44, 9, "https://www.potbelly.com/nutrition"),
      item("potbelly", "wreck-original", "A Wreck, Original", "1 sandwich", 650, 38, 69, 25, "https://www.potbelly.com/nutrition"),
      item("potbelly", "chicken-salad-original", "Chicken Salad Sandwich, Original", "1 sandwich", 610, 31, 65, 27, "https://www.potbelly.com/nutrition"),
      item("potbelly", "farmhouse-salad", "Farmhouse Salad", "1 salad", 480, 37, 18, 30, "https://www.potbelly.com/nutrition"),
    ],
  },
  {
    id: "mod-pizza",
    name: "MOD Pizza",
    items: [
      item("mod-pizza", "mad-dog-mod", "Mad Dog MOD Pizza", "1 pizza", 980, 47, 94, 47, "https://modpizza.com/nutrition"),
      item("mod-pizza", "dillon-james-mod", "Dillon James MOD Pizza", "1 pizza", 840, 40, 91, 34, "https://modpizza.com/nutrition"),
      item("mod-pizza", "jasper-mod", "Jasper MOD Pizza", "1 pizza", 760, 36, 87, 30, "https://modpizza.com/nutrition"),
      item("mod-pizza", "caesar-salad", "Caesar Salad", "1 salad", 310, 11, 17, 24, "https://modpizza.com/nutrition"),
      item("mod-pizza", "mini-mad-dog", "Mini Mad Dog Pizza", "1 mini pizza", 520, 25, 49, 25, "https://modpizza.com/nutrition"),
    ],
  },
  {
    id: "blaze-pizza",
    name: "Blaze Pizza",
    items: [
      item("blaze-pizza", "red-vine", "Red Vine Pizza", "1 pizza", 820, 34, 93, 34, "https://www.blazepizza.com/nutrition"),
      item("blaze-pizza", "bbq-chicken", "BBQ Chicken Pizza", "1 pizza", 910, 49, 96, 36, "https://www.blazepizza.com/nutrition"),
      item("blaze-pizza", "meat-eater", "Meat Eater Pizza", "1 pizza", 1080, 54, 95, 54, "https://www.blazepizza.com/nutrition"),
      item("blaze-pizza", "keto-crust-pizza", "Keto Crust Pizza", "1 pizza", 620, 45, 24, 38, "https://www.blazepizza.com/nutrition"),
      item("blaze-pizza", "side-salad", "Side Salad", "1 salad", 180, 4, 15, 12, "https://www.blazepizza.com/nutrition"),
    ],
  },
  {
    id: "noodles-company",
    name: "Noodles & Company",
    items: [
      item("noodles-company", "zucchini-pesto-chicken", "Zucchini Pesto with Grilled Chicken", "1 regular bowl", 560, 46, 30, 32, "https://www.noodles.com/nutrition"),
      item("noodles-company", "penne-rosa-chicken", "Penne Rosa with Parmesan-Crusted Chicken", "1 regular bowl", 910, 47, 100, 37, "https://www.noodles.com/nutrition"),
      item("noodles-company", "japanese-pan-noodles", "Japanese Pan Noodles", "1 regular bowl", 650, 16, 121, 12, "https://www.noodles.com/nutrition"),
      item("noodles-company", "med-salad-chicken", "Mediterranean Salad with Chicken", "1 regular salad", 430, 35, 24, 24, "https://www.noodles.com/nutrition"),
      item("noodles-company", "buttered-noodles-small", "Buttered Noodles, Small", "1 small bowl", 380, 12, 52, 14, "https://www.noodles.com/nutrition"),
    ],
  },
  {
    id: "einstein-bros-bagels",
    name: "Einstein Bros. Bagels",
    items: [
      item("einstein-bros-bagels", "turkey-sausage-egg-white", "Turkey Sausage & Egg White Sandwich", "1 sandwich", 410, 26, 52, 12, "https://www.einsteinbros.com/nutrition"),
      item("einstein-bros-bagels", "farmhouse", "Farmhouse Breakfast Sandwich", "1 sandwich", 760, 37, 66, 39, "https://www.einsteinbros.com/nutrition"),
      item("einstein-bros-bagels", "nova-lox", "Nova Lox Sandwich", "1 sandwich", 480, 24, 70, 13, "https://www.einsteinbros.com/nutrition"),
      item("einstein-bros-bagels", "avocado-toast", "Avocado Toast", "1 order", 310, 9, 39, 14, "https://www.einsteinbros.com/nutrition"),
      item("einstein-bros-bagels", "plain-bagel-shmear", "Plain Bagel with Plain Shmear", "1 bagel", 460, 14, 70, 15, "https://www.einsteinbros.com/nutrition"),
    ],
  },
  {
    id: "first-watch",
    name: "First Watch",
    items: [
      item("first-watch", "tri-athlete", "Tri-Athlete Omelet", "1 omelet", 540, 37, 48, 22, "https://www.firstwatch.com/nutrition"),
      item("first-watch", "power-wrap", "Power Wrap", "1 wrap", 520, 34, 50, 22, "https://www.firstwatch.com/nutrition"),
      item("first-watch", "avocado-toast", "Avocado Toast", "1 order", 630, 20, 74, 30, "https://www.firstwatch.com/nutrition"),
      item("first-watch", "chickichanga", "Chickichanga", "1 entree", 1190, 54, 105, 62, "https://www.firstwatch.com/nutrition"),
      item("first-watch", "market-hash", "Market Hash", "1 entree", 820, 32, 76, 45, "https://www.firstwatch.com/nutrition"),
    ],
  },
  {
    id: "waffle-house",
    name: "Waffle House",
    items: [
      item("waffle-house", "two-egg-breakfast", "Two Egg Breakfast", "1 plate", 670, 31, 49, 39, "https://www.wafflehouse.com/nutrition"),
      item("waffle-house", "grilled-chicken-sandwich", "Grilled Chicken Sandwich", "1 sandwich", 480, 33, 45, 19, "https://www.wafflehouse.com/nutrition"),
      item("waffle-house", "cheesesteak-melt", "Texas Cheesesteak Melt", "1 sandwich", 650, 34, 42, 38, "https://www.wafflehouse.com/nutrition"),
      item("waffle-house", "hashbrowns-scattered", "Hashbrowns, Scattered", "1 order", 205, 3, 30, 9, "https://www.wafflehouse.com/nutrition"),
      item("waffle-house", "classic-waffle", "Classic Waffle", "1 waffle", 410, 8, 55, 18, "https://www.wafflehouse.com/nutrition"),
    ],
  },
  {
    id: "portillos",
    name: "Portillo's",
    items: [
      item("portillos", "italian-beef", "Italian Beef Sandwich", "1 sandwich", 690, 36, 58, 35, "https://www.portillos.com/nutrition"),
      item("portillos", "char-broiled-chicken", "Char-Broiled Chicken Sandwich", "1 sandwich", 490, 38, 43, 18, "https://www.portillos.com/nutrition"),
      item("portillos", "chopped-salad-chicken", "Chopped Salad with Chicken", "1 salad", 800, 42, 45, 51, "https://www.portillos.com/nutrition"),
      item("portillos", "hot-dog", "Hot Dog", "1 hot dog", 340, 12, 34, 18, "https://www.portillos.com/nutrition"),
      item("portillos", "small-fries", "French Fries, Small", "1 order", 380, 5, 47, 19, "https://www.portillos.com/nutrition"),
    ],
  },
  {
    id: "pei-wei",
    name: "Pei Wei",
    items: [
      item("pei-wei", "teriyaki-chicken", "Teriyaki Chicken", "1 entree", 740, 43, 98, 19, "https://www.peiwei.com/nutrition"),
      item("pei-wei", "mongolian-steak", "Mongolian Steak", "1 entree", 760, 44, 93, 23, "https://www.peiwei.com/nutrition"),
      item("pei-wei", "thai-dynamite-chicken", "Thai Dynamite Chicken", "1 entree", 940, 44, 112, 34, "https://www.peiwei.com/nutrition"),
      item("pei-wei", "lettuce-wraps", "Chicken Lettuce Wraps", "1 order", 610, 37, 47, 32, "https://www.peiwei.com/nutrition"),
      item("pei-wei", "cauliflower-rice", "Cauliflower Rice", "1 side", 160, 6, 24, 5, "https://www.peiwei.com/nutrition"),
    ],
  },
  {
    id: "smoothie-king",
    name: "Smoothie King",
    items: [
      item("smoothie-king", "gladiator-chocolate-20oz", "Gladiator Chocolate, 20 oz", "1 smoothie", 230, 45, 4, 3, "https://www.smoothieking.com/nutrition"),
      item("smoothie-king", "lean1-chocolate-20oz", "Lean1 Chocolate, 20 oz", "1 smoothie", 290, 25, 33, 8, "https://www.smoothieking.com/nutrition"),
      item("smoothie-king", "activator-strawberry-banana-20oz", "The Activator Strawberry Banana, 20 oz", "1 smoothie", 270, 26, 38, 3, "https://www.smoothieking.com/nutrition"),
      item("smoothie-king", "metabolism-boost-mango-ginger-20oz", "Metabolism Boost Mango Ginger, 20 oz", "1 smoothie", 320, 14, 58, 5, "https://www.smoothieking.com/nutrition"),
      item("smoothie-king", "vegan-mango-kale-20oz", "Vegan Mango Kale, 20 oz", "1 smoothie", 340, 11, 68, 5, "https://www.smoothieking.com/nutrition"),
    ],
  },
  {
    id: "jasons-deli",
    name: "Jason's Deli",
    items: [
      item("jasons-deli", "grilled-chicken-salad", "Grilled Chicken Salad", "1 salad", 520, 45, 30, 27, "https://www.jasonsdeli.com/nutrition"),
      item("jasons-deli", "turkey-wrap", "Turkey Wrap", "1 wrap", 560, 36, 54, 24, "https://www.jasonsdeli.com/nutrition"),
      item("jasons-deli", "california-club", "California Club", "1 sandwich", 690, 39, 58, 35, "https://www.jasonsdeli.com/nutrition"),
      item("jasons-deli", "chicken-pot-pie-soup-cup", "Chicken Pot Pie Soup, Cup", "1 cup", 280, 11, 24, 16, "https://www.jasonsdeli.com/nutrition"),
      item("jasons-deli", "manager-special-half-turkey-cup-soup", "Manager's Special, Half Turkey + Soup", "1 combo", 610, 34, 68, 22, "https://www.jasonsdeli.com/nutrition"),
    ],
  },
  {
    id: "schlotzskys",
    name: "Schlotzsky's",
    items: [
      item("schlotzskys", "original-small", "The Original, Small", "1 sandwich", 570, 27, 57, 28, "https://www.schlotzskys.com/nutrition"),
      item("schlotzskys", "turkey-original-small", "Turkey Original, Small", "1 sandwich", 500, 31, 55, 18, "https://www.schlotzskys.com/nutrition"),
      item("schlotzskys", "smoked-turkey-breast-small", "Smoked Turkey Breast, Small", "1 sandwich", 390, 25, 52, 9, "https://www.schlotzskys.com/nutrition"),
      item("schlotzskys", "chicken-caesar-wrap", "Chicken Caesar Wrap", "1 wrap", 680, 39, 52, 36, "https://www.schlotzskys.com/nutrition"),
      item("schlotzskys", "garden-salad-chicken", "Garden Salad with Chicken", "1 salad", 360, 32, 18, 19, "https://www.schlotzskys.com/nutrition"),
    ],
  },
  {
    id: "tim-hortons",
    name: "Tim Hortons",
    items: [
      item("tim-hortons", "egg-white-breakfast-sandwich", "Egg White Breakfast Sandwich", "1 sandwich", 350, 19, 41, 12, "https://www.timhortons.com/nutrition"),
      item("tim-hortons", "turkey-bacon-club", "Turkey Bacon Club", "1 sandwich", 520, 31, 53, 21, "https://www.timhortons.com/nutrition"),
      item("tim-hortons", "grilled-wrap-chicken", "Grilled Chicken Wrap", "1 wrap", 430, 28, 45, 16, "https://www.timhortons.com/nutrition"),
      item("tim-hortons", "chili-small", "Chili, Small", "1 bowl", 300, 18, 33, 12, "https://www.timhortons.com/nutrition"),
      item("tim-hortons", "iced-capp-small", "Iced Capp, Small", "1 drink", 250, 3, 47, 6, "https://www.timhortons.com/nutrition"),
    ],
  },
  {
    id: "dutch-bros",
    name: "Dutch Bros",
    items: [
      item("dutch-bros", "cold-brew-small", "Cold Brew, Small", "1 drink", 20, 1, 4, 0, "https://www.dutchbros.com/menu/nutrition"),
      item("dutch-bros", "protein-latte-small", "Protein Latte, Small", "1 drink", 220, 20, 24, 6, "https://www.dutchbros.com/menu/nutrition"),
      item("dutch-bros", "golden-eagle-small", "Golden Eagle, Small", "1 drink", 340, 8, 52, 11, "https://www.dutchbros.com/menu/nutrition"),
      item("dutch-bros", "caramelizer-small", "Caramelizer, Small", "1 drink", 380, 9, 58, 12, "https://www.dutchbros.com/menu/nutrition"),
      item("dutch-bros", "americano-small", "Americano, Small", "1 drink", 10, 0, 2, 0, "https://www.dutchbros.com/menu/nutrition"),
    ],
  },
  {
    id: "salad-and-go",
    name: "Salad and Go",
    items: [
      item("salad-and-go", "cobb-salad", "Cobb Salad", "1 salad", 560, 39, 24, 36, "https://www.saladandgo.com/nutrition"),
      item("salad-and-go", "jalapeno-ranch-salad", "Jalapeno Ranch Salad", "1 salad", 520, 37, 28, 31, "https://www.saladandgo.com/nutrition"),
      item("salad-and-go", "buffalo-chicken-wrap", "Buffalo Chicken Wrap", "1 wrap", 620, 42, 60, 25, "https://www.saladandgo.com/nutrition"),
      item("salad-and-go", "breakfast-burrito-bacon", "Bacon Breakfast Burrito", "1 burrito", 500, 25, 45, 25, "https://www.saladandgo.com/nutrition"),
      item("salad-and-go", "greek-salad", "Greek Salad", "1 salad", 430, 25, 28, 26, "https://www.saladandgo.com/nutrition"),
    ],
  },
  {
    id: "taco-johns",
    name: "Taco John's",
    items: [
      item("taco-johns", "grilled-chicken-burrito", "Grilled Chicken Burrito", "1 burrito", 520, 30, 61, 18, "https://tacojohns.com/nutrition"),
      item("taco-johns", "street-tacos-chicken", "Chicken Street Tacos", "2 tacos", 390, 25, 38, 15, "https://tacojohns.com/nutrition"),
      item("taco-johns", "meat-potato-burrito", "Meat & Potato Burrito", "1 burrito", 650, 27, 67, 31, "https://tacojohns.com/nutrition"),
      item("taco-johns", "softshell-taco", "Softshell Taco", "1 taco", 240, 12, 24, 11, "https://tacojohns.com/nutrition"),
      item("taco-johns", "potato-oles-small", "Potato Oles, Small", "1 side", 480, 5, 51, 29, "https://tacojohns.com/nutrition"),
    ],
  },
  {
    id: "yard-house",
    name: "Yard House",
    items: [
      item("yard-house", "grilled-chicken-avocado-sandwich", "Grilled Chicken & Avocado Sandwich", "1 sandwich", 760, 48, 58, 36, "https://www.yardhouse.com/nutrition"),
      item("yard-house", "ahi-crunchy-salad", "Ahi Crunchy Salad", "1 salad", 690, 39, 44, 39, "https://www.yardhouse.com/nutrition"),
      item("yard-house", "bbq-chicken-pizza", "BBQ Chicken Pizza", "1 pizza", 980, 52, 102, 38, "https://www.yardhouse.com/nutrition"),
      item("yard-house", "street-tacos-chicken", "Chicken Street Tacos", "3 tacos", 570, 35, 49, 27, "https://www.yardhouse.com/nutrition"),
      item("yard-house", "house-salad-chicken", "House Salad with Chicken", "1 salad", 520, 42, 22, 31, "https://www.yardhouse.com/nutrition"),
    ],
  },
];

const ALIASES: Record<string, string[]> = {
  "chick-fil-a": ["chick fil a", "chickfila"],
  "mcdonalds": ["mcdonald's", "mcdonalds", "mcdonald"],
  "burger-king": ["bk"],
  "dominos": ["domino's", "dominos"],
  "papa-johns": ["papa john's", "papa johns"],
  "jersey-mikes": ["jersey mike's", "jersey mikes"],
  "jimmy-johns": ["jimmy john's", "jimmy johns"],
  "raising-canes": ["raising cane's", "raising canes", "canes"],
  "sonic-drive-in": ["sonic"],
  "tropical-smoothie-cafe": ["tropical smoothie"],
  "churchs-texas-chicken": ["church's", "churchs"],
  "moes-southwest-grill": ["moe's", "moes"],
  "einstein-bros-bagels": ["einstein bros", "einstein bagels"],
  "mod-pizza": ["mod"],
  "blaze-pizza": ["blaze"],
  "noodles-company": ["noodles & company", "noodles and company"],
  "smoothie-king": ["smoothie king"],
  "jasons-deli": ["jason's deli", "jasons deli"],
  "schlotzskys": ["schlotzsky's", "schlotzskys"],
  "tim-hortons": ["tim horton", "tim hortons"],
  "dutch-bros": ["dutch brothers", "dutch bros"],
  "salad-and-go": ["salad & go"],
  "taco-johns": ["taco john's", "taco johns"],
};

const BRAND_COLORS = [
  { bg: "#14532d", fg: "#ffffff", ring: "#bbf7d0" },
  { bg: "#7f1d1d", fg: "#ffffff", ring: "#fecaca" },
  { bg: "#1d4ed8", fg: "#ffffff", ring: "#bfdbfe" },
  { bg: "#4c1d95", fg: "#ffffff", ring: "#ddd6fe" },
  { bg: "#92400e", fg: "#ffffff", ring: "#fde68a" },
  { bg: "#0f766e", fg: "#ffffff", ring: "#99f6e4" },
  { bg: "#111827", fg: "#ffffff", ring: "#d1d5db" },
  { bg: "#be123c", fg: "#ffffff", ring: "#fecdd3" },
];

export const ALL_RESTAURANTS: readonly Restaurant[] = [
  ...RESTAURANT_DATABASE,
  ...SUPPLEMENTAL_RESTAURANTS,
].sort((a, b) => a.name.localeCompare(b.name));

export type NearbyPlace = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceMiles: number;
  category: "restaurant" | "fast_food" | "cafe" | "other";
  matchedRestaurantId: string | null;
  matchedRestaurantName: string | null;
};

export type MapCenter = {
  lat: number;
  lon: number;
  label: string;
};

export type RestaurantBrand = {
  initials: string;
  shortName: string;
  bg: string;
  fg: string;
  ring: string;
};

export type MacroInsight = {
  headline: string;
  proteinLine: string;
  carbLine: string;
  fatLine: string;
  nextMove: string;
  tone: "success" | "warning" | "neutral";
};

export type RestaurantMenuSearchResult = {
  restaurant: Restaurant;
  item: RestaurantMenuItem;
  score: number;
  fitLabel: string;
  insight: MacroInsight;
  sourceLabel: string;
};

function item(
  restaurantId: string,
  slug: string,
  name: string,
  serving: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  sourceUrl: string,
): RestaurantMenuItem {
  return {
    id: `${restaurantId}:${slug}`,
    name,
    serving,
    calories,
    protein,
    carbs,
    fat,
    sourceUrl,
  };
}

export function normalizeRestaurantName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['.]/g, "")
    .replace(/\b(the|restaurant|grill|cafe|drive in)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchRestaurantByName(name: string): Restaurant | null {
  const normalized = normalizeRestaurantName(name);
  if (!normalized) return null;
  return (
    ALL_RESTAURANTS.find((restaurant) => {
      const restaurantName = normalizeRestaurantName(restaurant.name);
      const aliasNames = ALIASES[restaurant.id] ?? [];
      return (
        normalized === restaurantName ||
        normalized.includes(restaurantName) ||
        restaurantName.includes(normalized) ||
        aliasNames.some((alias) => {
          const n = normalizeRestaurantName(alias);
          return normalized === n || normalized.includes(n) || n.includes(normalized);
        })
      );
    }) ?? null
  );
}

export function distanceMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function menuItemTotals(item: RestaurantMenuItem): MacroTotals {
  return {
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
  };
}

function stringHash(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function restaurantBrand(restaurant: Pick<Restaurant, "id" | "name">): RestaurantBrand {
  const palette = BRAND_COLORS[stringHash(restaurant.id) % BRAND_COLORS.length];
  const words = restaurant.name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const shortName = restaurant.name.length > 12 ? initials || restaurant.name.slice(0, 2) : restaurant.name;
  return {
    initials: initials || restaurant.name.slice(0, 2).toUpperCase(),
    shortName,
    ...palette,
  };
}

export function buildRestaurantMacroInsight(
  item: RestaurantMenuItem,
  remaining: Pick<MacroTotals, "calories" | "protein" | "carbs" | "fat">,
): MacroInsight {
  const caloriesLeft = Math.round(remaining.calories - item.calories);
  const proteinCoverage = remaining.protein > 0 ? Math.round((item.protein / remaining.protein) * 100) : 100;
  const carbsLeft = Math.round(remaining.carbs - item.carbs);
  const fatLeft = Math.round(remaining.fat - item.fat);
  const proteinLine =
    remaining.protein > 0
      ? `Covers ${Math.max(0, proteinCoverage)}% of remaining protein`
      : `${item.protein}g protein adds cushion for today`;
  const carbLine = carbsLeft >= 0 ? `${carbsLeft}g carbs left after this` : `${Math.abs(carbsLeft)}g over remaining carbs`;
  const fatLine = fatLeft >= 0 ? `${fatLeft}g fat left after this` : `${Math.abs(fatLeft)}g over remaining fat`;
  const tone: MacroInsight["tone"] =
    caloriesLeft >= 0 && carbsLeft >= -10 && fatLeft >= -8 ? "success" : caloriesLeft < -250 ? "warning" : "neutral";
  const nextMove =
    tone === "success"
      ? "Good fit. Pair with water or a light side if you need more volume."
      : item.protein >= 30
        ? "Protein is strong; keep the next snack lighter on carbs and fats."
        : "Log it if this is the best option, then steer the next meal leaner.";

  return {
    headline:
      caloriesLeft >= 0
        ? `${item.calories} kcal fits; ${caloriesLeft} kcal left`
        : `${Math.abs(caloriesLeft)} kcal over today's remaining calories`,
    proteinLine,
    carbLine,
    fatLine,
    nextMove,
    tone,
  };
}

export function searchRestaurantMenus(input: {
  query?: string;
  restaurantId?: string | null;
  preference?: string | null;
  remaining?: Pick<MacroTotals, "calories" | "protein" | "carbs" | "fat">;
  limit?: number;
}): RestaurantMenuSearchResult[] {
  const query = normalizeRestaurantName(input.query ?? "");
  const preference = normalizeRestaurantName(input.preference ?? "");
  const remainingCalories = input.remaining?.calories ?? 900;
  const remainingProtein = input.remaining?.protein ?? 45;
  const remainingCarbs = input.remaining?.carbs ?? 90;
  const remainingFat = input.remaining?.fat ?? 30;
  const restaurants = input.restaurantId
    ? ALL_RESTAURANTS.filter((restaurant) => restaurant.id === input.restaurantId)
    : ALL_RESTAURANTS;

  let rows = restaurants.flatMap((restaurant) =>
    restaurant.items.map((menuItem) => ({ restaurant, item: menuItem }))
  );

  if (query) {
    rows = rows.filter(({ restaurant, item }) => {
      const haystack = `${normalizeRestaurantName(restaurant.name)} ${normalizeRestaurantName(item.name)}`;
      return query.split(" ").every((token) => haystack.includes(token));
    });
  }

  if (preference) {
    rows = rows.filter(({ item }) => {
      if (preference.includes("high protein")) return item.calories > 0 && (item.protein * 4) / item.calories >= 0.25;
      if (preference.includes("under 600")) return item.calories <= 600;
      if (preference.includes("under 800")) return item.calories <= 800;
      if (preference.includes("low carb")) return item.carbs <= 30;
      if (preference.includes("low fat")) return item.fat <= 18;
      return normalizeRestaurantName(item.name).includes(preference);
    });
  }

  return rows
    .map(({ restaurant, item }) => {
      const proteinCoverage =
        remainingProtein > 0 ? Math.min(item.protein / remainingProtein, 1) : 0.5;
      const calorieFit =
        remainingCalories > 0
          ? 1 - Math.max(0, item.calories - remainingCalories) / remainingCalories
          : 0.2;
      const proteinDensity = item.calories > 0 ? (item.protein * 4) / item.calories : 0;
      const carbFit =
        remainingCarbs > 0 ? 1 - Math.max(0, item.carbs - remainingCarbs) / Math.max(remainingCarbs, 1) : 0.5;
      const fatFit =
        remainingFat > 0 ? 1 - Math.max(0, item.fat - remainingFat) / Math.max(remainingFat, 1) : 0.5;
      const score =
        proteinCoverage * 0.35 +
        calorieFit * 0.32 +
        proteinDensity * 0.13 +
        Math.max(0, carbFit) * 0.1 +
        Math.max(0, fatFit) * 0.1;
      const insight = buildRestaurantMacroInsight(item, {
        calories: remainingCalories,
        protein: remainingProtein,
        carbs: remainingCarbs,
        fat: remainingFat,
      });
      return {
        restaurant,
        item,
        score,
        fitLabel: insight.headline,
        insight,
        sourceLabel: "Published restaurant nutrition; menus can change.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, input.limit ?? 24);
}

export function restaurantStats() {
  const restaurantCount = ALL_RESTAURANTS.length;
  const itemCount = ALL_RESTAURANTS.reduce((sum, restaurant) => sum + restaurant.items.length, 0);
  return { restaurantCount, itemCount };
}

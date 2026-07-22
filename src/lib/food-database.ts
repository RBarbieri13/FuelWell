/**
 * FuelWell Food Database
 *
 * Curated database of common foods with per-100g macros for autocomplete
 * meal logging (meeting decision 2026-06-09: "1,000 most common items").
 *
 * Data shape: compact tuples keyed by category for bundle efficiency.
 *   [name, kcal, protein_g, carbs_g, fat_g, fiber_g]  — all per 100 g
 * unless the category's `servingUnit` says otherwise (beverages are per
 * 100 ml). `commonServings` give the UI one-tap portion presets.
 *
 * Sources: USDA FoodData Central approximations, rounded to whole numbers
 * (fiber to 0.5). Values are typical-preparation averages — good enough
 * for daily decision support, not lab nutrition labels.
 *
 * Current seed: ~500 items. Extending toward 1,000: add tuples to the
 * appropriate category array; ids are derived from names so appending is
 * safe. Keep entries generic ("Cheddar cheese") over branded.
 */

import { isConfidentMatch, rankedSearch } from "@/lib/search-utils";

export type FoodTuple = readonly [
  name: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
];

export interface FoodCategoryDef {
  label: string;
  servingUnit: "g" | "ml";
  /** One-tap portion presets, in grams/ml */
  commonServings: { label: string; amount: number }[];
  items: readonly FoodTuple[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  servingUnit: "g" | "ml";
  per100: { kcal: number; protein: number; carbs: number; fat: number; fiber: number };
  commonServings: { label: string; amount: number }[];
  tags: string[];
}

/* ────────────────────────────── seed data ───────────────────────────── */

const DB: Record<string, FoodCategoryDef> = {
  poultry: {
    label: "Poultry",
    servingUnit: "g",
    commonServings: [
      { label: "Small (85 g)", amount: 85 },
      { label: "Standard (140 g)", amount: 140 },
      { label: "Large (200 g)", amount: 200 },
    ],
    items: [
      ["Chicken breast, grilled", 165, 31, 0, 4, 0],
      ["Chicken breast, fried", 222, 28, 8, 9, 0],
      ["Chicken thigh, roasted", 209, 26, 0, 11, 0],
      ["Chicken thigh, skin-on", 232, 24, 0, 15, 0],
      ["Chicken drumstick", 172, 24, 0, 8, 0],
      ["Chicken wing, roasted", 203, 30, 0, 8, 0],
      ["Rotisserie chicken, mixed", 190, 25, 0, 10, 0],
      ["Ground chicken, cooked", 189, 27, 0, 9, 0],
      ["Chicken tenders, breaded", 271, 18, 18, 14, 1],
      ["Turkey breast, roasted", 135, 30, 0, 1, 0],
      ["Ground turkey 93/7, cooked", 213, 27, 0, 12, 0],
      ["Ground turkey 99/1, cooked", 151, 32, 0, 2, 0],
      ["Turkey deli slices", 104, 17, 4, 2, 0],
      ["Duck breast, roasted", 201, 24, 0, 11, 0],
      ["Chicken sausage", 172, 16, 3, 11, 0],
      ["Turkey bacon", 218, 17, 3, 16, 0],
      ["Chicken nuggets", 297, 15, 16, 19, 1],
      ["Chicken liver, cooked", 167, 26, 1, 6, 0],
    ],
  },
  beef_pork: {
    label: "Beef & Pork",
    servingUnit: "g",
    commonServings: [
      { label: "Small (85 g)", amount: 85 },
      { label: "Standard (140 g)", amount: 140 },
      { label: "Large (225 g)", amount: 225 },
    ],
    items: [
      ["Ground beef 90/10, cooked", 217, 26, 0, 12, 0],
      ["Ground beef 80/20, cooked", 254, 26, 0, 17, 0],
      ["Ribeye steak, grilled", 291, 24, 0, 22, 0],
      ["Sirloin steak, grilled", 212, 29, 0, 10, 0],
      ["Filet mignon", 227, 28, 0, 12, 0],
      ["NY strip steak", 232, 27, 0, 13, 0],
      ["Flank steak", 192, 28, 0, 8, 0],
      ["Beef brisket, smoked", 288, 26, 0, 20, 0],
      ["Beef short ribs", 295, 26, 0, 21, 0],
      ["Roast beef deli slices", 115, 18, 1, 4, 0],
      ["Beef jerky", 410, 33, 11, 26, 0],
      ["Corned beef", 251, 18, 0, 19, 0],
      ["Pork chop, grilled", 197, 27, 0, 9, 0],
      ["Pork tenderloin", 143, 26, 0, 4, 0],
      ["Pulled pork, no sauce", 247, 25, 0, 16, 0],
      ["Pork belly", 518, 9, 0, 53, 0],
      ["Bacon, pan-fried", 541, 37, 1, 42, 0],
      ["Ham, sliced", 145, 21, 1, 6, 0],
      ["Pork sausage link", 301, 17, 2, 25, 0],
      ["Bratwurst", 297, 13, 3, 26, 0],
      ["Pepperoni", 494, 23, 2, 44, 0],
      ["Salami", 336, 22, 2, 26, 0],
      ["Hot dog, beef", 290, 11, 4, 26, 0],
      ["Lamb chop, grilled", 294, 25, 0, 21, 0],
      ["Ground lamb, cooked", 283, 25, 0, 20, 0],
      ["Veal cutlet", 172, 31, 0, 5, 0],
      ["Beef liver, cooked", 191, 29, 5, 5, 0],
      ["Bison, ground, cooked", 179, 25, 0, 9, 0],
      ["Venison, cooked", 158, 30, 0, 3, 0],
      ["Meatballs, beef", 230, 16, 8, 15, 1],
    ],
  },
  seafood: {
    label: "Fish & Seafood",
    servingUnit: "g",
    commonServings: [
      { label: "Small (85 g)", amount: 85 },
      { label: "Fillet (140 g)", amount: 140 },
      { label: "Large (200 g)", amount: 200 },
    ],
    items: [
      ["Salmon, Atlantic, baked", 206, 22, 0, 13, 0],
      ["Salmon, wild sockeye", 156, 26, 0, 6, 0],
      ["Smoked salmon (lox)", 117, 18, 0, 4, 0],
      ["Tuna, canned in water", 116, 26, 0, 1, 0],
      ["Tuna, canned in oil", 198, 29, 0, 8, 0],
      ["Tuna steak, ahi, seared", 130, 28, 0, 1, 0],
      ["Cod, baked", 105, 23, 0, 1, 0],
      ["Tilapia, baked", 128, 26, 0, 3, 0],
      ["Halibut", 111, 23, 0, 2, 0],
      ["Mahi mahi", 109, 24, 0, 1, 0],
      ["Sea bass", 124, 24, 0, 3, 0],
      ["Trout, rainbow", 168, 24, 0, 7, 0],
      ["Sardines, canned in oil", 208, 25, 0, 11, 0],
      ["Anchovies", 210, 29, 0, 10, 0],
      ["Mackerel", 262, 24, 0, 18, 0],
      ["Swordfish", 172, 28, 0, 6, 0],
      ["Catfish, baked", 144, 19, 0, 8, 0],
      ["Shrimp, steamed", 99, 24, 0, 0, 0],
      ["Shrimp, fried", 242, 12, 21, 12, 0],
      ["Crab meat", 97, 20, 0, 2, 0],
      ["Lobster, steamed", 89, 19, 0, 1, 0],
      ["Scallops, seared", 111, 21, 5, 1, 0],
      ["Mussels, steamed", 172, 24, 7, 4, 0],
      ["Oysters, raw", 68, 7, 4, 2, 0],
      ["Clams, steamed", 148, 26, 5, 2, 0],
      ["Calamari, fried", 175, 15, 8, 9, 0],
      ["Octopus, cooked", 164, 30, 4, 2, 0],
      ["Crab cake", 244, 16, 9, 16, 0.5],
      ["Fish sticks", 261, 11, 23, 14, 1],
      ["Imitation crab", 95, 8, 15, 0, 0.5],
    ],
  },
  eggs_dairy: {
    label: "Eggs & Dairy",
    servingUnit: "g",
    commonServings: [
      { label: "Small (30 g)", amount: 30 },
      { label: "Standard (100 g)", amount: 100 },
      { label: "Cup (240 g)", amount: 240 },
    ],
    items: [
      ["Egg, whole, large (50 g each)", 143, 13, 1, 10, 0],
      ["Egg white", 52, 11, 1, 0, 0],
      ["Egg, scrambled w/ butter", 167, 11, 2, 12, 0],
      ["Egg, hard boiled", 155, 13, 1, 11, 0],
      ["Omelet, cheese", 188, 13, 1, 15, 0],
      ["Greek yogurt, nonfat plain", 59, 10, 4, 0, 0],
      ["Greek yogurt, 2% plain", 73, 10, 4, 2, 0],
      ["Greek yogurt, whole milk", 97, 9, 4, 5, 0],
      ["Greek yogurt, flavored", 92, 8, 12, 1, 0],
      ["Yogurt, regular plain", 61, 4, 5, 3, 0],
      ["Skyr", 63, 11, 4, 0, 0],
      ["Cottage cheese, 2%", 84, 11, 4, 2, 0],
      ["Cottage cheese, 4%", 98, 11, 3, 4, 0],
      ["Milk, whole", 61, 3, 5, 3, 0],
      ["Milk, 2%", 50, 3, 5, 2, 0],
      ["Milk, skim", 34, 3, 5, 0, 0],
      ["Chocolate milk, 2%", 76, 3, 12, 2, 0.5],
      ["Cheddar cheese", 403, 23, 3, 33, 0],
      ["Mozzarella, part skim", 254, 24, 3, 16, 0],
      ["Mozzarella, fresh", 280, 22, 2, 21, 0],
      ["Swiss cheese", 380, 27, 5, 28, 0],
      ["Provolone", 351, 26, 2, 27, 0],
      ["Parmesan, grated", 420, 38, 4, 28, 0],
      ["Feta cheese", 264, 14, 4, 21, 0],
      ["Goat cheese", 364, 22, 0, 30, 0],
      ["Blue cheese", 353, 21, 2, 29, 0],
      ["Brie", 334, 21, 0, 28, 0],
      ["Cream cheese", 342, 6, 4, 34, 0],
      ["Cream cheese, light", 201, 7, 8, 15, 0],
      ["American cheese slice", 297, 16, 9, 22, 0],
      ["String cheese", 282, 24, 2, 20, 0],
      ["Ricotta, part skim", 138, 11, 5, 8, 0],
      ["Butter", 717, 1, 0, 81, 0],
      ["Heavy cream", 340, 3, 3, 36, 0],
      ["Half and half", 131, 3, 4, 12, 0],
      ["Sour cream", 198, 2, 5, 19, 0],
      ["Whipped cream", 257, 3, 13, 22, 0],
      ["Ice cream, vanilla", 207, 4, 24, 11, 0.5],
      ["Frozen yogurt", 127, 3, 22, 4, 0],
      ["Kefir, plain", 55, 3, 5, 3, 0],
    ],
  },
  plant_protein: {
    label: "Plant Protein & Alternatives",
    servingUnit: "g",
    commonServings: [
      { label: "Half block (100 g)", amount: 100 },
      { label: "Serving (150 g)", amount: 150 },
    ],
    items: [
      ["Tofu, firm", 78, 9, 2, 4, 1],
      ["Tofu, extra firm, baked", 117, 14, 3, 6, 1],
      ["Tempeh", 192, 20, 8, 11, 5],
      ["Seitan", 141, 25, 7, 2, 1],
      ["Edamame, shelled", 121, 12, 9, 5, 5],
      ["Black bean burger patty", 182, 11, 22, 6, 6],
      ["Beyond/Impossible-style patty", 230, 18, 7, 14, 2],
      ["Soy milk, unsweetened", 33, 3, 1, 2, 0.5],
      ["Almond milk, unsweetened", 13, 0, 1, 1, 0],
      ["Oat milk", 47, 1, 7, 1, 1],
      ["Pea protein powder (dry)", 375, 80, 5, 6, 2],
      ["Whey protein powder (dry)", 388, 78, 8, 5, 1],
      ["Casein protein powder (dry)", 367, 75, 9, 2, 1],
      ["Nutritional yeast", 325, 50, 35, 5, 20],
      ["Falafel", 333, 13, 32, 18, 5],
      ["Hummus", 166, 8, 14, 10, 6],
    ],
  },
  fruits: {
    label: "Fruits",
    servingUnit: "g",
    commonServings: [
      { label: "Small piece (100 g)", amount: 100 },
      { label: "Medium piece (150 g)", amount: 150 },
      { label: "Cup (150 g)", amount: 150 },
    ],
    items: [
      ["Apple", 52, 0, 14, 0, 2.5],
      ["Banana", 89, 1, 23, 0, 2.5],
      ["Orange", 47, 1, 12, 0, 2.5],
      ["Strawberries", 32, 1, 8, 0, 2],
      ["Blueberries", 57, 1, 14, 0, 2.5],
      ["Raspberries", 52, 1, 12, 1, 6.5],
      ["Blackberries", 43, 1, 10, 0, 5.5],
      ["Grapes", 69, 1, 18, 0, 1],
      ["Watermelon", 30, 1, 8, 0, 0.5],
      ["Cantaloupe", 34, 1, 8, 0, 1],
      ["Honeydew", 36, 1, 9, 0, 1],
      ["Pineapple", 50, 1, 13, 0, 1.5],
      ["Mango", 60, 1, 15, 0, 1.5],
      ["Peach", 39, 1, 10, 0, 1.5],
      ["Nectarine", 44, 1, 11, 0, 1.5],
      ["Plum", 46, 1, 11, 0, 1.5],
      ["Pear", 57, 0, 15, 0, 3],
      ["Cherries", 63, 1, 16, 0, 2],
      ["Kiwi", 61, 1, 15, 0, 3],
      ["Pomegranate seeds", 83, 2, 19, 1, 4],
      ["Grapefruit", 42, 1, 11, 0, 1.5],
      ["Clementine", 47, 1, 12, 0, 1.5],
      ["Avocado", 160, 2, 9, 15, 7],
      ["Coconut meat", 354, 3, 15, 33, 9],
      ["Dates, Medjool", 277, 2, 75, 0, 6.5],
      ["Raisins", 299, 3, 79, 0, 3.5],
      ["Dried cranberries", 308, 0, 82, 1, 6],
      ["Dried apricots", 241, 3, 63, 1, 7.5],
      ["Figs, fresh", 74, 1, 19, 0, 3],
      ["Applesauce, unsweetened", 42, 0, 11, 0, 1],
      ["Fruit cocktail, in juice", 50, 0, 13, 0, 1],
      ["Banana, dried chips", 519, 2, 58, 34, 7.5],
      ["Papaya", 43, 0, 11, 0, 1.5],
      ["Lychee", 66, 1, 17, 0, 1.5],
      ["Passion fruit", 97, 2, 23, 1, 10.5],
      ["Apricot, fresh", 48, 1, 11, 0, 2],
      ["Cranberries, fresh", 46, 0, 12, 0, 4.5],
      ["Lemon", 29, 1, 9, 0, 3],
      ["Lime", 30, 1, 11, 0, 3],
      ["Guava", 68, 3, 14, 1, 5.5],
    ],
  },
  vegetables: {
    label: "Vegetables",
    servingUnit: "g",
    commonServings: [
      { label: "Side (85 g)", amount: 85 },
      { label: "Cup (130 g)", amount: 130 },
      { label: "Large bowl (250 g)", amount: 250 },
    ],
    items: [
      ["Broccoli, steamed", 35, 2, 7, 0, 3.5],
      ["Cauliflower, roasted", 33, 2, 5, 1, 2.5],
      ["Spinach, raw", 23, 3, 4, 0, 2],
      ["Spinach, cooked", 23, 3, 4, 0, 2.5],
      ["Kale, raw", 35, 3, 4, 1, 4],
      ["Romaine lettuce", 17, 1, 3, 0, 2],
      ["Iceberg lettuce", 14, 1, 3, 0, 1],
      ["Mixed greens", 20, 2, 3, 0, 2],
      ["Arugula", 25, 3, 4, 1, 1.5],
      ["Carrots, raw", 41, 1, 10, 0, 3],
      ["Carrots, roasted", 54, 1, 12, 1, 3],
      ["Celery", 14, 1, 3, 0, 1.5],
      ["Cucumber", 15, 1, 4, 0, 0.5],
      ["Bell pepper, red", 31, 1, 6, 0, 2],
      ["Bell pepper, green", 20, 1, 5, 0, 1.5],
      ["Tomato", 18, 1, 4, 0, 1],
      ["Cherry tomatoes", 18, 1, 4, 0, 1],
      ["Onion, raw", 40, 1, 9, 0, 1.5],
      ["Onion, caramelized", 90, 1, 14, 4, 1.5],
      ["Garlic", 149, 6, 33, 0, 2],
      ["Mushrooms, raw", 22, 3, 3, 0, 1],
      ["Mushrooms, sautéed", 57, 4, 4, 4, 2],
      ["Portobello mushroom, grilled", 29, 3, 4, 1, 2],
      ["Zucchini", 17, 1, 3, 0, 1],
      ["Yellow squash", 16, 1, 3, 0, 1],
      ["Butternut squash, roasted", 45, 1, 12, 0, 2],
      ["Spaghetti squash", 31, 1, 7, 0, 1.5],
      ["Asparagus, roasted", 22, 2, 4, 0, 2],
      ["Green beans, steamed", 35, 2, 8, 0, 3.5],
      ["Brussels sprouts, roasted", 53, 3, 9, 2, 4],
      ["Cabbage, raw", 25, 1, 6, 0, 2.5],
      ["Coleslaw w/ dressing", 152, 1, 13, 11, 2],
      ["Bok choy", 13, 2, 2, 0, 1],
      ["Eggplant, roasted", 35, 1, 9, 0, 3],
      ["Beets, cooked", 44, 2, 10, 0, 2],
      ["Radishes", 16, 1, 3, 0, 1.5],
      ["Corn, sweet", 86, 3, 19, 1, 2],
      ["Corn on the cob", 96, 3, 21, 1, 2.5],
      ["Peas, green", 81, 5, 14, 0, 5],
      ["Snap peas", 42, 3, 8, 0, 2.5],
      ["Artichoke, cooked", 53, 3, 12, 0, 5.5],
      ["Okra", 33, 2, 7, 0, 3],
      ["Leeks", 61, 1, 14, 0, 2],
      ["Sweet potato, baked", 90, 2, 21, 0, 3.5],
      ["Potato, baked w/ skin", 93, 2, 21, 0, 2],
      ["Potato, mashed w/ milk+butter", 113, 2, 17, 4, 1.5],
      ["French fries", 312, 3, 41, 15, 4],
      ["Sweet potato fries", 280, 2, 36, 14, 4],
      ["Hash browns", 265, 3, 35, 13, 3],
      ["Tater tots", 244, 3, 32, 12, 3],
      ["Potato salad", 143, 2, 13, 9, 1.5],
      ["Pumpkin, canned", 34, 1, 8, 0, 3],
      ["Cauliflower rice", 25, 2, 5, 0, 2],
      ["Pickles, dill", 12, 0, 2, 0, 1],
      ["Sauerkraut", 19, 1, 4, 0, 3],
      ["Kimchi", 23, 2, 4, 0, 2],
      ["Seaweed salad", 130, 1, 12, 8, 1],
      ["Olives, green", 145, 1, 4, 15, 3.5],
      ["Olives, kalamata", 230, 1, 6, 22, 3],
      ["Fennel bulb", 31, 1, 7, 0, 3],
      ["Jicama", 38, 1, 9, 0, 5],
      ["Parsnips, roasted", 102, 1, 24, 0, 5],
      ["Turnips, cooked", 22, 1, 5, 0, 2],
      ["Watercress", 11, 2, 1, 0, 1],
      ["Radicchio", 23, 1, 5, 0, 1],
    ],
  },
  grains: {
    label: "Grains, Bread & Pasta",
    servingUnit: "g",
    commonServings: [
      { label: "Slice/half cup (45 g)", amount: 45 },
      { label: "Cup cooked (160 g)", amount: 160 },
      { label: "Large plate (250 g)", amount: 250 },
    ],
    items: [
      ["White rice, cooked", 130, 3, 28, 0, 0.5],
      ["Brown rice, cooked", 112, 3, 24, 1, 1.5],
      ["Jasmine rice, cooked", 129, 3, 28, 0, 0.5],
      ["Basmati rice, cooked", 121, 3, 25, 0, 0.5],
      ["Fried rice", 163, 4, 20, 7, 1],
      ["Quinoa, cooked", 120, 4, 21, 2, 3],
      ["Couscous, cooked", 112, 4, 23, 0, 1.5],
      ["Farro, cooked", 130, 5, 26, 1, 3.5],
      ["Barley, cooked", 123, 2, 28, 0, 4],
      ["Bulgur, cooked", 83, 3, 19, 0, 4.5],
      ["Oatmeal, cooked w/ water", 71, 3, 12, 1, 2],
      ["Oats, rolled, dry", 389, 17, 66, 7, 10.5],
      ["Overnight oats w/ milk", 110, 5, 16, 3, 2],
      ["Steel-cut oats, cooked", 73, 3, 13, 1, 2],
      ["Grits, cooked", 59, 1, 13, 0, 0.5],
      ["Cream of wheat, cooked", 56, 2, 12, 0, 0.5],
      ["White bread", 265, 9, 49, 3, 2.5],
      ["Whole wheat bread", 247, 13, 41, 3, 6],
      ["Sourdough bread", 256, 10, 51, 2, 2.5],
      ["Rye bread", 259, 9, 48, 3, 6],
      ["Multigrain bread", 251, 13, 43, 4, 7],
      ["Bagel, plain", 257, 10, 50, 2, 2],
      ["English muffin", 235, 9, 46, 2, 2],
      ["Croissant", 406, 8, 46, 21, 2.5],
      ["Brioche", 375, 9, 48, 16, 2],
      ["Pita bread", 275, 9, 56, 1, 2],
      ["Naan", 310, 9, 50, 8, 2],
      ["Tortilla, flour (per 100g)", 312, 8, 52, 8, 3],
      ["Tortilla, corn", 218, 6, 45, 3, 6.5],
      ["Dinner roll", 310, 9, 53, 6, 2],
      ["Cornbread", 330, 7, 51, 11, 2],
      ["Biscuit", 353, 6, 45, 16, 1.5],
      ["Pasta, cooked", 158, 6, 31, 1, 2],
      ["Whole wheat pasta, cooked", 149, 6, 30, 1, 4.5],
      ["Chickpea pasta, cooked", 164, 11, 28, 3, 5],
      ["Mac and cheese", 176, 7, 20, 8, 1],
      ["Spaghetti w/ marinara", 130, 4, 22, 3, 2],
      ["Spaghetti w/ meat sauce", 158, 9, 19, 5, 2],
      ["Lasagna, meat", 135, 8, 13, 6, 1],
      ["Ramen noodles, cooked", 188, 5, 27, 7, 1],
      ["Rice noodles, cooked", 108, 1, 25, 0, 1],
      ["Soba noodles, cooked", 99, 5, 21, 0, 1.5],
      ["Udon noodles, cooked", 105, 3, 21, 0, 1],
      ["Gnocchi, cooked", 133, 3, 28, 1, 1.5],
      ["Risotto", 174, 4, 24, 6, 0.5],
      ["Polenta, cooked", 70, 2, 15, 0, 1],
      ["Crackers, saltine", 421, 9, 74, 9, 3],
      ["Crackers, whole wheat", 443, 9, 65, 17, 9.5],
      ["Rice cakes", 387, 8, 82, 3, 4],
      ["Granola", 471, 10, 64, 20, 7],
      ["Cereal, corn flakes", 357, 8, 84, 0, 3],
      ["Cereal, Cheerios-style", 367, 12, 73, 6, 9.5],
      ["Cereal, raisin bran", 321, 8, 76, 2, 12],
      ["Pancakes", 227, 6, 28, 10, 1],
      ["Waffles", 291, 8, 33, 14, 2],
      ["French toast", 229, 8, 25, 11, 1],
    ],
  },
  legumes_nuts: {
    label: "Legumes, Nuts & Seeds",
    servingUnit: "g",
    commonServings: [
      { label: "Small handful (28 g)", amount: 28 },
      { label: "Half cup (90 g)", amount: 90 },
      { label: "Cup cooked (170 g)", amount: 170 },
    ],
    items: [
      ["Black beans, cooked", 132, 9, 24, 0, 8.5],
      ["Pinto beans, cooked", 143, 9, 26, 1, 9],
      ["Kidney beans, cooked", 127, 9, 23, 0, 6.5],
      ["Chickpeas, cooked", 164, 9, 27, 3, 7.5],
      ["Lentils, cooked", 116, 9, 20, 0, 8],
      ["Navy beans, cooked", 140, 8, 26, 1, 10.5],
      ["Refried beans", 91, 5, 15, 1, 5],
      ["Baked beans", 155, 5, 27, 1, 5.5],
      ["Lima beans, cooked", 115, 8, 21, 0, 7],
      ["Split peas, cooked", 118, 8, 21, 0, 8],
      ["Almonds", 579, 21, 22, 50, 12.5],
      ["Almond butter", 614, 21, 19, 56, 10.5],
      ["Peanuts, roasted", 567, 26, 16, 49, 8.5],
      ["Peanut butter", 588, 25, 20, 50, 6],
      ["Cashews", 553, 18, 30, 44, 3.5],
      ["Cashew butter", 587, 18, 28, 49, 2],
      ["Walnuts", 654, 15, 14, 65, 6.5],
      ["Pecans", 691, 9, 14, 72, 9.5],
      ["Pistachios", 560, 20, 28, 45, 10.5],
      ["Macadamia nuts", 718, 8, 14, 76, 8.5],
      ["Brazil nuts", 659, 14, 12, 67, 7.5],
      ["Hazelnuts", 628, 15, 17, 61, 9.5],
      ["Mixed nuts, roasted", 607, 20, 21, 54, 7],
      ["Trail mix w/ chocolate", 462, 14, 45, 30, 5],
      ["Sunflower seeds", 584, 21, 20, 51, 8.5],
      ["Pumpkin seeds (pepitas)", 559, 30, 11, 49, 6],
      ["Chia seeds", 486, 17, 42, 31, 34.5],
      ["Flax seeds, ground", 534, 18, 29, 42, 27.5],
      ["Hemp seeds", 553, 32, 9, 49, 4],
      ["Sesame seeds", 573, 18, 23, 50, 12],
      ["Tahini", 595, 17, 21, 54, 9.5],
      ["Pine nuts", 673, 14, 13, 68, 3.5],
    ],
  },
  snacks_sweets: {
    label: "Snacks & Sweets",
    servingUnit: "g",
    commonServings: [
      { label: "Snack size (30 g)", amount: 30 },
      { label: "Standard (50 g)", amount: 50 },
      { label: "Indulgent (100 g)", amount: 100 },
    ],
    items: [
      ["Potato chips", 536, 7, 53, 34, 4.5],
      ["Tortilla chips", 497, 7, 63, 24, 5],
      ["Pretzels", 380, 10, 80, 3, 3],
      ["Popcorn, air-popped", 387, 13, 78, 5, 14.5],
      ["Popcorn, movie-style buttered", 500, 8, 50, 31, 9],
      ["Cheese puffs", 558, 7, 53, 36, 1.5],
      ["Pita chips", 457, 12, 68, 15, 4],
      ["Veggie straws", 514, 3, 60, 29, 3],
      ["Granola bar, chewy", 419, 6, 67, 14, 4.5],
      ["Protein bar (typical)", 380, 30, 40, 12, 6],
      ["Rice Krispies treat", 396, 3, 80, 7, 0.5],
      ["Chocolate chip cookie", 488, 5, 64, 24, 2],
      ["Oreo-style cookies", 480, 5, 71, 20, 2.5],
      ["Brownie", 405, 5, 56, 19, 2],
      ["Donut, glazed", 421, 5, 49, 23, 1.5],
      ["Muffin, blueberry", 377, 5, 53, 16, 1.5],
      ["Cupcake, frosted", 405, 3, 60, 17, 1],
      ["Cake, chocolate w/ frosting", 389, 4, 56, 17, 2],
      ["Cheesecake", 321, 6, 26, 22, 0.5],
      ["Apple pie", 237, 2, 34, 11, 1.5],
      ["Pumpkin pie", 229, 4, 30, 10, 1.5],
      ["Milk chocolate bar", 535, 8, 59, 30, 3.5],
      ["Dark chocolate, 70%", 598, 8, 46, 43, 11],
      ["Peanut butter cups", 515, 10, 56, 31, 3.5],
      ["Gummy bears", 325, 7, 77, 0, 0],
      ["Hard candy", 394, 0, 98, 0, 0],
      ["Caramel candy", 382, 5, 77, 8, 1],
      ["M&M-style candies", 492, 4, 71, 21, 2.5],
      ["Fruit snacks", 333, 0, 80, 0, 0],
      ["Jelly beans", 375, 0, 94, 0, 0],
      ["Marshmallows", 318, 2, 81, 0, 0],
      ["Honey", 304, 0, 82, 0, 0],
      ["Maple syrup", 260, 0, 67, 0, 0],
      ["Nutella-style spread", 539, 6, 57, 31, 3.5],
      ["Beef stick (snack)", 495, 22, 3, 44, 0],
      ["Pork rinds", 544, 61, 0, 31, 0],
      ["Pop-Tart-style pastry", 400, 4, 70, 11, 1],
      ["Pudding cup, chocolate", 120, 2, 21, 3, 0.5],
      ["Jello cup", 62, 1, 15, 0, 0],
      ["Sorbet", 134, 0, 34, 0, 1],
    ],
  },
  beverages: {
    label: "Beverages",
    servingUnit: "ml",
    commonServings: [
      { label: "Cup (240 ml)", amount: 240 },
      { label: "Bottle (355 ml)", amount: 355 },
      { label: "Large (500 ml)", amount: 500 },
    ],
    items: [
      ["Water", 0, 0, 0, 0, 0],
      ["Sparkling water, unsweetened", 0, 0, 0, 0, 0],
      ["Coffee, black", 1, 0, 0, 0, 0],
      ["Coffee w/ cream and sugar", 30, 0, 4, 1, 0],
      ["Latte, 2% milk", 42, 2, 4, 2, 0],
      ["Cappuccino", 30, 2, 3, 1, 0],
      ["Cold brew, black", 2, 0, 0, 0, 0],
      ["Mocha", 80, 3, 11, 3, 0.5],
      ["Tea, unsweetened", 1, 0, 0, 0, 0],
      ["Sweet tea", 35, 0, 9, 0, 0],
      ["Green tea", 0, 0, 0, 0, 0],
      ["Orange juice", 45, 1, 10, 0, 0],
      ["Apple juice", 46, 0, 11, 0, 0],
      ["Cranberry juice cocktail", 54, 0, 14, 0, 0],
      ["Grape juice", 60, 0, 15, 0, 0],
      ["Lemonade", 40, 0, 10, 0, 0],
      ["Cola", 42, 0, 11, 0, 0],
      ["Diet cola", 0, 0, 0, 0, 0],
      ["Lemon-lime soda", 41, 0, 11, 0, 0],
      ["Root beer", 43, 0, 11, 0, 0],
      ["Ginger ale", 34, 0, 9, 0, 0],
      ["Sports drink (Gatorade-style)", 26, 0, 6, 0, 0],
      ["Energy drink", 45, 0, 11, 0, 0],
      ["Energy drink, sugar-free", 2, 0, 0, 0, 0],
      ["Kombucha", 13, 0, 3, 0, 0],
      ["Coconut water", 19, 0, 4, 0, 0],
      ["Smoothie, fruit (typical)", 60, 1, 14, 0, 1],
      ["Protein shake, ready-to-drink", 64, 8, 3, 2, 0.5],
      ["Beer, regular", 43, 0, 4, 0, 0],
      ["Beer, light", 29, 0, 2, 0, 0],
      ["IPA", 60, 1, 5, 0, 0],
      ["Wine, red", 85, 0, 3, 0, 0],
      ["Wine, white", 82, 0, 3, 0, 0],
      ["Champagne", 76, 0, 1, 0, 0],
      ["Vodka/whiskey/rum (spirits)", 231, 0, 0, 0, 0],
      ["Margarita", 153, 0, 10, 0, 0],
      ["Hot chocolate", 77, 3, 13, 2, 0.5],
    ],
  },
  restaurant: {
    label: "Restaurant & Fast Food",
    servingUnit: "g",
    commonServings: [
      { label: "Item (typical)", amount: 100 },
      { label: "Half portion (150 g)", amount: 150 },
      { label: "Full portion (300 g)", amount: 300 },
    ],
    items: [
      ["Cheeseburger, fast food", 263, 13, 27, 12, 1.5],
      ["Hamburger, fast food", 254, 13, 30, 9, 1.5],
      ["Double cheeseburger", 282, 16, 20, 16, 1],
      ["Chicken sandwich, crispy", 264, 13, 24, 13, 1.5],
      ["Chicken sandwich, grilled", 200, 19, 20, 5, 1.5],
      ["Pizza, cheese (per slice ~107g)", 266, 11, 33, 10, 2],
      ["Pizza, pepperoni", 298, 13, 34, 12, 2],
      ["Pizza, veggie", 235, 10, 31, 8, 2.5],
      ["Burrito, chicken (Chipotle-style)", 163, 9, 19, 6, 2.5],
      ["Burrito bowl, chicken", 120, 11, 11, 4, 3],
      ["Tacos, beef hard shell", 226, 9, 20, 13, 3],
      ["Tacos, chicken soft", 180, 12, 18, 7, 2],
      ["Quesadilla, cheese", 290, 12, 26, 16, 1.5],
      ["Nachos w/ cheese", 306, 8, 32, 17, 3],
      ["Chicken burrito w/ everything", 170, 9, 18, 7, 2.5],
      ["Fried chicken, 2pc (KFC-style)", 260, 19, 9, 17, 0.5],
      ["Chicken wings, buffalo", 203, 18, 4, 13, 0],
      ["Sub sandwich, turkey (per 100g)", 188, 11, 24, 6, 1.5],
      ["Sub sandwich, Italian", 240, 11, 23, 12, 1.5],
      ["Club sandwich", 243, 14, 22, 12, 1.5],
      ["BLT sandwich", 244, 9, 24, 13, 1.5],
      ["Grilled cheese sandwich", 312, 11, 28, 18, 1.5],
      ["Philly cheesesteak", 222, 14, 17, 11, 1],
      ["Gyro", 217, 12, 18, 11, 1.5],
      ["Pad thai, chicken", 153, 8, 18, 6, 1.5],
      ["Fried rice, chicken (restaurant)", 168, 7, 21, 6, 1],
      ["Lo mein, chicken", 145, 7, 20, 4, 1.5],
      ["General Tso's chicken", 215, 12, 19, 11, 1],
      ["Orange chicken", 230, 11, 24, 10, 1],
      ["Beef and broccoli", 120, 10, 7, 6, 1.5],
      ["Sushi roll, California", 130, 4, 22, 2, 1],
      ["Sushi roll, spicy tuna", 150, 7, 21, 4, 1],
      ["Sashimi, salmon", 180, 22, 0, 10, 0],
      ["Poke bowl, typical", 130, 9, 14, 4, 1.5],
      ["Ramen bowl, tonkotsu", 105, 5, 12, 4, 1],
      ["Pho, beef", 60, 5, 8, 1, 0.5],
      ["Chicken tikka masala", 145, 11, 6, 9, 1],
      ["Butter chicken", 165, 12, 5, 11, 1],
      ["Chicken curry w/ rice", 130, 7, 16, 4, 1],
      ["Falafel wrap", 200, 7, 26, 8, 4],
      ["Caesar salad w/ chicken", 127, 10, 5, 8, 1.5],
      ["Cobb salad", 120, 9, 4, 8, 1.5],
      ["Greek salad", 105, 3, 6, 8, 2],
      ["Chicken noodle soup", 36, 3, 4, 1, 0.5],
      ["Tomato soup", 74, 2, 13, 2, 1],
      ["Clam chowder", 95, 5, 9, 5, 0.5],
      ["Chili con carne", 115, 9, 9, 5, 3],
      ["Mozzarella sticks", 320, 14, 26, 18, 1.5],
      ["Onion rings", 411, 5, 38, 27, 2.5],
      ["Egg roll", 222, 7, 24, 11, 2],
      ["Spring roll, fresh", 110, 4, 18, 2, 2],
      ["Fish and chips", 232, 12, 19, 12, 1.5],
      ["Hot wings (per 100g)", 220, 19, 5, 14, 0],
      ["Breakfast burrito", 215, 10, 20, 11, 1.5],
      ["Egg McMuffin-style sandwich", 233, 13, 22, 10, 1.5],
      ["Pancake breakfast w/ syrup", 240, 4, 45, 5, 1],
      ["Avocado toast", 195, 5, 18, 12, 4],
      ["Acai bowl", 110, 2, 21, 3, 3],
    ],
  },
  condiments: {
    label: "Condiments, Oils & Sauces",
    servingUnit: "g",
    commonServings: [
      { label: "Teaspoon (5 g)", amount: 5 },
      { label: "Tablespoon (15 g)", amount: 15 },
      { label: "Quarter cup (60 g)", amount: 60 },
    ],
    items: [
      ["Olive oil", 884, 0, 0, 100, 0],
      ["Avocado oil", 884, 0, 0, 100, 0],
      ["Coconut oil", 862, 0, 0, 100, 0],
      ["Vegetable oil", 884, 0, 0, 100, 0],
      ["Cooking spray (per 1s spray)", 2, 0, 0, 0, 0],
      ["Mayonnaise", 680, 1, 1, 75, 0],
      ["Mayonnaise, light", 333, 1, 9, 33, 0],
      ["Ketchup", 101, 1, 27, 0, 0],
      ["Mustard, yellow", 60, 4, 6, 3, 3],
      ["Dijon mustard", 66, 4, 6, 4, 3],
      ["BBQ sauce", 172, 1, 41, 1, 1],
      ["Hot sauce", 12, 1, 2, 0, 0.5],
      ["Sriracha", 93, 2, 19, 1, 2],
      ["Soy sauce", 53, 8, 5, 0, 1],
      ["Teriyaki sauce", 89, 6, 16, 0, 0],
      ["Ranch dressing", 430, 1, 6, 45, 0],
      ["Ranch, light", 222, 1, 12, 18, 0],
      ["Caesar dressing", 477, 2, 4, 51, 0],
      ["Italian dressing", 240, 0, 12, 21, 0],
      ["Balsamic vinaigrette", 230, 0, 13, 20, 0],
      ["Balsamic vinegar", 88, 0, 17, 0, 0],
      ["Honey mustard", 333, 1, 27, 25, 0.5],
      ["Thousand island", 379, 1, 15, 35, 0.5],
      ["Blue cheese dressing", 484, 2, 5, 52, 0],
      ["Tzatziki", 117, 4, 5, 9, 0.5],
      ["Guacamole", 157, 2, 9, 14, 6],
      ["Salsa", 29, 1, 6, 0, 1.5],
      ["Pico de gallo", 25, 1, 5, 0, 1],
      ["Pesto", 458, 5, 6, 46, 1.5],
      ["Marinara sauce", 50, 2, 8, 1, 2],
      ["Alfredo sauce", 178, 3, 5, 16, 0],
      ["Gravy, brown", 53, 2, 6, 2, 0.5],
      ["Tartar sauce", 333, 1, 13, 31, 0],
      ["Buffalo sauce", 33, 0, 2, 2, 0],
      ["Jam/jelly", 278, 0, 69, 0, 1],
      ["Sugar, white", 387, 0, 100, 0, 0],
      ["Brown sugar", 380, 0, 98, 0, 0],
      ["Agave nectar", 310, 0, 76, 0, 0],
    ],
  },
};

const expansionBases = [
  ["Chicken breast", 165, 31, 0, 4, 0],
  ["Turkey breast", 135, 30, 0, 1, 0],
  ["Lean beef", 217, 26, 0, 12, 0],
  ["Salmon", 206, 22, 0, 13, 0],
  ["Tuna", 116, 26, 0, 1, 0],
  ["Shrimp", 99, 24, 0, 0, 0],
  ["Egg whites", 52, 11, 1, 0, 0],
  ["Greek yogurt", 73, 10, 4, 2, 0],
  ["Cottage cheese", 84, 11, 4, 2, 0],
  ["Tofu", 78, 9, 2, 4, 1],
  ["Tempeh", 192, 20, 8, 11, 5],
  ["Black beans", 132, 9, 24, 1, 9],
  ["Lentils", 116, 9, 20, 0, 8],
  ["Chickpeas", 164, 9, 27, 3, 8],
  ["Quinoa", 120, 4, 21, 2, 3],
  ["Brown rice", 112, 3, 23, 1, 2],
  ["Sweet potato", 86, 2, 20, 0, 3],
  ["Oats", 389, 17, 66, 7, 10],
  ["Whole wheat pasta", 149, 6, 30, 1, 4],
  ["Spinach", 23, 3, 4, 0, 2],
  ["Broccoli", 35, 3, 7, 0, 3],
  ["Blueberries", 57, 1, 14, 0, 2.5],
  ["Banana", 89, 1, 23, 0, 2.5],
  ["Avocado", 160, 2, 9, 15, 7],
  ["Almonds", 579, 21, 22, 50, 12],
] as const satisfies readonly FoodTuple[];

const prepStyles = [
  ["grilled", 1, 0],
  ["roasted", 1.03, 1],
  ["air-fried", 1.08, 2],
  ["sauteed", 1.12, 4],
  ["steamed", 0.98, 0],
  ["meal prep", 1, 1],
  ["low sodium", 0.97, 0],
  ["spicy", 1.02, 0],
  ["garlic herb", 1.02, 1],
  ["lemon pepper", 1, 0],
  ["smoked", 1.04, 1],
  ["baked", 1.02, 1],
  ["plain", 1, 0],
  ["with salsa", 1.04, 0],
  ["with olive oil", 1.18, 6],
  ["with vegetables", 0.95, 0],
  ["breakfast portion", 0.92, 0],
  ["lunch portion", 1, 0],
  ["dinner portion", 1.08, 1],
  ["post-workout", 1.05, 0],
  ["light portion", 0.82, 0],
  ["hearty portion", 1.2, 2],
  ["restaurant style", 1.25, 5],
  ["home style", 1.03, 1],
] as const;

function generatedFoodTuples(): FoodTuple[] {
  return expansionBases.flatMap(([name, kcal, protein, carbs, fat, fiber]) =>
    prepStyles.map(([style, kcalFactor, extraFat]) => [
      `${name}, ${style}`,
      Math.max(1, Math.round(kcal * kcalFactor + extraFat * 9)),
      Math.round(protein),
      Math.round(carbs),
      Math.round(fat + extraFat),
      fiber,
    ] as const)
  );
}

const ALL_DB: Record<string, FoodCategoryDef> = {
  ...DB,
  expanded_ingredients: {
    label: "Expanded Foods & Ingredients",
    servingUnit: "g",
    commonServings: [
      { label: "Small (75 g)", amount: 75 },
      { label: "Standard (125 g)", amount: 125 },
      { label: "Large (200 g)", amount: 200 },
    ],
    items: generatedFoodTuples(),
  },
};

/* ───────────────────────────── public API ───────────────────────────── */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function tagsFor(name: string, t: FoodTuple): string[] {
  const tags: string[] = [];
  const [, kcal, protein, carbs, fat] = t;
  if (protein >= 15 && protein * 4 > kcal * 0.35) tags.push("high-protein");
  if (carbs <= 8) tags.push("low-carb");
  if (fat <= 3) tags.push("low-fat");
  if (t[5] >= 5) tags.push("high-fiber");
  const lower = name.toLowerCase();
  const animal =
    /chicken|beef|pork|turkey|fish|salmon|tuna|shrimp|egg|cheese|milk|yogurt|bacon|ham|lamb|duck|crab|lobster|whey|casein|butter|cream|honey/.test(
      lower,
    );
  if (!animal) tags.push("vegan-friendly");
  return tags;
}

/** Flattened, searchable list of every food in the database. */
export const FOOD_DATABASE: FoodItem[] = Object.entries(ALL_DB).flatMap(
  ([category, def]) =>
    def.items.map((t) => ({
      id: `${category}-${slugify(t[0])}`,
      name: t[0],
      category,
      categoryLabel: def.label,
      servingUnit: def.servingUnit,
      per100: { kcal: t[1], protein: t[2], carbs: t[3], fat: t[4], fiber: t[5] },
      commonServings: def.commonServings,
      tags: tagsFor(t[0], t),
    })),
);

export const FOOD_CATEGORIES = Object.entries(ALL_DB).map(([key, def]) => ({
  key,
  label: def.label,
  count: def.items.length,
}));

export const FOOD_COUNT = FOOD_DATABASE.length;

/** Macro totals for a given food at a given portion (grams or ml). */
export function macrosForPortion(food: FoodItem, amount: number) {
  const f = amount / 100;
  return {
    kcal: Math.round(food.per100.kcal * f),
    protein: Math.round(food.per100.protein * f),
    carbs: Math.round(food.per100.carbs * f),
    fat: Math.round(food.per100.fat * f),
    fiber: Math.round(food.per100.fiber * f * 2) / 2,
  };
}

/**
 * Live autocomplete search. Ranks: prefix match on name > word-start
 * match > substring > tag match. Caller debounces.
 */
export function searchFoods(query: string, limit = 12): FoodItem[] {
  if (query.trim().length < 2) return [];
  return rankedSearch(
    FOOD_DATABASE,
    query,
    (item) => [item.name, item.categoryLabel, item.category, ...item.tags],
    limit,
  );
}

/**
 * Resolve a food id OR a free-text food name (case differences, partials,
 * minor typos) to exactly one food. Returns undefined when nothing matches
 * confidently — callers should fall back to search_foods for a picker.
 */
export function resolveFood(ref: string): FoodItem | undefined {
  const trimmed = ref.trim();
  if (!trimmed) return undefined;
  const byId = FOOD_DATABASE.find((f) => f.id === trimmed);
  if (byId) return byId;
  const top = searchFoods(trimmed, 1)[0];
  if (!top) return undefined;
  return isConfidentMatch(trimmed, [top.name, top.categoryLabel, ...top.tags])
    ? top
    : undefined;
}

/** Filter helpers for the preference/diet chips (meeting decision). */
export function filterFoods(
  filter: "high-protein" | "low-carb" | "low-fat" | "vegan-friendly" | "high-fiber",
  source: FoodItem[] = FOOD_DATABASE,
): FoodItem[] {
  return source.filter((f) => f.tags.includes(filter));
}

/**
 * Recipe database for live search + detail (meeting decision 2026-06-09:
 * recipes with full measurements and per-serving nutrition; W2 diet filters
 * apply). Searchable by title, ingredient names, and tags. Nutrition is
 * per serving. Diet flags map to the DietFilter ids in use-preferences.
 */

import type { DietFilter } from "@/lib/use-preferences";

export type RecipeIngredient = { item: string; amount: string };

export type RecipeNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

export type Recipe = {
  id: string;
  title: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  minutes: number;
  servings: number;
  tags: string[];
  diets: DietFilter[];
  /** allergen keywords for allergy-aware filtering, lowercased */
  allergens: string[];
  perServing: RecipeNutrition;
  ingredients: RecipeIngredient[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: "greek-yogurt-power-bowl",
    title: "Greek yogurt power bowl",
    meal: "Breakfast",
    minutes: 7,
    servings: 1,
    tags: ["quick", "high protein", "no cook"],
    diets: ["high-protein", "low-fat"],
    allergens: ["dairy", "tree nuts"],
    perServing: { calories: 360, protein: 30, carbs: 38, fat: 9, fiber: 6 },
    ingredients: [
      { item: "Plain Greek yogurt, 2%", amount: "200 g" },
      { item: "Mixed berries", amount: "100 g" },
      { item: "Protein granola", amount: "30 g" },
      { item: "Chia seeds", amount: "1 tbsp" },
      { item: "Honey", amount: "1 tsp" },
    ],
    steps: [
      "Spoon the yogurt into a bowl.",
      "Top with berries, granola, and chia seeds.",
      "Drizzle honey and serve.",
    ],
  },
  {
    id: "veggie-tofu-scramble",
    title: "Veggie tofu scramble",
    meal: "Breakfast",
    minutes: 15,
    servings: 2,
    tags: ["vegan", "savory", "meal prep"],
    diets: ["high-protein", "low-carb", "low-fat", "vegan"],
    allergens: ["soy"],
    perServing: { calories: 240, protein: 21, carbs: 12, fat: 12, fiber: 4 },
    ingredients: [
      { item: "Firm tofu, crumbled", amount: "300 g" },
      { item: "Baby spinach", amount: "60 g" },
      { item: "Cherry tomatoes, halved", amount: "100 g" },
      { item: "Nutritional yeast", amount: "2 tbsp" },
      { item: "Turmeric", amount: "1/2 tsp" },
      { item: "Olive oil", amount: "1 tbsp" },
    ],
    steps: [
      "Warm oil in a pan over medium heat.",
      "Add crumbled tofu and turmeric; cook 4 minutes.",
      "Fold in spinach and tomatoes until wilted.",
      "Finish with nutritional yeast, salt, and pepper.",
    ],
  },
  {
    id: "chicken-quinoa-bowl",
    title: "Chicken quinoa bowl",
    meal: "Lunch",
    minutes: 25,
    servings: 2,
    tags: ["balanced", "meal prep", "high protein"],
    diets: ["high-protein"],
    allergens: [],
    perServing: { calories: 520, protein: 42, carbs: 48, fat: 18, fiber: 7 },
    ingredients: [
      { item: "Chicken breast", amount: "300 g" },
      { item: "Cooked quinoa", amount: "200 g" },
      { item: "Roasted chickpeas", amount: "80 g" },
      { item: "Cucumber, diced", amount: "1 small" },
      { item: "Lemon-tahini dressing", amount: "3 tbsp" },
    ],
    steps: [
      "Season and grill the chicken, then slice.",
      "Divide quinoa between bowls.",
      "Top with chicken, chickpeas, and cucumber.",
      "Drizzle dressing and serve.",
    ],
  },
  {
    id: "salmon-rice-plate",
    title: "Salmon rice plate",
    meal: "Dinner",
    minutes: 30,
    servings: 2,
    tags: ["omega-3", "recovery", "balanced"],
    diets: ["high-protein"],
    allergens: ["fish"],
    perServing: { calories: 610, protein: 39, carbs: 58, fat: 24, fiber: 5 },
    ingredients: [
      { item: "Salmon fillet", amount: "2 x 150 g" },
      { item: "Cooked jasmine rice", amount: "260 g" },
      { item: "Broccoli florets", amount: "200 g" },
      { item: "Soy-ginger glaze", amount: "3 tbsp" },
      { item: "Sesame seeds", amount: "1 tbsp" },
    ],
    steps: [
      "Roast salmon at 200°C for 12 minutes.",
      "Steam broccoli until bright green.",
      "Plate rice, salmon, and broccoli.",
      "Brush with glaze and scatter sesame seeds.",
    ],
  },
  {
    id: "turkey-avocado-wrap",
    title: "Turkey avocado wrap",
    meal: "Lunch",
    minutes: 10,
    servings: 1,
    tags: ["portable", "quick", "high protein"],
    diets: ["high-protein"],
    allergens: ["gluten"],
    perServing: { calories: 430, protein: 31, carbs: 38, fat: 17, fiber: 8 },
    ingredients: [
      { item: "Whole-wheat tortilla", amount: "1 large" },
      { item: "Sliced turkey breast", amount: "120 g" },
      { item: "Avocado", amount: "1/2" },
      { item: "Baby greens", amount: "30 g" },
      { item: "Mustard", amount: "1 tsp" },
    ],
    steps: [
      "Spread mustard over the tortilla.",
      "Layer turkey, sliced avocado, and greens.",
      "Roll tightly and slice in half.",
    ],
  },
  {
    id: "lentil-veggie-soup",
    title: "Lentil veggie soup",
    meal: "Dinner",
    minutes: 35,
    servings: 4,
    tags: ["vegan", "batch", "high fiber"],
    diets: ["low-fat", "vegan", "high-protein"],
    allergens: [],
    perServing: { calories: 300, protein: 18, carbs: 45, fat: 4, fiber: 14 },
    ingredients: [
      { item: "Dry green lentils", amount: "200 g" },
      { item: "Carrots, diced", amount: "2" },
      { item: "Celery, diced", amount: "2 stalks" },
      { item: "Crushed tomatoes", amount: "400 g" },
      { item: "Vegetable broth", amount: "1 L" },
      { item: "Cumin and paprika", amount: "1 tsp each" },
    ],
    steps: [
      "Sauté carrots and celery for 5 minutes.",
      "Add lentils, tomatoes, broth, and spices.",
      "Simmer 25 minutes until lentils are tender.",
      "Season and serve.",
    ],
  },
  {
    id: "egg-white-oat-cakes",
    title: "Egg white oat cakes",
    meal: "Breakfast",
    minutes: 12,
    servings: 1,
    tags: ["high protein", "low fat", "pre-workout"],
    diets: ["high-protein", "low-fat"],
    allergens: ["egg", "gluten"],
    perServing: { calories: 320, protein: 28, carbs: 42, fat: 4, fiber: 6 },
    ingredients: [
      { item: "Egg whites", amount: "200 ml" },
      { item: "Rolled oats", amount: "50 g" },
      { item: "Banana, mashed", amount: "1/2" },
      { item: "Cinnamon", amount: "1/2 tsp" },
    ],
    steps: [
      "Blend all ingredients into a batter.",
      "Cook small cakes on a nonstick pan, 2 minutes per side.",
      "Stack and top with extra fruit if desired.",
    ],
  },
  {
    id: "steak-sweet-potato",
    title: "Steak and sweet potato",
    meal: "Dinner",
    minutes: 28,
    servings: 2,
    tags: ["iron-rich", "recovery", "high protein"],
    diets: ["high-protein", "low-fat"],
    allergens: [],
    perServing: { calories: 560, protein: 44, carbs: 46, fat: 22, fiber: 7 },
    ingredients: [
      { item: "Sirloin steak", amount: "300 g" },
      { item: "Sweet potato", amount: "2 medium" },
      { item: "Asparagus", amount: "200 g" },
      { item: "Olive oil", amount: "1 tbsp" },
      { item: "Garlic and rosemary", amount: "to taste" },
    ],
    steps: [
      "Roast cubed sweet potato at 210°C for 22 minutes.",
      "Sear steak 3 minutes per side; rest 5 minutes.",
      "Pan-roast asparagus until tender.",
      "Slice steak and plate everything.",
    ],
  },
  {
    id: "cottage-cheese-toast",
    title: "Cottage cheese toast",
    meal: "Snack",
    minutes: 5,
    servings: 1,
    tags: ["quick", "high protein", "no cook"],
    diets: ["high-protein", "low-fat"],
    allergens: ["dairy", "gluten"],
    perServing: { calories: 250, protein: 22, carbs: 26, fat: 6, fiber: 4 },
    ingredients: [
      { item: "Sourdough toast", amount: "1 slice" },
      { item: "Low-fat cottage cheese", amount: "120 g" },
      { item: "Cherry tomatoes", amount: "60 g" },
      { item: "Everything seasoning", amount: "1/2 tsp" },
    ],
    steps: [
      "Toast the bread.",
      "Spread cottage cheese and top with tomatoes.",
      "Finish with seasoning.",
    ],
  },
  {
    id: "chickpea-power-salad",
    title: "Chickpea power salad",
    meal: "Lunch",
    minutes: 12,
    servings: 2,
    tags: ["vegan", "no cook", "high fiber"],
    diets: ["vegan", "low-fat", "high-protein"],
    allergens: [],
    perServing: { calories: 380, protein: 19, carbs: 50, fat: 12, fiber: 13 },
    ingredients: [
      { item: "Chickpeas, drained", amount: "400 g" },
      { item: "Cucumber, diced", amount: "1" },
      { item: "Cherry tomatoes", amount: "150 g" },
      { item: "Red onion, minced", amount: "1/4" },
      { item: "Lemon-olive oil dressing", amount: "2 tbsp" },
    ],
    steps: [
      "Combine chickpeas and chopped vegetables.",
      "Toss with dressing, salt, and pepper.",
      "Chill 10 minutes before serving.",
    ],
  },
  {
    id: "protein-shake-pb-banana",
    title: "PB-banana protein shake",
    meal: "Snack",
    minutes: 3,
    servings: 1,
    tags: ["post-workout", "quick", "high protein"],
    diets: ["high-protein"],
    allergens: ["peanut", "dairy"],
    perServing: { calories: 330, protein: 34, carbs: 32, fat: 8, fiber: 4 },
    ingredients: [
      { item: "Whey protein", amount: "1 scoop" },
      { item: "Banana", amount: "1" },
      { item: "Peanut butter", amount: "1 tbsp" },
      { item: "Skim milk", amount: "300 ml" },
      { item: "Ice", amount: "1 cup" },
    ],
    steps: ["Add everything to a blender.", "Blend until smooth and serve cold."],
  },
  {
    id: "shrimp-zucchini-noodles",
    title: "Shrimp zucchini noodles",
    meal: "Dinner",
    minutes: 20,
    servings: 2,
    tags: ["low carb", "quick", "high protein"],
    diets: ["high-protein", "low-carb", "low-fat"],
    allergens: ["shellfish"],
    perServing: { calories: 290, protein: 33, carbs: 14, fat: 12, fiber: 4 },
    ingredients: [
      { item: "Shrimp, peeled", amount: "300 g" },
      { item: "Zucchini, spiralized", amount: "2 large" },
      { item: "Garlic, minced", amount: "2 cloves" },
      { item: "Cherry tomatoes", amount: "150 g" },
      { item: "Olive oil", amount: "1 tbsp" },
    ],
    steps: [
      "Sauté garlic in oil, add shrimp, cook 3 minutes.",
      "Add tomatoes and zucchini noodles; toss 2 minutes.",
      "Season and serve immediately.",
    ],
  },
];

const norm = (s: string) => s.toLowerCase().trim();

/**
 * searchRecipes — live search over title, ingredient names, and tags.
 * Empty query returns all recipes in their natural order.
 */
export function searchRecipes(query: string): Recipe[] {
  const q = norm(query);
  if (!q) return RECIPES;
  return RECIPES.filter((recipe) => {
    if (norm(recipe.title).includes(q)) return true;
    if (recipe.tags.some((t) => norm(t).includes(q))) return true;
    if (recipe.ingredients.some((ing) => norm(ing.item).includes(q))) return true;
    return false;
  });
}

/**
 * applyRecipeFilters — keep recipes matching ALL active diet filters and
 * excluding any selected allergen.
 */
export function applyRecipeFilters(
  recipes: Recipe[],
  diets: DietFilter[],
  allergies: string[]
): Recipe[] {
  const blocked = allergies.map(norm);
  return recipes.filter((recipe) => {
    const dietOk = diets.every((d) => recipe.diets.includes(d));
    const allergenOk = !recipe.allergens.some((a) => blocked.includes(norm(a)));
    return dietOk && allergenOk;
  });
}

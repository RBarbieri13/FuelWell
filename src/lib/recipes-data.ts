/**
 * Recipe database for live search + detail (meeting decision 2026-06-09:
 * recipes with full measurements and per-serving nutrition; W2 diet filters
 * apply). Searchable by title, ingredient names, and tags. Nutrition is
 * per serving. Diet flags map to the DietFilter ids in use-preferences.
 */

import type { DietFilter } from "@/lib/use-preferences";
import { rankedSearch } from "@/lib/search-utils";

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

const CURATED_RECIPES: Recipe[] = [
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

type RecipeTemplate = {
  id: string;
  title: string;
  meal: Recipe["meal"];
  minutes: number;
  tags: string[];
  diets: DietFilter[];
  allergens?: string[];
  baseCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: RecipeIngredient[];
  steps: string[];
};

const proteins = [
  { id: "chicken", label: "Chicken", ingredient: "Grilled chicken breast", allergens: [] },
  { id: "turkey", label: "Turkey", ingredient: "Lean ground turkey", allergens: [] },
  { id: "salmon", label: "Salmon", ingredient: "Baked salmon", allergens: ["fish"] },
  { id: "shrimp", label: "Shrimp", ingredient: "Sauteed shrimp", allergens: ["shellfish"] },
  { id: "tofu", label: "Tofu", ingredient: "Extra-firm tofu", allergens: ["soy"], vegan: true },
  { id: "tempeh", label: "Tempeh", ingredient: "Sliced tempeh", allergens: ["soy"], vegan: true },
  { id: "lentil", label: "Lentil", ingredient: "Cooked lentils", allergens: [], vegan: true },
  { id: "black-bean", label: "Black bean", ingredient: "Seasoned black beans", allergens: [], vegan: true },
  { id: "chickpea", label: "Chickpea", ingredient: "Roasted chickpeas", allergens: [], vegan: true },
  { id: "seitan", label: "Seitan", ingredient: "Seitan strips", allergens: ["gluten"], vegan: true },
  { id: "egg", label: "Egg", ingredient: "Eggs and egg whites", allergens: ["egg"] },
  { id: "yogurt", label: "Greek yogurt", ingredient: "Plain Greek yogurt", allergens: ["dairy"] },
  { id: "tuna", label: "Tuna", ingredient: "Tuna steak or canned tuna", allergens: ["fish"] },
  { id: "lean-beef", label: "Lean beef", ingredient: "Lean ground beef", allergens: [] },
  { id: "cottage-cheese", label: "Cottage cheese", ingredient: "Low-fat cottage cheese", allergens: ["dairy"] },
];

const templates: RecipeTemplate[] = [
  {
    id: "power-bowl",
    title: "power bowl",
    meal: "Lunch",
    minutes: 22,
    tags: ["bowl", "meal prep", "balanced"],
    diets: ["high-protein"],
    baseCalories: 480,
    protein: 38,
    carbs: 46,
    fat: 16,
    fiber: 8,
    ingredients: [
      { item: "Cooked quinoa or rice", amount: "3/4 cup" },
      { item: "Roasted vegetables", amount: "1 cup" },
      { item: "Lemon herb sauce", amount: "2 tbsp" },
    ],
    steps: ["Cook the grain base.", "Add protein and vegetables.", "Finish with sauce and herbs."],
  },
  {
    id: "sheet-pan",
    title: "sheet-pan dinner",
    meal: "Dinner",
    minutes: 32,
    tags: ["sheet pan", "dinner", "batch"],
    diets: ["high-protein", "low-fat"],
    baseCalories: 520,
    protein: 42,
    carbs: 48,
    fat: 18,
    fiber: 7,
    ingredients: [
      { item: "Sweet potato or baby potatoes", amount: "250 g" },
      { item: "Green vegetable", amount: "2 cups" },
      { item: "Olive oil and seasoning", amount: "1 tbsp" },
    ],
    steps: ["Heat oven to 425 F.", "Roast protein, vegetables, and starch on one pan.", "Portion with extra herbs or lemon."],
  },
  {
    id: "salad",
    title: "crunch salad",
    meal: "Lunch",
    minutes: 14,
    tags: ["salad", "quick", "high fiber"],
    diets: ["high-protein", "low-carb"],
    baseCalories: 390,
    protein: 34,
    carbs: 24,
    fat: 17,
    fiber: 9,
    ingredients: [
      { item: "Leafy greens", amount: "3 cups" },
      { item: "Cucumber and tomato", amount: "1 cup" },
      { item: "Light vinaigrette", amount: "2 tbsp" },
    ],
    steps: ["Chop vegetables.", "Add protein and dressing.", "Toss just before serving."],
  },
  {
    id: "wrap",
    title: "high-protein wrap",
    meal: "Lunch",
    minutes: 10,
    tags: ["portable", "quick", "wrap"],
    diets: ["high-protein"],
    allergens: ["gluten"],
    baseCalories: 430,
    protein: 32,
    carbs: 40,
    fat: 14,
    fiber: 6,
    ingredients: [
      { item: "Whole-grain tortilla", amount: "1 large" },
      { item: "Greens and sliced vegetables", amount: "1 cup" },
      { item: "Mustard or yogurt sauce", amount: "1 tbsp" },
    ],
    steps: ["Warm the tortilla.", "Layer protein, vegetables, and sauce.", "Roll tightly and slice."],
  },
  {
    id: "breakfast-skillet",
    title: "breakfast skillet",
    meal: "Breakfast",
    minutes: 18,
    tags: ["breakfast", "savory", "recovery"],
    diets: ["high-protein"],
    baseCalories: 410,
    protein: 31,
    carbs: 34,
    fat: 16,
    fiber: 6,
    ingredients: [
      { item: "Diced potatoes or beans", amount: "1/2 cup" },
      { item: "Spinach and peppers", amount: "1 cup" },
      { item: "Salsa", amount: "2 tbsp" },
    ],
    steps: ["Brown the starch base.", "Add vegetables and protein.", "Serve with salsa."],
  },
  {
    id: "protein-snack",
    title: "protein snack plate",
    meal: "Snack",
    minutes: 6,
    tags: ["snack", "quick", "no cook"],
    diets: ["high-protein", "low-fat"],
    baseCalories: 280,
    protein: 24,
    carbs: 22,
    fat: 9,
    fiber: 4,
    ingredients: [
      { item: "Fruit or crisp vegetables", amount: "1 cup" },
      { item: "Whole-grain crackers or rice cakes", amount: "1 serving" },
      { item: "Seasoning or dip", amount: "to taste" },
    ],
    steps: ["Plate protein and produce.", "Add the crunchy side.", "Season and serve."],
  },
  {
    id: "soup",
    title: "steady soup",
    meal: "Dinner",
    minutes: 35,
    tags: ["soup", "batch", "high fiber"],
    diets: ["high-protein", "low-fat"],
    baseCalories: 360,
    protein: 28,
    carbs: 42,
    fat: 8,
    fiber: 10,
    ingredients: [
      { item: "Low-sodium broth", amount: "3 cups" },
      { item: "Carrots, celery, and onion", amount: "2 cups" },
      { item: "Beans, rice, or noodles", amount: "1/2 cup" },
    ],
    steps: ["Simmer vegetables in broth.", "Add protein and carb base.", "Season and portion for leftovers."],
  },
  {
    id: "stir-fry",
    title: "stir-fry",
    meal: "Dinner",
    minutes: 20,
    tags: ["quick", "stir fry", "vegetables"],
    diets: ["high-protein"],
    baseCalories: 470,
    protein: 36,
    carbs: 45,
    fat: 15,
    fiber: 7,
    ingredients: [
      { item: "Mixed stir-fry vegetables", amount: "2 cups" },
      { item: "Cooked rice or noodles", amount: "3/4 cup" },
      { item: "Ginger-garlic sauce", amount: "2 tbsp" },
    ],
    steps: ["Sear protein in a hot pan.", "Add vegetables and sauce.", "Serve over the carb base."],
  },
  {
    id: "pasta",
    title: "macro pasta",
    meal: "Dinner",
    minutes: 24,
    tags: ["pasta", "comfort", "post-workout"],
    diets: ["high-protein"],
    allergens: ["gluten"],
    baseCalories: 560,
    protein: 39,
    carbs: 65,
    fat: 16,
    fiber: 6,
    ingredients: [
      { item: "Pasta or chickpea pasta", amount: "75 g dry" },
      { item: "Tomato sauce", amount: "1/2 cup" },
      { item: "Greens", amount: "1 cup" },
    ],
    steps: ["Boil pasta.", "Warm protein with sauce and greens.", "Combine and portion."],
  },
  {
    id: "smoothie",
    title: "smoothie",
    meal: "Snack",
    minutes: 5,
    tags: ["smoothie", "quick", "post-workout"],
    diets: ["high-protein", "low-fat"],
    baseCalories: 330,
    protein: 30,
    carbs: 38,
    fat: 6,
    fiber: 6,
    ingredients: [
      { item: "Fruit", amount: "1 cup" },
      { item: "Milk or fortified plant milk", amount: "1 cup" },
      { item: "Ice and cinnamon", amount: "to taste" },
    ],
    steps: ["Add ingredients to a blender.", "Blend until smooth.", "Adjust thickness with ice or milk."],
  },
];

const recipeFormats = [
  {
    id: "classic",
    label: "",
    minuteDelta: 0,
    calorieDelta: 0,
    proteinDelta: 0,
    carbDelta: 0,
    fatDelta: 0,
    tags: ["classic"],
    ingredient: { item: "Fresh herbs or citrus", amount: "to taste" },
  },
  {
    id: "speedy",
    label: "speedy",
    minuteDelta: -5,
    calorieDelta: -35,
    proteinDelta: 0,
    carbDelta: -4,
    fatDelta: -2,
    tags: ["speedy", "weeknight"],
    ingredient: { item: "Pre-cut vegetables", amount: "1 cup" },
  },
  {
    id: "high-volume",
    label: "high-volume",
    minuteDelta: 3,
    calorieDelta: 55,
    proteinDelta: 3,
    carbDelta: 9,
    fatDelta: 1,
    tags: ["high volume", "satiety"],
    ingredient: { item: "Extra vegetables", amount: "2 cups" },
  },
  {
    id: "post-workout",
    label: "post-workout",
    minuteDelta: 2,
    calorieDelta: 90,
    proteinDelta: 8,
    carbDelta: 14,
    fatDelta: 1,
    tags: ["post-workout", "recovery"],
    ingredient: { item: "Recovery carb add-on", amount: "1 serving" },
  },
];

function generatedRecipes(): Recipe[] {
  const out: Recipe[] = [];
  for (const protein of proteins) {
    for (const template of templates) {
      for (const format of recipeFormats) {
        const veganDiets = protein.vegan
          ? Array.from(new Set([...template.diets, "vegan" as DietFilter]))
          : template.diets.filter((diet) => diet !== "vegan");
        out.push({
          id: `${protein.id}-${template.id}-${format.id}`,
          title: `${protein.label} ${format.label ? `${format.label} ` : ""}${template.title}`,
          meal: template.meal,
          minutes: Math.max(5, template.minutes + format.minuteDelta + (protein.id === "lentil" ? 4 : 0)),
          servings: template.meal === "Snack" || template.meal === "Breakfast" ? 1 : 2,
          tags: Array.from(new Set([...template.tags, ...format.tags, protein.label.toLowerCase(), "seeded"])),
          diets: veganDiets,
          allergens: Array.from(new Set([...(template.allergens ?? []), ...protein.allergens])),
          perServing: {
            calories: Math.max(120, template.baseCalories + format.calorieDelta + (protein.id === "salmon" ? 70 : protein.id === "tofu" ? -60 : 0)),
            protein: Math.max(8, template.protein + format.proteinDelta + (protein.id === "yogurt" ? -4 : protein.id === "lentil" ? -8 : 2)),
            carbs: Math.max(4, template.carbs + format.carbDelta + (protein.id === "lentil" ? 8 : 0)),
            fat: Math.max(2, template.fat + format.fatDelta + (protein.id === "salmon" ? 7 : protein.id === "tofu" ? 2 : 0)),
            fiber: template.fiber + (protein.vegan ? 3 : 0),
          },
          ingredients: [
            { item: protein.ingredient, amount: template.meal === "Snack" ? "120 g" : "160 g" },
            format.ingredient,
            ...template.ingredients,
          ],
          steps: template.steps,
        });
      }
    }
  }
  return out;
}

export const RECIPES: Recipe[] = [...CURATED_RECIPES, ...generatedRecipes()];

export const RECIPE_COUNT = RECIPES.length;

const norm = (s: string) => s.toLowerCase().trim();

/**
 * searchRecipes — live search over title, ingredient names, and tags.
 * Empty query returns all recipes in their natural order.
 */
export function searchRecipes(query: string): Recipe[] {
  return rankedSearch(
    RECIPES,
    query,
    (recipe) => [
      recipe.title,
      recipe.meal,
      ...recipe.tags,
      ...recipe.diets,
      ...recipe.ingredients.map((ingredient) => ingredient.item),
    ],
  );
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

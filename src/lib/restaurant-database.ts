/**
 * FuelWell Restaurant Nutrition Database — GENERATED FILE, do not hand-edit.
 *
 * Source of truth: tools/restaurant-data/batch-*.json, gathered 2026-06-12
 * from each chain's published nutrition pages/PDFs (fastfoodnutrition.org or
 * nutrition-charts.com used as fallback where official pages were
 * JS-rendered or bot-blocked; per-item sourceUrl records the exact origin).
 * Values are per listed serving, NOT per 100 g. Published values are
 * rounded by the chains and may lag current menus.
 *
 * Regenerate: node tools/build-restaurant-db.mjs
 * 50 restaurants, 634 items.
 */

export interface RestaurantMenuItem {
  /** "<restaurant-id>:<item-slug>" */
  id: string;
  name: string;
  /** Human serving label, e.g. "1 sandwich", "24 fl oz smoothie". */
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Page the values were taken from. */
  sourceUrl: string;
}

export interface Restaurant {
  id: string;
  name: string;
  items: RestaurantMenuItem[];
}

export const RESTAURANT_DATABASE: readonly Restaurant[] = [
  {
    "id": "applebees",
    "name": "Applebee's",
    "items": [
      {
        "id": "applebees:bourbon-street-chicken-shrimp",
        "name": "Bourbon Street Chicken & Shrimp",
        "serving": "1 entree",
        "calories": 780,
        "protein": 55,
        "carbs": 48,
        "fat": 43,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/bourbon-street-chicken-shrimp"
      },
      {
        "id": "applebees:fiesta-lime-chicken",
        "name": "Fiesta Lime Chicken",
        "serving": "1 entree",
        "calories": 1170,
        "protein": 60,
        "carbs": 97,
        "fat": 61,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/fiesta-lime-chicken"
      },
      {
        "id": "applebees:classic-bacon-cheeseburger",
        "name": "Classic Bacon Cheeseburger",
        "serving": "1 burger",
        "calories": 881,
        "protein": 50,
        "carbs": 46,
        "fat": 55,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/classic-bacon-cheeseburger"
      },
      {
        "id": "applebees:quesadilla-burger",
        "name": "Quesadilla Burger",
        "serving": "1 burger",
        "calories": 1331,
        "protein": 74,
        "carbs": 50,
        "fat": 93,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/quesadilla-burger"
      },
      {
        "id": "applebees:double-glazed-baby-back-ribs-full-rack",
        "name": "Double-Glazed Baby Back Ribs (Full Rack)",
        "serving": "1 rack",
        "calories": 910,
        "protein": 80,
        "carbs": 2,
        "fat": 65,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/double-glazed-baby-back-ribs/full-rack"
      },
      {
        "id": "applebees:classic-broccoli-chicken-alfredo",
        "name": "Classic Broccoli Chicken Alfredo",
        "serving": "1 entree",
        "calories": 1271,
        "protein": 75,
        "carbs": 78,
        "fat": 76,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/classic-broccoli-chicken-alfredo-pasta"
      },
      {
        "id": "applebees:8-oz-top-sirloin",
        "name": "8 oz. Top Sirloin",
        "serving": "1 steak",
        "calories": 270,
        "protein": 45,
        "carbs": 1,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/sirloin-steak/8-oz"
      },
      {
        "id": "applebees:mozzarella-sticks-with-marinara-sauce",
        "name": "Mozzarella Sticks with Marinara Sauce",
        "serving": "1 appetizer",
        "calories": 901,
        "protein": 43,
        "carbs": 80,
        "fat": 46,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/mozzarella-sticks/with-marinara-sauce"
      },
      {
        "id": "applebees:boneless-wings",
        "name": "Boneless Wings",
        "serving": "1 appetizer",
        "calories": 681,
        "protein": 39,
        "carbs": 52,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/boneless-wings"
      },
      {
        "id": "applebees:chicken-wonton-tacos",
        "name": "Chicken Wonton Tacos",
        "serving": "1 appetizer",
        "calories": 571,
        "protein": 36,
        "carbs": 46,
        "fat": 27,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/chicken-wonton-tacos"
      },
      {
        "id": "applebees:spinach-artichoke-dip-with-salsa-chips",
        "name": "Spinach & Artichoke Dip with Salsa & Chips",
        "serving": "1 appetizer",
        "calories": 931,
        "protein": 18,
        "carbs": 88,
        "fat": 57,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/spinach-artichoke-dip-with-salsa-chips"
      },
      {
        "id": "applebees:garlic-mashed-potatoes",
        "name": "Garlic Mashed Potatoes",
        "serving": "1 side",
        "calories": 280,
        "protein": 5,
        "carbs": 37,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/garlic-mashed-potatoes"
      },
      {
        "id": "applebees:blue-ribbon-brownie-with-vanilla-ice-cream",
        "name": "Blue Ribbon Brownie with Vanilla Ice Cream",
        "serving": "1 dessert",
        "calories": 1522,
        "protein": 26,
        "carbs": 211,
        "fat": 65,
        "sourceUrl": "https://fastfoodnutrition.org/applebees/blue-ribbon-brownie-with-vanilla-ice-cream"
      }
    ]
  },
  {
    "id": "arbys",
    "name": "Arby's",
    "items": [
      {
        "id": "arbys:classic-roast-beef",
        "name": "Classic Roast Beef",
        "serving": "1 sandwich (154g)",
        "calories": 360,
        "protein": 23,
        "carbs": 37,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/classic-roast-beef"
      },
      {
        "id": "arbys:classic-beef-n-cheddar",
        "name": "Classic Beef 'N Cheddar",
        "serving": "1 sandwich",
        "calories": 450,
        "protein": 23,
        "carbs": 45,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/beef-n-cheddar-classic"
      },
      {
        "id": "arbys:double-roast-beef",
        "name": "Double Roast Beef",
        "serving": "1 sandwich",
        "calories": 510,
        "protein": 38,
        "carbs": 38,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/double-roast-beef"
      },
      {
        "id": "arbys:smokehouse-brisket-sandwich",
        "name": "Smokehouse Brisket Sandwich",
        "serving": "1 sandwich (203g)",
        "calories": 600,
        "protein": 33,
        "carbs": 42,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/smokehouse-brisket"
      },
      {
        "id": "arbys:classic-french-dip-swiss-w-au-jus",
        "name": "Classic French Dip & Swiss w/ Au Jus",
        "serving": "1 sandwich",
        "calories": 540,
        "protein": 34,
        "carbs": 51,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/classic-french-dip-swissau-jus"
      },
      {
        "id": "arbys:greek-gyro",
        "name": "Greek Gyro",
        "serving": "1 gyro",
        "calories": 710,
        "protein": 23,
        "carbs": 55,
        "fat": 44,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/greek-gyro"
      },
      {
        "id": "arbys:buttermilk-chicken-bacon-swiss",
        "name": "Buttermilk Chicken Bacon & Swiss",
        "serving": "1 sandwich",
        "calories": 610,
        "protein": 35,
        "carbs": 51,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/buttermilk-chicken-bacon-swiss"
      },
      {
        "id": "arbys:curly-fries-medium",
        "name": "Curly Fries (Medium)",
        "serving": "1 medium order (170g)",
        "calories": 550,
        "protein": 6,
        "carbs": 65,
        "fat": 29,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/curly-fries/medium"
      },
      {
        "id": "arbys:mozzarella-sticks-4-piece",
        "name": "Mozzarella Sticks (4 Piece)",
        "serving": "4 pieces",
        "calories": 440,
        "protein": 19,
        "carbs": 37,
        "fat": 23,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/mozzarella-sticks/4-piece"
      },
      {
        "id": "arbys:jalapeno-bites-5-piece",
        "name": "Jalapeno Bites (5 Piece)",
        "serving": "5 pieces",
        "calories": 290,
        "protein": 5,
        "carbs": 31,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/jalapeno-bites/5-piece"
      },
      {
        "id": "arbys:jamocha-shake-medium",
        "name": "Jamocha Shake (Medium)",
        "serving": "1 medium shake (587g)",
        "calories": 810,
        "protein": 19,
        "carbs": 132,
        "fat": 23,
        "sourceUrl": "https://fastfoodnutrition.org/arbys/jamocha-shake/medium"
      }
    ]
  },
  {
    "id": "bojangles",
    "name": "Bojangles",
    "items": [
      {
        "id": "bojangles:cajun-filet-biscuit",
        "name": "Cajun Filet Biscuit",
        "serving": "1 biscuit",
        "calories": 570,
        "protein": 23,
        "carbs": 57,
        "fat": 27,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:sausage-egg-biscuit",
        "name": "Sausage & Egg Biscuit",
        "serving": "1 biscuit",
        "calories": 550,
        "protein": 21,
        "carbs": 38,
        "fat": 34,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:bacon-egg-cheese-biscuit",
        "name": "Bacon, Egg & Cheese Biscuit",
        "serving": "1 biscuit",
        "calories": 510,
        "protein": 28,
        "carbs": 40,
        "fat": 27,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:steak-biscuit",
        "name": "Steak Biscuit",
        "serving": "1 biscuit",
        "calories": 620,
        "protein": 16,
        "carbs": 48,
        "fat": 40,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:fried-chicken-breast",
        "name": "Fried Chicken Breast",
        "serving": "1 piece",
        "calories": 540,
        "protein": 41,
        "carbs": 24,
        "fat": 29,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:fried-chicken-thigh",
        "name": "Fried Chicken Thigh",
        "serving": "1 piece",
        "calories": 240,
        "protein": 21,
        "carbs": 14,
        "fat": 10,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:fried-chicken-leg",
        "name": "Fried Chicken Leg",
        "serving": "1 piece",
        "calories": 190,
        "protein": 10,
        "carbs": 8,
        "fat": 13,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:chicken-supremes-4-pc",
        "name": "Chicken Supremes (4 pc)",
        "serving": "4 pieces",
        "calories": 500,
        "protein": 32,
        "carbs": 33,
        "fat": 25,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:bos-chicken-tenders-4-pc",
        "name": "Bo's Chicken Tenders (4 pc)",
        "serving": "4 pieces",
        "calories": 410,
        "protein": 48,
        "carbs": 23,
        "fat": 14,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:seasoned-fries-medium",
        "name": "Seasoned Fries (medium)",
        "serving": "1 medium order",
        "calories": 450,
        "protein": 4,
        "carbs": 49,
        "fat": 26,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:bo-tato-rounds-medium",
        "name": "Bo-Tato Rounds (medium)",
        "serving": "1 medium order",
        "calories": 390,
        "protein": 3,
        "carbs": 40,
        "fat": 24,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:macaroni-n-cheese-individual",
        "name": "Macaroni 'N Cheese (individual)",
        "serving": "1 individual side",
        "calories": 280,
        "protein": 8,
        "carbs": 21,
        "fat": 18,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:cajun-pintos-individual",
        "name": "Cajun Pintos (individual)",
        "serving": "1 individual side",
        "calories": 130,
        "protein": 7,
        "carbs": 24,
        "fat": 0.5,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:bo-berry-biscuit",
        "name": "Bo-Berry Biscuit",
        "serving": "1 biscuit",
        "calories": 370,
        "protein": 5,
        "carbs": 49,
        "fat": 17,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      },
      {
        "id": "bojangles:vanilla-milkshake-regular",
        "name": "Vanilla Milkshake (regular)",
        "serving": "1 regular shake",
        "calories": 620,
        "protein": 12,
        "carbs": 86,
        "fat": 26,
        "sourceUrl": "https://storyblok.pleinaircdn.com/f/110020/x/6c7b2a7e6a/m25-099-2025_02-nutritiongudeupdates_bobitessalad_master.pdf"
      }
    ]
  },
  {
    "id": "buffalo-wild-wings",
    "name": "Buffalo Wild Wings",
    "items": [
      {
        "id": "buffalo-wild-wings:traditional-bone-in-wings-6-plain-add-sauce-or-dry-rub",
        "name": "Traditional Bone-In Wings (6), plain (add sauce or dry rub)",
        "serving": "6 wings",
        "calories": 430,
        "protein": 53,
        "carbs": 0,
        "fat": 24,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:boneless-wings-6-plain-add-sauce-or-dry-rub",
        "name": "Boneless Wings (6), plain (add sauce or dry rub)",
        "serving": "6 wings",
        "calories": 360,
        "protein": 29,
        "carbs": 20,
        "fat": 19,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:all-american-cheeseburger",
        "name": "All-American Cheeseburger",
        "serving": "1 burger",
        "calories": 820,
        "protein": 48,
        "carbs": 38,
        "fat": 53,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:triple-bacon-cheeseburger",
        "name": "Triple-Bacon Cheeseburger",
        "serving": "1 burger",
        "calories": 1200,
        "protein": 72,
        "carbs": 41,
        "fat": 83,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:classic-chicken-sandwich",
        "name": "Classic Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 640,
        "protein": 31,
        "carbs": 55,
        "fat": 33,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:grilled-classic-chicken-sandwich",
        "name": "Grilled Classic Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 410,
        "protein": 27,
        "carbs": 34,
        "fat": 19,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:buffalo-ranch-chicken-wrap",
        "name": "Buffalo Ranch Chicken Wrap",
        "serving": "1 wrap",
        "calories": 860,
        "protein": 35,
        "carbs": 71,
        "fat": 49,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:street-tacos",
        "name": "Street Tacos",
        "serving": "1 order",
        "calories": 630,
        "protein": 28,
        "carbs": 43,
        "fat": 39,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:mozzarella-sticks-with-marinara",
        "name": "Mozzarella Sticks with Marinara",
        "serving": "1 order",
        "calories": 520,
        "protein": 21,
        "carbs": 53,
        "fat": 25,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:fried-pickles-with-b-dubs-dip",
        "name": "Fried Pickles with B-Dubs Dip",
        "serving": "1 order",
        "calories": 710,
        "protein": 8,
        "carbs": 56,
        "fat": 51,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:ultimate-nachos",
        "name": "Ultimate Nachos",
        "serving": "1 order",
        "calories": 1760,
        "protein": 48,
        "carbs": 184,
        "fat": 95,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:chicken-caesar-salad-with-caesar-dressing",
        "name": "Chicken Caesar Salad with Caesar Dressing",
        "serving": "1 salad",
        "calories": 1020,
        "protein": 56,
        "carbs": 36,
        "fat": 73,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:french-fries-regular",
        "name": "French Fries (Regular)",
        "serving": "regular",
        "calories": 420,
        "protein": 4,
        "carbs": 78,
        "fat": 11,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      },
      {
        "id": "buffalo-wild-wings:new-york-style-cheesecake",
        "name": "New York Style Cheesecake",
        "serving": "1 slice",
        "calories": 670,
        "protein": 12,
        "carbs": 52,
        "fat": 46,
        "sourceUrl": "https://assets.ctfassets.net/6dxmiqksdkqb/4WACoRDzMah36duJPDyTJ9/a9e9b891dbd27a7042e0e7499080501e/26_BWW_2320050_IS_AW2_Nutrition_Guide.pdf"
      }
    ]
  },
  {
    "id": "burger-king",
    "name": "Burger King",
    "items": [
      {
        "id": "burger-king:whopper",
        "name": "Whopper",
        "serving": "1 sandwich",
        "calories": 670,
        "protein": 32,
        "carbs": 54,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/whopper/wo-cheese"
      },
      {
        "id": "burger-king:whopper-with-cheese",
        "name": "Whopper with Cheese",
        "serving": "1 sandwich",
        "calories": 770,
        "protein": 37,
        "carbs": 58,
        "fat": 51,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/whopper/w-cheese"
      },
      {
        "id": "burger-king:double-whopper",
        "name": "Double Whopper",
        "serving": "1 sandwich",
        "calories": 920,
        "protein": 53,
        "carbs": 54,
        "fat": 60,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/double-whopper/wo-cheese"
      },
      {
        "id": "burger-king:whopper-jr",
        "name": "Whopper Jr.",
        "serving": "1 sandwich",
        "calories": 330,
        "protein": 15,
        "carbs": 30,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/whopper-jr/wo-cheese"
      },
      {
        "id": "burger-king:original-chicken-sandwich",
        "name": "Original Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 892,
        "protein": 24,
        "carbs": 64,
        "fat": 52,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/original-chicken-sandwich"
      },
      {
        "id": "burger-king:cheeseburger",
        "name": "Cheeseburger",
        "serving": "1 sandwich",
        "calories": 290,
        "protein": 15,
        "carbs": 31,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/cheeseburger"
      },
      {
        "id": "burger-king:chicken-nuggets",
        "name": "Chicken Nuggets",
        "serving": "8 pieces",
        "calories": 390,
        "protein": 18,
        "carbs": 23,
        "fat": 25,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/chicken-nuggets/8-piece"
      },
      {
        "id": "burger-king:chicken-fries",
        "name": "Chicken Fries",
        "serving": "8 pieces",
        "calories": 220,
        "protein": 13,
        "carbs": 16,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/chicken-fries/8-piece"
      },
      {
        "id": "burger-king:french-fries-medium",
        "name": "French Fries (Medium)",
        "serving": "1 medium order",
        "calories": 370,
        "protein": 5,
        "carbs": 54,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/french-fries/medium"
      },
      {
        "id": "burger-king:onion-rings-medium",
        "name": "Onion Rings (Medium)",
        "serving": "1 medium order",
        "calories": 360,
        "protein": 4,
        "carbs": 48,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/burger-king/onion-rings/medium"
      }
    ]
  },
  {
    "id": "carls-jr",
    "name": "Carl's Jr.",
    "items": [
      {
        "id": "carls-jr:famous-star-with-cheese-single",
        "name": "Famous Star with Cheese (single)",
        "serving": "1 burger (285g)",
        "calories": 680,
        "protein": 28,
        "carbs": 57,
        "fat": 38,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:western-bacon-cheeseburger-single",
        "name": "Western Bacon Cheeseburger (single)",
        "serving": "1 burger (248g)",
        "calories": 770,
        "protein": 35,
        "carbs": 77,
        "fat": 36,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:the-big-carl-single",
        "name": "The Big Carl (single)",
        "serving": "1 burger (237g)",
        "calories": 670,
        "protein": 28,
        "carbs": 55,
        "fat": 38,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:double-cheeseburger",
        "name": "Double Cheeseburger",
        "serving": "1 burger (159g)",
        "calories": 370,
        "protein": 19,
        "carbs": 34,
        "fat": 21,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:hand-breaded-chicken-sandwich",
        "name": "Hand-Breaded Chicken Sandwich",
        "serving": "1 sandwich (255g)",
        "calories": 660,
        "protein": 31,
        "carbs": 50,
        "fat": 37,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:hand-breaded-chicken-tenders-5-pc",
        "name": "Hand-Breaded Chicken Tenders (5 pc)",
        "serving": "5 pieces (213g)",
        "calories": 440,
        "protein": 41,
        "carbs": 21,
        "fat": 21,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:spicy-chicken-sandwich",
        "name": "Spicy Chicken Sandwich",
        "serving": "1 sandwich (177g)",
        "calories": 490,
        "protein": 14,
        "carbs": 43,
        "fat": 29,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:the-breakfast-burger",
        "name": "The Breakfast Burger",
        "serving": "1 burger (279g)",
        "calories": 780,
        "protein": 40,
        "carbs": 67,
        "fat": 40,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:loaded-breakfast-burrito",
        "name": "Loaded Breakfast Burrito",
        "serving": "1 burrito (308g)",
        "calories": 830,
        "protein": 39,
        "carbs": 49,
        "fat": 53,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:natural-cut-fries-medium",
        "name": "Natural-Cut Fries (medium)",
        "serving": "1 medium order (137g)",
        "calories": 400,
        "protein": 4,
        "carbs": 51,
        "fat": 19,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:onion-rings",
        "name": "Onion Rings",
        "serving": "1 order (116g)",
        "calories": 560,
        "protein": 9,
        "carbs": 66,
        "fat": 30,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      },
      {
        "id": "carls-jr:chocolate-hand-scooped-ice-cream-shake",
        "name": "Chocolate Hand-Scooped Ice Cream Shake",
        "serving": "1 shake (397g)",
        "calories": 710,
        "protein": 13,
        "carbs": 86,
        "fat": 36,
        "sourceUrl": "https://www.carlsjr.com/getContentAsset/cccf694a-3d94-4cbc-adfc-28c255939f92/dfc3d011-8f63-43f6-9ed8-4b444333a1d0/nutritional-info.pdf?language=en-US"
      }
    ]
  },
  {
    "id": "chick-fil-a",
    "name": "Chick-fil-A",
    "items": [
      {
        "id": "chick-fil-a:chick-fil-a-chicken-sandwich",
        "name": "Chick-fil-A Chicken Sandwich",
        "serving": "1 sandwich (183g)",
        "calories": 440,
        "protein": 29,
        "carbs": 41,
        "fat": 17,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:spicy-chicken-sandwich",
        "name": "Spicy Chicken Sandwich",
        "serving": "1 sandwich (188g)",
        "calories": 460,
        "protein": 28,
        "carbs": 45,
        "fat": 19,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chick-fil-a-deluxe-sandwich",
        "name": "Chick-fil-A Deluxe Sandwich",
        "serving": "1 sandwich (247g)",
        "calories": 500,
        "protein": 32,
        "carbs": 44,
        "fat": 22,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:grilled-chicken-sandwich",
        "name": "Grilled Chicken Sandwich",
        "serving": "1 sandwich (206g)",
        "calories": 320,
        "protein": 28,
        "carbs": 41,
        "fat": 6,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chicken-nuggets-8-count",
        "name": "Chicken Nuggets (8 count)",
        "serving": "8 nuggets (113g)",
        "calories": 250,
        "protein": 27,
        "carbs": 11,
        "fat": 11,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chicken-nuggets-12-count",
        "name": "Chicken Nuggets (12 count)",
        "serving": "12 nuggets (170g)",
        "calories": 380,
        "protein": 40,
        "carbs": 16,
        "fat": 17,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chick-n-strips-3-count",
        "name": "Chick-n-Strips (3 count)",
        "serving": "3 strips (136g)",
        "calories": 310,
        "protein": 29,
        "carbs": 16,
        "fat": 14,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:waffle-potato-fries-medium",
        "name": "Waffle Potato Fries (Medium)",
        "serving": "1 medium order (125g)",
        "calories": 420,
        "protein": 5,
        "carbs": 45,
        "fat": 24,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:mac-cheese-medium",
        "name": "Mac & Cheese (Medium)",
        "serving": "1 medium (227g)",
        "calories": 450,
        "protein": 20,
        "carbs": 28,
        "fat": 29,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:cobb-salad-with-nuggets",
        "name": "Cobb Salad with Nuggets",
        "serving": "1 salad (413g)",
        "calories": 850,
        "protein": 42,
        "carbs": 34,
        "fat": 61,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chicken-biscuit",
        "name": "Chicken Biscuit",
        "serving": "1 biscuit (153g)",
        "calories": 460,
        "protein": 19,
        "carbs": 45,
        "fat": 23,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:hash-browns",
        "name": "Hash Browns",
        "serving": "1 order (77g)",
        "calories": 270,
        "protein": 3,
        "carbs": 23,
        "fat": 18,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:chocolate-chunk-cookie",
        "name": "Chocolate Chunk Cookie",
        "serving": "1 cookie (78g)",
        "calories": 370,
        "protein": 5,
        "carbs": 49,
        "fat": 17,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:icedream-cone",
        "name": "Icedream Cone",
        "serving": "1 cone (135g)",
        "calories": 180,
        "protein": 4,
        "carbs": 32,
        "fat": 4,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      },
      {
        "id": "chick-fil-a:lemonade-medium",
        "name": "Lemonade (Medium)",
        "serving": "1 medium (410g)",
        "calories": 220,
        "protein": 0,
        "carbs": 58,
        "fat": 0,
        "sourceUrl": "https://www.nutrition-charts.com/chick-fil-a-nutrition-information/"
      }
    ]
  },
  {
    "id": "chilis",
    "name": "Chili's",
    "items": [
      {
        "id": "chilis:original-chicken-crispers-original-tempura-as-served",
        "name": "Original Chicken Crispers (Original Tempura, as served)",
        "serving": "1 entree",
        "calories": 1350,
        "protein": 62,
        "carbs": 127,
        "fat": 67,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:crispy-honey-chipotle-chicken-crispers-as-served",
        "name": "Crispy Honey-Chipotle Chicken Crispers (as served)",
        "serving": "1 entree",
        "calories": 1800,
        "protein": 57,
        "carbs": 193,
        "fat": 90,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:cajun-pasta-with-grilled-chicken",
        "name": "Cajun Pasta with Grilled Chicken",
        "serving": "1 entree",
        "calories": 1180,
        "protein": 65,
        "carbs": 111,
        "fat": 53,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:just-bacon-beef-burger-no-fries",
        "name": "Just Bacon Beef Burger (no fries)",
        "serving": "1 burger",
        "calories": 1060,
        "protein": 56,
        "carbs": 48,
        "fat": 72,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:oldtimer-beef-burger-no-fries",
        "name": "Oldtimer Beef Burger (no fries)",
        "serving": "1 burger",
        "calories": 890,
        "protein": 51,
        "carbs": 47,
        "fat": 55,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:original-bbq-baby-back-ribs-full-rack-no-sides",
        "name": "Original BBQ Baby Back Ribs (Full Rack, no sides)",
        "serving": "1 full rack",
        "calories": 1430,
        "protein": 98,
        "carbs": 21,
        "fat": 106,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:grilled-chicken-fajitas-as-served",
        "name": "Grilled Chicken Fajitas (as served)",
        "serving": "1 entree",
        "calories": 1300,
        "protein": 65,
        "carbs": 131,
        "fat": 59,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:skillet-queso-with-chips",
        "name": "Skillet Queso (with chips)",
        "serving": "1 appetizer",
        "calories": 1590,
        "protein": 45,
        "carbs": 137,
        "fat": 97,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:chips-salsa",
        "name": "Chips & Salsa",
        "serving": "1 appetizer",
        "calories": 910,
        "protein": 13,
        "carbs": 113,
        "fat": 45,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:quesadilla-bacon-ranch-chicken",
        "name": "Quesadilla Bacon Ranch Chicken",
        "serving": "1 entree",
        "calories": 1700,
        "protein": 69,
        "carbs": 71,
        "fat": 129,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:quesadilla-explosion-salad",
        "name": "Quesadilla Explosion Salad",
        "serving": "1 entree salad",
        "calories": 1400,
        "protein": 61,
        "carbs": 81,
        "fat": 93,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      },
      {
        "id": "chilis:molten-chocolate-cake",
        "name": "Molten Chocolate Cake",
        "serving": "1 dessert",
        "calories": 1150,
        "protein": 11,
        "carbs": 142,
        "fat": 61,
        "sourceUrl": "https://brinker-chilis.cdn.prismic.io/brinker-chilis/0490d3e7-a1ca-4c83-b9df-8e4135497613_chilis-nutrition-menu-generic.pdf"
      }
    ]
  },
  {
    "id": "chipotle",
    "name": "Chipotle",
    "items": [
      {
        "id": "chipotle:chicken-burrito-bowl-chicken-white-rice-black-beans-fresh-tomato-salsa-cheese",
        "name": "Chicken Burrito Bowl (chicken, white rice, black beans, fresh tomato salsa, cheese)",
        "serving": "1 bowl (sum of published per-ingredient servings)",
        "calories": 600,
        "protein": 51,
        "carbs": 59,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/chicken-burrito-bowl"
      },
      {
        "id": "chipotle:steak-burrito-bowl-steak-white-rice-black-beans-fresh-tomato-salsa-cheese",
        "name": "Steak Burrito Bowl (steak, white rice, black beans, fresh tomato salsa, cheese)",
        "serving": "1 bowl (sum of published per-ingredient servings)",
        "calories": 600,
        "protein": 49,
        "carbs": 60,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/steak-burrito-bowl"
      },
      {
        "id": "chipotle:carnitas-burrito-bowl-carnitas-white-rice-black-beans-fresh-tomato-salsa-cheese",
        "name": "Carnitas Burrito Bowl (carnitas, white rice, black beans, fresh tomato salsa, cheese)",
        "serving": "1 bowl (sum of published per-ingredient servings)",
        "calories": 600,
        "protein": 46,
        "carbs": 59,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/carnitas-burrito-bowl"
      },
      {
        "id": "chipotle:barbacoa-burrito-bowl-barbacoa-white-rice-black-beans-fresh-tomato-salsa-cheese",
        "name": "Barbacoa Burrito Bowl (barbacoa, white rice, black beans, fresh tomato salsa, cheese)",
        "serving": "1 bowl (sum of published per-ingredient servings)",
        "calories": 580,
        "protein": 43,
        "carbs": 60,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/barbacoa-burrito-bowl"
      },
      {
        "id": "chipotle:sofritas-burrito-bowl-sofritas-white-rice-black-beans-fresh-tomato-salsa-cheese",
        "name": "Sofritas Burrito Bowl (sofritas, white rice, black beans, fresh tomato salsa, cheese)",
        "serving": "1 bowl (sum of published per-ingredient servings)",
        "calories": 555,
        "protein": 27,
        "carbs": 67,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/sofritas-burrito-bowl"
      },
      {
        "id": "chipotle:cheese-quesadilla",
        "name": "Cheese Quesadilla",
        "serving": "1 quesadilla",
        "calories": 650,
        "protein": 26,
        "carbs": 53,
        "fat": 33,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/cheese-quesadilla"
      },
      {
        "id": "chipotle:chips",
        "name": "Chips",
        "serving": "4 oz bag",
        "calories": 570,
        "protein": 8,
        "carbs": 73,
        "fat": 27,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/chips"
      },
      {
        "id": "chipotle:chips-guacamole",
        "name": "Chips & Guacamole",
        "serving": "7.5 oz",
        "calories": 720,
        "protein": 10,
        "carbs": 81,
        "fat": 40,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/chips-guacamole"
      },
      {
        "id": "chipotle:chips-queso",
        "name": "Chips & Queso",
        "serving": "8 oz",
        "calories": 770,
        "protein": 20,
        "carbs": 82,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/chips-queso"
      },
      {
        "id": "chipotle:side-of-guacamole",
        "name": "Side of Guacamole",
        "serving": "3.5 oz",
        "calories": 150,
        "protein": 2,
        "carbs": 8,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/chipotle/guacamole"
      }
    ]
  },
  {
    "id": "churchs-chicken",
    "name": "Church's Texas Chicken",
    "items": [
      {
        "id": "churchs-chicken:original-chicken-breast",
        "name": "Original Chicken Breast",
        "serving": "1 breast",
        "calories": 250,
        "protein": 23,
        "carbs": 9,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/original-chicken-breast"
      },
      {
        "id": "churchs-chicken:original-chicken-leg",
        "name": "Original Chicken Leg",
        "serving": "1 leg",
        "calories": 150,
        "protein": 12,
        "carbs": 6,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/original-chicken-leg"
      },
      {
        "id": "churchs-chicken:original-chicken-thigh",
        "name": "Original Chicken Thigh",
        "serving": "1 thigh",
        "calories": 360,
        "protein": 18,
        "carbs": 12,
        "fat": 27,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/original-chicken-thigh"
      },
      {
        "id": "churchs-chicken:original-chicken-wing",
        "name": "Original Chicken Wing",
        "serving": "1 wing",
        "calories": 290,
        "protein": 24,
        "carbs": 8,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/original-chicken-wing"
      },
      {
        "id": "churchs-chicken:spicy-chicken-breast",
        "name": "Spicy Chicken Breast",
        "serving": "1 breast",
        "calories": 280,
        "protein": 22,
        "carbs": 12,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/spicy-chicken-breast"
      },
      {
        "id": "churchs-chicken:texas-tender",
        "name": "Texas Tender",
        "serving": "1 tender",
        "calories": 110,
        "protein": 8,
        "carbs": 6,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/texas-tender"
      },
      {
        "id": "churchs-chicken:chicken-sandwich",
        "name": "Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 651,
        "protein": 32,
        "carbs": 53,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/chicken-sandwich/original"
      },
      {
        "id": "churchs-chicken:honey-butter-biscuit",
        "name": "Honey-Butter Biscuit",
        "serving": "1 biscuit",
        "calories": 230,
        "protein": 3,
        "carbs": 25,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/honey-butter-biscuit"
      },
      {
        "id": "churchs-chicken:mashed-potatoes-with-gravy",
        "name": "Mashed Potatoes with Gravy",
        "serving": "127g",
        "calories": 110,
        "protein": 2,
        "carbs": 24,
        "fat": 1,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/mashed-potatoes-gravy/regular"
      },
      {
        "id": "churchs-chicken:fried-okra",
        "name": "Fried Okra",
        "serving": "96g",
        "calories": 260,
        "protein": 3,
        "carbs": 30,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/fried-okra/regular"
      },
      {
        "id": "churchs-chicken:cole-slaw",
        "name": "Cole Slaw",
        "serving": "117g",
        "calories": 170,
        "protein": 1,
        "carbs": 16,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/cole-slaw/regular"
      },
      {
        "id": "churchs-chicken:jalapeno-cheese-bombers",
        "name": "Jalapeno Cheese Bombers",
        "serving": "4 bombers",
        "calories": 220,
        "protein": 6,
        "carbs": 24,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/jalapeno-cheese-bombers/4-piece"
      },
      {
        "id": "churchs-chicken:apple-pie",
        "name": "Apple Pie",
        "serving": "1 pie",
        "calories": 270,
        "protein": 3,
        "carbs": 37,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/churchs-chicken/apple-pie"
      }
    ]
  },
  {
    "id": "cracker-barrel",
    "name": "Cracker Barrel",
    "items": [
      {
        "id": "cracker-barrel:country-fried-steak-with-sawmill-gravy",
        "name": "Country Fried Steak with sawmill gravy",
        "serving": "1 entree (sides not included)",
        "calories": 600,
        "protein": 37,
        "carbs": 49,
        "fat": 28,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:meatloaf",
        "name": "Meatloaf",
        "serving": "1 entree (sides not included)",
        "calories": 450,
        "protein": 32,
        "carbs": 14,
        "fat": 29,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:chicken-n-dumplins",
        "name": "Chicken n' Dumplins",
        "serving": "1 entree (sides not included)",
        "calories": 360,
        "protein": 19,
        "carbs": 53,
        "fat": 8,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:pot-roast",
        "name": "Pot Roast",
        "serving": "1 entree (sides not included)",
        "calories": 520,
        "protein": 74,
        "carbs": 14,
        "fat": 19,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:chicken-fried-chicken-homestyle-chicken-breasts-with-sawmill-gravy",
        "name": "Chicken Fried Chicken (Homestyle Chicken Breasts with sawmill gravy)",
        "serving": "1 entree (sides not included)",
        "calories": 1140,
        "protein": 74,
        "carbs": 70,
        "fat": 60,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:hand-breaded-fried-chicken-tenders-6",
        "name": "Hand-breaded Fried Chicken Tenders (6)",
        "serving": "6 tenders",
        "calories": 600,
        "protein": 57,
        "carbs": 26,
        "fat": 30,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:grilled-chicken-tenders-6",
        "name": "Grilled Chicken Tenders (6)",
        "serving": "6 tenders",
        "calories": 320,
        "protein": 57,
        "carbs": 6,
        "fat": 8,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:mommas-pancake-breakfast-three-pancakes-with-butter-and-two-eggs",
        "name": "Momma's Pancake Breakfast (three pancakes with butter and two eggs)",
        "serving": "1 breakfast",
        "calories": 960,
        "protein": 22,
        "carbs": 89,
        "fat": 57,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:two-buttermilk-pancakes-with-whipped-butter",
        "name": "Two Buttermilk Pancakes with whipped butter",
        "serving": "2 pancakes",
        "calories": 600,
        "protein": 6,
        "carbs": 59,
        "fat": 38,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:biscuits-n-gravy",
        "name": "Biscuits n' Gravy",
        "serving": "1 order",
        "calories": 500,
        "protein": 13,
        "carbs": 53,
        "fat": 27,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:hashbrown-casserole",
        "name": "Hashbrown Casserole",
        "serving": "1 side",
        "calories": 140,
        "protein": 3,
        "carbs": 16,
        "fat": 8,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:loaded-hashbrown-casserole-tots",
        "name": "Loaded Hashbrown Casserole Tots",
        "serving": "1 order",
        "calories": 590,
        "protein": 17,
        "carbs": 48,
        "fat": 38,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:buttermilk-biscuit",
        "name": "Buttermilk Biscuit",
        "serving": "1 biscuit",
        "calories": 140,
        "protein": 3,
        "carbs": 20,
        "fat": 6,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      },
      {
        "id": "cracker-barrel:double-fudge-coca-cola-cake",
        "name": "Double Fudge Coca-Cola Cake",
        "serving": "1 slice",
        "calories": 650,
        "protein": 8,
        "carbs": 87,
        "fat": 32,
        "sourceUrl": "https://prod-cbdigitalstore.azurefd.net/-/media/Project/cb-brandsite/brandsite/pdfs/Nutrition-Guide.pdf?rev=13a87877b54a40e29c65b38fa002d38e"
      }
    ]
  },
  {
    "id": "culvers",
    "name": "Culver's",
    "items": [
      {
        "id": "culvers:butterburger-the-original-single",
        "name": "ButterBurger \"The Original\", Single",
        "serving": "1 burger",
        "calories": 390,
        "protein": 20,
        "carbs": 39,
        "fat": 19,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:butterburger-cheese-double",
        "name": "ButterBurger Cheese, Double",
        "serving": "1 burger",
        "calories": 700,
        "protein": 40,
        "carbs": 41,
        "fat": 44,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:the-culvers-deluxe-single",
        "name": "The Culver's Deluxe, Single",
        "serving": "1 burger",
        "calories": 570,
        "protein": 23,
        "carbs": 42,
        "fat": 36,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:the-culvers-bacon-deluxe-double",
        "name": "The Culver's Bacon Deluxe, Double",
        "serving": "1 burger",
        "calories": 850,
        "protein": 44,
        "carbs": 43,
        "fat": 58,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:chicken-tenders-4-piece",
        "name": "Chicken Tenders (4 piece)",
        "serving": "4 tenders",
        "calories": 540,
        "protein": 40,
        "carbs": 42,
        "fat": 24,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:north-atlantic-cod-filet-sandwich",
        "name": "North Atlantic Cod Filet Sandwich",
        "serving": "1 sandwich",
        "calories": 599,
        "protein": 27,
        "carbs": 48,
        "fat": 34,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:beef-pot-roast-sandwich",
        "name": "Beef Pot Roast Sandwich",
        "serving": "1 sandwich",
        "calories": 410,
        "protein": 31,
        "carbs": 41,
        "fat": 16,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:wisconsin-cheese-curds",
        "name": "Wisconsin Cheese Curds",
        "serving": "1 serving (150g)",
        "calories": 510,
        "protein": 20,
        "carbs": 51,
        "fat": 25,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:crinkle-cut-fries-regular",
        "name": "Crinkle Cut Fries, Regular",
        "serving": "1 regular order",
        "calories": 360,
        "protein": 6,
        "carbs": 53,
        "fat": 14,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:onion-rings",
        "name": "Onion Rings",
        "serving": "1 serving (118g)",
        "calories": 400,
        "protein": 6,
        "carbs": 44,
        "fat": 22,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:vanilla-fresh-frozen-custard-dish-2-scoop",
        "name": "Vanilla Fresh Frozen Custard, Dish (2 scoop)",
        "serving": "2 scoops",
        "calories": 590,
        "protein": 11,
        "carbs": 59,
        "fat": 35,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:chocolate-shake-short",
        "name": "Chocolate Shake, Short",
        "serving": "1 short shake",
        "calories": 620,
        "protein": 11,
        "carbs": 75,
        "fat": 32,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:turtle-sundae-2-scoop",
        "name": "Turtle Sundae (2 scoop)",
        "serving": "1 sundae",
        "calories": 1040,
        "protein": 16,
        "carbs": 112,
        "fat": 62,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      },
      {
        "id": "culvers:cookie-dough-concrete-mixer-short",
        "name": "Cookie Dough Concrete Mixer, Short",
        "serving": "1 short mixer",
        "calories": 770,
        "protein": 13,
        "carbs": 83,
        "fat": 43,
        "sourceUrl": "https://cdn.culvers.com/page-content/menu/nutrition-guide.pdf"
      }
    ]
  },
  {
    "id": "dairy-queen",
    "name": "Dairy Queen",
    "items": [
      {
        "id": "dairy-queen:oreo-cookies-blizzard-medium",
        "name": "Oreo Cookies Blizzard (Medium)",
        "serving": "1 medium",
        "calories": 790,
        "protein": 14,
        "carbs": 117,
        "fat": 31,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/oreo-cookies-blizzard/medium"
      },
      {
        "id": "dairy-queen:chocolate-chip-cookie-dough-blizzard-medium",
        "name": "Chocolate Chip Cookie Dough Blizzard (Medium)",
        "serving": "1 medium",
        "calories": 1030,
        "protein": 17,
        "carbs": 151,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/chocolate-chip-cookie-dough-blizzard/medium"
      },
      {
        "id": "dairy-queen:choco-brownie-extreme-blizzard-medium",
        "name": "Choco Brownie Extreme Blizzard (Medium)",
        "serving": "1 medium",
        "calories": 810,
        "protein": 16,
        "carbs": 111,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/choco-brownie-extreme-blizzard/medium"
      },
      {
        "id": "dairy-queen:vanilla-cone-medium",
        "name": "Vanilla Cone (Medium)",
        "serving": "1 medium cone",
        "calories": 320,
        "protein": 8,
        "carbs": 50,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/vanilla-cone/medium"
      },
      {
        "id": "dairy-queen:chocolate-dipped-cone-medium",
        "name": "Chocolate Dipped Cone (Medium)",
        "serving": "1 medium cone",
        "calories": 460,
        "protein": 9,
        "carbs": 58,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/chocolate-dipped-cone/medium"
      },
      {
        "id": "dairy-queen:hot-fudge-sundae-medium",
        "name": "Hot Fudge Sundae (Medium)",
        "serving": "1 medium sundae",
        "calories": 430,
        "protein": 9,
        "carbs": 66,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/hot-fudge-sundae/medium"
      },
      {
        "id": "dairy-queen:peanut-buster-parfait",
        "name": "Peanut Buster Parfait",
        "serving": "1 parfait",
        "calories": 710,
        "protein": 17,
        "carbs": 95,
        "fat": 31,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/peanut-buster-parfait"
      },
      {
        "id": "dairy-queen:banana-split",
        "name": "Banana Split",
        "serving": "1 banana split",
        "calories": 520,
        "protein": 9,
        "carbs": 94,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/banana-split"
      },
      {
        "id": "dairy-queen:dq-sandwich",
        "name": "DQ Sandwich",
        "serving": "1 sandwich",
        "calories": 180,
        "protein": 4,
        "carbs": 30,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/dq-sandwich"
      },
      {
        "id": "dairy-queen:chocolate-shake-medium",
        "name": "Chocolate Shake (Medium)",
        "serving": "1 medium shake",
        "calories": 710,
        "protein": 16,
        "carbs": 110,
        "fat": 23,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/chocolate-shake/medium"
      },
      {
        "id": "dairy-queen:bacon-two-cheese-deluxe-stackburger-double",
        "name": "Bacon Two Cheese Deluxe Stackburger (Double)",
        "serving": "1 burger",
        "calories": 720,
        "protein": 37,
        "carbs": 39,
        "fat": 47,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/bacon-two-cheese-deluxe-stackburger/double"
      },
      {
        "id": "dairy-queen:chicken-strip-basket-w-country-gravy-4-piece",
        "name": "Chicken Strip Basket w/ Country Gravy (4 Piece)",
        "serving": "1 basket (432g)",
        "calories": 1020,
        "protein": 35,
        "carbs": 111,
        "fat": 48,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/chicken-strip-basket-w-country-gravy/4-piece"
      },
      {
        "id": "dairy-queen:french-fries-regular",
        "name": "French Fries (Regular)",
        "serving": "1 regular order",
        "calories": 280,
        "protein": 5,
        "carbs": 36,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/french-fries/regular"
      },
      {
        "id": "dairy-queen:onion-rings-regular",
        "name": "Onion Rings (Regular)",
        "serving": "1 regular order (113g)",
        "calories": 360,
        "protein": 6,
        "carbs": 48,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/onion-rings/regular"
      },
      {
        "id": "dairy-queen:hot-dog",
        "name": "Hot Dog",
        "serving": "1 hot dog",
        "calories": 330,
        "protein": 12,
        "carbs": 25,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/dairy-queen/hot-dog"
      }
    ]
  },
  {
    "id": "del-taco",
    "name": "Del Taco",
    "items": [
      {
        "id": "del-taco:the-del-taco",
        "name": "The Del Taco",
        "serving": "1 taco",
        "calories": 310,
        "protein": 17,
        "carbs": 14,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/the-del-taco/crunchy"
      },
      {
        "id": "del-taco:epic-cali-bacon-burrito",
        "name": "Epic Cali Bacon Burrito",
        "serving": "1 burrito",
        "calories": 1030,
        "protein": 47,
        "carbs": 71,
        "fat": 60,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/epic-cali-bacon-burrito/chicken"
      },
      {
        "id": "del-taco:macho-combo-burrito",
        "name": "Macho Combo Burrito",
        "serving": "1 burrito",
        "calories": 950,
        "protein": 46,
        "carbs": 100,
        "fat": 37,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/macho-combo-burrito"
      },
      {
        "id": "del-taco:combo-burrito",
        "name": "Combo Burrito",
        "serving": "1 burrito",
        "calories": 470,
        "protein": 23,
        "carbs": 54,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/combo-burrito/beef"
      },
      {
        "id": "del-taco:del-beef-burrito",
        "name": "Del Beef Burrito",
        "serving": "1 burrito",
        "calories": 500,
        "protein": 27,
        "carbs": 40,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/beef-burrito"
      },
      {
        "id": "del-taco:grilled-chicken-taco",
        "name": "Grilled Chicken Taco",
        "serving": "1 taco",
        "calories": 210,
        "protein": 12,
        "carbs": 16,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/grilled-chicken-taco"
      },
      {
        "id": "del-taco:chicken-quesadilla",
        "name": "Chicken Quesadilla",
        "serving": "1 quesadilla",
        "calories": 550,
        "protein": 34,
        "carbs": 36,
        "fat": 31,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/chicken-quesadilla/spicy-jack"
      },
      {
        "id": "del-taco:8-layer-veggie-burrito",
        "name": "8 Layer Veggie Burrito",
        "serving": "1 burrito",
        "calories": 530,
        "protein": 18,
        "carbs": 72,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/8-layer-veggie-burrito"
      },
      {
        "id": "del-taco:crinkle-cut-fries-medium",
        "name": "Crinkle Cut Fries (Medium)",
        "serving": "170g",
        "calories": 320,
        "protein": 4,
        "carbs": 34,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/crinkle-cut-fries/medium"
      },
      {
        "id": "del-taco:carne-asada-fries",
        "name": "Carne Asada Fries",
        "serving": "1 basket of fries",
        "calories": 810,
        "protein": 24,
        "carbs": 46,
        "fat": 59,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/carne-asada-fries"
      },
      {
        "id": "del-taco:chocolate-shake",
        "name": "Chocolate Shake",
        "serving": "1 shake",
        "calories": 560,
        "protein": 15,
        "carbs": 105,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/del-taco/chocolate-shake/regular"
      }
    ]
  },
  {
    "id": "dennys",
    "name": "Denny's",
    "items": [
      {
        "id": "dennys:original-grand-slam-add-egg-choice",
        "name": "Original Grand Slam (add egg choice)",
        "serving": "11 oz",
        "calories": 740,
        "protein": 27,
        "carbs": 79,
        "fat": 34,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:all-american-slam-with-hash-browns-white-toast",
        "name": "All-American Slam with hash browns & white toast",
        "serving": "18 oz",
        "calories": 1200,
        "protein": 55,
        "carbs": 58,
        "fat": 81,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:lumberjack-slam-with-hash-browns-white-toast-add-egg-choice",
        "name": "Lumberjack Slam with hash browns & white toast (add egg choice)",
        "serving": "21 oz",
        "calories": 1260,
        "protein": 48,
        "carbs": 136,
        "fat": 57,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:moons-over-my-hammy-with-hash-browns",
        "name": "Moons Over My Hammy with hash browns",
        "serving": "17 oz",
        "calories": 960,
        "protein": 45,
        "carbs": 68,
        "fat": 55,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:grand-slamwich-with-hash-browns",
        "name": "Grand Slamwich with hash browns",
        "serving": "19 oz",
        "calories": 1300,
        "protein": 59,
        "carbs": 92,
        "fat": 77,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:country-fried-steak-eggs-with-gravy-hash-browns-white-toast",
        "name": "Country-Fried Steak & Eggs with gravy, hash browns & white toast",
        "serving": "14 oz",
        "calories": 810,
        "protein": 22,
        "carbs": 82,
        "fat": 43,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:t-bone-steak-eggs-with-hash-browns-white-toast-add-egg-choice",
        "name": "T-Bone Steak & Eggs with hash browns & white toast (add egg choice)",
        "serving": "18 oz",
        "calories": 910,
        "protein": 59,
        "carbs": 55,
        "fat": 49,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:bacon-avocado-cheeseburger-add-side-choice",
        "name": "Bacon Avocado Cheeseburger (add side choice)",
        "serving": "15 oz",
        "calories": 1050,
        "protein": 54,
        "carbs": 53,
        "fat": 70,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:super-bird-add-side-choice",
        "name": "Super Bird (add side choice)",
        "serving": "11 oz",
        "calories": 680,
        "protein": 47,
        "carbs": 47,
        "fat": 34,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:zesty-nachos",
        "name": "Zesty Nachos",
        "serving": "25 oz",
        "calories": 1660,
        "protein": 44,
        "carbs": 170,
        "fat": 106,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:mozzarella-cheese-sticks-8",
        "name": "Mozzarella Cheese Sticks (8)",
        "serving": "8 sticks",
        "calories": 690,
        "protein": 32,
        "carbs": 70,
        "fat": 32,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:santa-fe-sizzlin-skillet-add-egg-choice",
        "name": "Santa Fe Sizzlin' Skillet (add egg choice)",
        "serving": "12 oz",
        "calories": 770,
        "protein": 27,
        "carbs": 38,
        "fat": 58,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:buttermilk-pancakes-2",
        "name": "Buttermilk Pancakes (2)",
        "serving": "2 pancakes",
        "calories": 450,
        "protein": 10,
        "carbs": 77,
        "fat": 11,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      },
      {
        "id": "dennys:chocolate-milk-shake",
        "name": "Chocolate Milk Shake",
        "serving": "12 oz",
        "calories": 680,
        "protein": 12,
        "carbs": 89,
        "fat": 32,
        "sourceUrl": "https://www.dennys.com/sites/default/files/2025-12/391600_OCT25_MENU_Core%20Nutrition%20Guide_V4_R2R.pdf"
      }
    ]
  },
  {
    "id": "dominos",
    "name": "Domino's",
    "items": [
      {
        "id": "dominos:pepperoni-pizza-12-medium-hand-tossed-crust-garlic-oil-pizza-sauce-regular-cheese-pepperoni",
        "name": "Pepperoni Pizza, 12\" Medium Hand Tossed (crust, garlic oil, pizza sauce, regular cheese, pepperoni)",
        "serving": "2 slices (1/4 of pizza; sum of published per-slice components)",
        "calories": 420,
        "protein": 16,
        "carbs": 48,
        "fat": 17,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:cheese-pizza-12-medium-hand-tossed-crust-garlic-oil-pizza-sauce-regular-cheese",
        "name": "Cheese Pizza, 12\" Medium Hand Tossed (crust, garlic oil, pizza sauce, regular cheese)",
        "serving": "2 slices (1/4 of pizza; sum of published per-slice components)",
        "calories": 400,
        "protein": 16,
        "carbs": 48,
        "fat": 15,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:italian-sausage-pizza-12-medium-hand-tossed-crust-garlic-oil-pizza-sauce-regular-cheese-italian-sausage",
        "name": "Italian Sausage Pizza, 12\" Medium Hand Tossed (crust, garlic oil, pizza sauce, regular cheese, Italian sausage)",
        "serving": "2 slices (1/4 of pizza; sum of published per-slice components)",
        "calories": 460,
        "protein": 18,
        "carbs": 48,
        "fat": 21,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:stuffed-cheesy-bread",
        "name": "Stuffed Cheesy Bread",
        "serving": "1 piece",
        "calories": 150,
        "protein": 6,
        "carbs": 16,
        "fat": 7,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:parmesan-bread-bites",
        "name": "Parmesan Bread Bites",
        "serving": "4 pieces",
        "calories": 220,
        "protein": 5,
        "carbs": 27,
        "fat": 10,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:boneless-chicken",
        "name": "Boneless Chicken",
        "serving": "3 pieces",
        "calories": 170,
        "protein": 9,
        "carbs": 18,
        "fat": 7,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:hot-buffalo-wings",
        "name": "Hot Buffalo Wings",
        "serving": "4 pieces",
        "calories": 260,
        "protein": 15,
        "carbs": 9,
        "fat": 20,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:philly-cheese-steak-oven-baked-sandwich",
        "name": "Philly Cheese Steak Oven-Baked Sandwich",
        "serving": "1/2 sandwich",
        "calories": 380,
        "protein": 20,
        "carbs": 38,
        "fat": 15,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:chicken-bacon-ranch-oven-baked-sandwich",
        "name": "Chicken Bacon Ranch Oven-Baked Sandwich",
        "serving": "1/2 sandwich",
        "calories": 450,
        "protein": 23,
        "carbs": 37,
        "fat": 22,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:chocolate-lava-crunch-cake",
        "name": "Chocolate Lava Crunch Cake",
        "serving": "1 cake",
        "calories": 350,
        "protein": 4,
        "carbs": 47,
        "fat": 17,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:marbled-cookie-brownie",
        "name": "Marbled Cookie Brownie",
        "serving": "1 brownie",
        "calories": 200,
        "protein": 2,
        "carbs": 26,
        "fat": 10,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      },
      {
        "id": "dominos:cinnamon-bread-twists",
        "name": "Cinnamon Bread Twists",
        "serving": "2 pieces",
        "calories": 250,
        "protein": 5,
        "carbs": 31,
        "fat": 12,
        "sourceUrl": "https://cache.dominos.com/olo/6_118_2/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf"
      }
    ]
  },
  {
    "id": "dunkin",
    "name": "Dunkin'",
    "items": [
      {
        "id": "dunkin:glazed-donut",
        "name": "Glazed Donut",
        "serving": "1 donut",
        "calories": 240,
        "protein": 4,
        "carbs": 33,
        "fat": 11,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:boston-kreme-donut",
        "name": "Boston Kreme Donut",
        "serving": "1 donut",
        "calories": 270,
        "protein": 5,
        "carbs": 39,
        "fat": 11,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:chocolate-frosted-donut",
        "name": "Chocolate Frosted Donut",
        "serving": "1 donut",
        "calories": 260,
        "protein": 4,
        "carbs": 34,
        "fat": 11,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:old-fashioned-donut",
        "name": "Old Fashioned Donut",
        "serving": "1 donut",
        "calories": 310,
        "protein": 4,
        "carbs": 30,
        "fat": 19,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:jelly-donut",
        "name": "Jelly Donut",
        "serving": "1 donut",
        "calories": 250,
        "protein": 4,
        "carbs": 36,
        "fat": 10,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:french-cruller",
        "name": "French Cruller",
        "serving": "1 donut",
        "calories": 230,
        "protein": 3,
        "carbs": 21,
        "fat": 14,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:coffee-roll",
        "name": "Coffee Roll",
        "serving": "1 coffee roll",
        "calories": 390,
        "protein": 7,
        "carbs": 48,
        "fat": 19,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:bacon-egg-and-cheese-on-croissant",
        "name": "Bacon, Egg and Cheese on Croissant",
        "serving": "1 sandwich",
        "calories": 520,
        "protein": 19,
        "carbs": 34,
        "fat": 34,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:sausage-egg-and-cheese-on-english-muffin",
        "name": "Sausage, Egg and Cheese on English Muffin",
        "serving": "1 sandwich",
        "calories": 560,
        "protein": 21,
        "carbs": 40,
        "fat": 35,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:egg-and-cheese-on-english-muffin",
        "name": "Egg and Cheese on English Muffin",
        "serving": "1 sandwich",
        "calories": 340,
        "protein": 14,
        "carbs": 38,
        "fat": 15,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:hash-browns",
        "name": "Hash Browns",
        "serving": "6 pieces",
        "calories": 110,
        "protein": 1,
        "carbs": 13,
        "fat": 6,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:plain-bagel",
        "name": "Plain Bagel",
        "serving": "1 bagel",
        "calories": 300,
        "protein": 11,
        "carbs": 64,
        "fat": 1,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      },
      {
        "id": "dunkin:everything-bagel",
        "name": "Everything Bagel",
        "serving": "1 bagel",
        "calories": 340,
        "protein": 12,
        "carbs": 67,
        "fat": 3,
        "sourceUrl": "https://www.dunkindonuts.com/content/dam/dd/pdf/nutrition.pdf"
      }
    ]
  },
  {
    "id": "el-pollo-loco",
    "name": "El Pollo Loco",
    "items": [
      {
        "id": "el-pollo-loco:fire-grilled-chicken-breast",
        "name": "Fire-Grilled Chicken Breast",
        "serving": "1 piece (4.3 oz)",
        "calories": 200,
        "protein": 34,
        "carbs": 0,
        "fat": 8,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:fire-grilled-chicken-thigh",
        "name": "Fire-Grilled Chicken Thigh",
        "serving": "1 piece (3.1 oz)",
        "calories": 200,
        "protein": 21,
        "carbs": 2,
        "fat": 12,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:fire-grilled-chicken-leg",
        "name": "Fire-Grilled Chicken Leg",
        "serving": "1 piece (1.6 oz)",
        "calories": 110,
        "protein": 11,
        "carbs": 0,
        "fat": 7,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:original-pollo-bowl",
        "name": "Original Pollo Bowl",
        "serving": "1 bowl (18.1 oz)",
        "calories": 580,
        "protein": 40,
        "carbs": 83,
        "fat": 10,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:double-chicken-bowl",
        "name": "Double Chicken Bowl",
        "serving": "1 bowl (24.1 oz)",
        "calories": 930,
        "protein": 74,
        "carbs": 87,
        "fat": 33,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:classic-chicken-burrito",
        "name": "Classic Chicken Burrito",
        "serving": "1 burrito (9.9 oz)",
        "calories": 450,
        "protein": 23,
        "carbs": 57,
        "fat": 15,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:chicken-avocado-burrito",
        "name": "Chicken Avocado Burrito",
        "serving": "1 burrito (17.4 oz)",
        "calories": 920,
        "protein": 60,
        "carbs": 69,
        "fat": 46,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:chicken-tortilla-soup-small",
        "name": "Chicken Tortilla Soup (small)",
        "serving": "1 small (13.7 oz)",
        "calories": 240,
        "protein": 23,
        "carbs": 19,
        "fat": 9,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:double-chicken-avocado-salad-no-dressing",
        "name": "Double Chicken Avocado Salad (no dressing)",
        "serving": "1 salad (13.3 oz)",
        "calories": 350,
        "protein": 51,
        "carbs": 12,
        "fat": 12,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:pinto-beans-small",
        "name": "Pinto Beans (small)",
        "serving": "1 small side (6 oz)",
        "calories": 140,
        "protein": 9,
        "carbs": 25,
        "fat": 0.5,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:rice-small",
        "name": "Rice (small)",
        "serving": "1 small side (4.5 oz)",
        "calories": 160,
        "protein": 3,
        "carbs": 33,
        "fat": 1.5,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:macaroni-cheese-small",
        "name": "Macaroni & Cheese (small)",
        "serving": "1 small side (6 oz)",
        "calories": 310,
        "protein": 9,
        "carbs": 24,
        "fat": 19,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:churro",
        "name": "Churro",
        "serving": "1 churro (1.3 oz)",
        "calories": 150,
        "protein": 1,
        "carbs": 15,
        "fat": 9,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      },
      {
        "id": "el-pollo-loco:horchata-regular",
        "name": "Horchata (regular)",
        "serving": "1 regular (22 oz)",
        "calories": 170,
        "protein": 0,
        "carbs": 28,
        "fat": 6,
        "sourceUrl": "https://www.elpolloloco.com/content/pdfs/epl_web_nutrition_guide_mod_1_2023_hr.pdf"
      }
    ]
  },
  {
    "id": "firehouse-subs",
    "name": "Firehouse Subs",
    "items": [
      {
        "id": "firehouse-subs:hook-ladder-sub-medium",
        "name": "Hook & Ladder Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 718,
        "protein": 36,
        "carbs": 63,
        "fat": 36.2,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/hook-ladder-sub/medium"
      },
      {
        "id": "firehouse-subs:italian-sub-medium",
        "name": "Italian Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 939,
        "protein": 39,
        "carbs": 65,
        "fat": 57.9,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/italian-sub/medium"
      },
      {
        "id": "firehouse-subs:turkey-bacon-ranch-sub-medium",
        "name": "Turkey Bacon Ranch Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 831,
        "protein": 40,
        "carbs": 61,
        "fat": 48.3,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/turkey-bacon-ranch-sub/medium"
      },
      {
        "id": "firehouse-subs:meatball-sub-medium",
        "name": "Meatball Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 834,
        "protein": 37,
        "carbs": 59,
        "fat": 50.7,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/meatball-sub/medium"
      },
      {
        "id": "firehouse-subs:engineer-sub-medium",
        "name": "Engineer Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 687,
        "protein": 38,
        "carbs": 60,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/engineer-sub/medium"
      },
      {
        "id": "firehouse-subs:club-on-a-sub-medium",
        "name": "Club on a Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 768,
        "protein": 40,
        "carbs": 63,
        "fat": 40.1,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/club-on-a-sub/medium"
      },
      {
        "id": "firehouse-subs:new-york-steamer-sub-medium",
        "name": "New York Steamer Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 725,
        "protein": 40,
        "carbs": 48,
        "fat": 40.5,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/new-york-steamer-sub/medium"
      },
      {
        "id": "firehouse-subs:smokehouse-beef-cheddar-brisket-sub-medium",
        "name": "Smokehouse Beef & Cheddar Brisket Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 890,
        "protein": 31,
        "carbs": 59,
        "fat": 59.2,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/smokehouse-beef-cheddar-brisket-sub/medium"
      },
      {
        "id": "firehouse-subs:steak-cheese-sub-medium",
        "name": "Steak & Cheese Sub (Medium)",
        "serving": "1 medium sub",
        "calories": 831,
        "protein": 38,
        "carbs": 53,
        "fat": 50.6,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/steak-cheese-sub/medium"
      },
      {
        "id": "firehouse-subs:firehouse-chopped-salad-with-grilled-chicken",
        "name": "Firehouse Chopped Salad with Grilled Chicken",
        "serving": "1 salad",
        "calories": 375,
        "protein": 57,
        "carbs": 14,
        "fat": 10.1,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/firehouse-chopped-salad-with-grilled-chicken"
      },
      {
        "id": "firehouse-subs:5-cheese-mac-cheese",
        "name": "5-Cheese Mac & Cheese",
        "serving": "1 serving",
        "calories": 380,
        "protein": 17,
        "carbs": 33,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/5-cheese-mac-cheese"
      },
      {
        "id": "firehouse-subs:loaded-potato-soup",
        "name": "Loaded Potato Soup",
        "serving": "1 cup",
        "calories": 240,
        "protein": 5,
        "carbs": 15,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/loaded-potato-soup/cup"
      },
      {
        "id": "firehouse-subs:chocolate-chip-cookie",
        "name": "Chocolate Chip Cookie",
        "serving": "1 cookie",
        "calories": 310,
        "protein": 4,
        "carbs": 44,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/firehouse-subs/chocolate-chip-cookie"
      }
    ]
  },
  {
    "id": "five-guys",
    "name": "Five Guys",
    "items": [
      {
        "id": "five-guys:hamburger",
        "name": "Hamburger",
        "serving": "1 burger (2 patties)",
        "calories": 700,
        "protein": 39,
        "carbs": 39,
        "fat": 43,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/hamburger"
      },
      {
        "id": "five-guys:cheeseburger",
        "name": "Cheeseburger",
        "serving": "1 burger (2 patties)",
        "calories": 840,
        "protein": 47,
        "carbs": 40,
        "fat": 55,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/cheeseburger"
      },
      {
        "id": "five-guys:bacon-cheeseburger",
        "name": "Bacon Cheeseburger",
        "serving": "1 burger (2 patties)",
        "calories": 920,
        "protein": 51,
        "carbs": 40,
        "fat": 62,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/bacon-cheeseburger"
      },
      {
        "id": "five-guys:little-hamburger",
        "name": "Little Hamburger",
        "serving": "1 burger (1 patty)",
        "calories": 480,
        "protein": 23,
        "carbs": 39,
        "fat": 26,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/little-hamburger"
      },
      {
        "id": "five-guys:little-cheeseburger",
        "name": "Little Cheeseburger",
        "serving": "1 burger (1 patty)",
        "calories": 550,
        "protein": 27,
        "carbs": 40,
        "fat": 32,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/little-cheeseburger"
      },
      {
        "id": "five-guys:hot-dog",
        "name": "Hot Dog",
        "serving": "1 hot dog",
        "calories": 545,
        "protein": 18,
        "carbs": 40,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/hot-dog"
      },
      {
        "id": "five-guys:bacon-cheese-dog",
        "name": "Bacon Cheese Dog",
        "serving": "1 hot dog",
        "calories": 695,
        "protein": 26,
        "carbs": 41,
        "fat": 48,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/bacon-cheese-dog"
      },
      {
        "id": "five-guys:grilled-cheese",
        "name": "Grilled Cheese",
        "serving": "1 sandwich",
        "calories": 470,
        "protein": 11,
        "carbs": 41,
        "fat": 26,
        "sourceUrl": "https://fastfoodnutrition.org/five-guys/grilled-cheese"
      },
      {
        "id": "five-guys:little-fries-five-guys-style",
        "name": "Little Fries (Five Guys Style)",
        "serving": "1 little order (227g)",
        "calories": 526,
        "protein": 8,
        "carbs": 72,
        "fat": 23,
        "sourceUrl": "https://www.fiveguys.com/wp-content/uploads/2025/07/five-guys-us-nutrition-allergen-guide-english-1-final.pdf"
      },
      {
        "id": "five-guys:regular-fries-five-guys-style",
        "name": "Regular Fries (Five Guys Style)",
        "serving": "1 regular order (411g)",
        "calories": 953,
        "protein": 15,
        "carbs": 131,
        "fat": 41,
        "sourceUrl": "https://www.fiveguys.com/wp-content/uploads/2025/07/five-guys-us-nutrition-allergen-guide-english-1-final.pdf"
      },
      {
        "id": "five-guys:large-fries-five-guys-style",
        "name": "Large Fries (Five Guys Style)",
        "serving": "1 large order (567g)",
        "calories": 1314,
        "protein": 20,
        "carbs": 181,
        "fat": 57,
        "sourceUrl": "https://www.fiveguys.com/wp-content/uploads/2025/07/five-guys-us-nutrition-allergen-guide-english-1-final.pdf"
      },
      {
        "id": "five-guys:vanilla-milkshake-base-no-mix-ins",
        "name": "Vanilla Milkshake (base, no mix-ins)",
        "serving": "1 shake (396g)",
        "calories": 670,
        "protein": 13,
        "carbs": 84,
        "fat": 32,
        "sourceUrl": "https://www.fiveguys.com/wp-content/uploads/2025/07/five-guys-us-nutrition-allergen-guide-english-1-final.pdf"
      }
    ]
  },
  {
    "id": "hardees",
    "name": "Hardee's",
    "items": [
      {
        "id": "hardees:original-thickburger-single",
        "name": "Original Thickburger (single)",
        "serving": "1 burger",
        "calories": 820,
        "protein": 39,
        "carbs": 56,
        "fat": 51,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/original-thickburger/single"
      },
      {
        "id": "hardees:frisco-thickburger-single",
        "name": "Frisco Thickburger (single)",
        "serving": "1 burger",
        "calories": 760,
        "protein": 38,
        "carbs": 43,
        "fat": 50,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/frisco-thickburger/single"
      },
      {
        "id": "hardees:western-bacon-cheeseburger-single",
        "name": "Western Bacon Cheeseburger (single)",
        "serving": "1 burger",
        "calories": 810,
        "protein": 38,
        "carbs": 80,
        "fat": 38,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/western-bacon-cheeseburger/single"
      },
      {
        "id": "hardees:hand-breaded-chicken-tenders-5-pc",
        "name": "Hand-Breaded Chicken Tenders (5 pc)",
        "serving": "5 tenders",
        "calories": 440,
        "protein": 41,
        "carbs": 21,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/hand-breaded-chicken-tenders/5-piece"
      },
      {
        "id": "hardees:big-chicken-fillet-sandwich",
        "name": "Big Chicken Fillet Sandwich",
        "serving": "1 sandwich",
        "calories": 590,
        "protein": 21,
        "carbs": 61,
        "fat": 29,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/big-chicken-fillet-sandwich"
      },
      {
        "id": "hardees:bacon-egg-cheese-biscuit",
        "name": "Bacon, Egg & Cheese Biscuit",
        "serving": "1 biscuit",
        "calories": 620,
        "protein": 20,
        "carbs": 44,
        "fat": 40,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/bacon-egg-cheese-biscuit"
      },
      {
        "id": "hardees:sausage-egg-biscuit",
        "name": "Sausage & Egg Biscuit",
        "serving": "1 biscuit",
        "calories": 700,
        "protein": 19,
        "carbs": 44,
        "fat": 50,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/sausage-egg-biscuit"
      },
      {
        "id": "hardees:monster-biscuit",
        "name": "Monster Biscuit",
        "serving": "1 biscuit",
        "calories": 890,
        "protein": 35,
        "carbs": 45,
        "fat": 63,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/monster-biscuit"
      },
      {
        "id": "hardees:natural-cut-french-fries-medium",
        "name": "Natural-Cut French Fries (medium)",
        "serving": "1 medium order (147g)",
        "calories": 420,
        "protein": 5,
        "carbs": 55,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/natural-cut-french-fries/medium"
      },
      {
        "id": "hardees:chocolate-hand-scooped-ice-cream-shake",
        "name": "Chocolate Hand-Scooped Ice Cream Shake",
        "serving": "1 shake",
        "calories": 690,
        "protein": 12,
        "carbs": 84,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/hardees/hand-scooped-ice-cream-shake/chocolate"
      }
    ]
  },
  {
    "id": "ihop",
    "name": "IHOP",
    "items": [
      {
        "id": "ihop:original-buttermilk-pancakes-5",
        "name": "Original Buttermilk Pancakes (5)",
        "serving": "5 pancakes",
        "calories": 741,
        "protein": 21,
        "carbs": 98,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/original-buttermilk-pancakes/5"
      },
      {
        "id": "ihop:breakfast-sampler",
        "name": "Breakfast Sampler",
        "serving": "1 order",
        "calories": 881,
        "protein": 32,
        "carbs": 62,
        "fat": 56,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/breakfast-sampler"
      },
      {
        "id": "ihop:big-steak-omelette",
        "name": "Big Steak Omelette",
        "serving": "1 omelette",
        "calories": 1041,
        "protein": 66,
        "carbs": 40,
        "fat": 69,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/big-steak-omelette"
      },
      {
        "id": "ihop:colorado-omelette",
        "name": "Colorado Omelette",
        "serving": "1 omelette",
        "calories": 1251,
        "protein": 77,
        "carbs": 19,
        "fat": 96,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/colorado-omelette"
      },
      {
        "id": "ihop:bacon-temptation-omelette",
        "name": "Bacon Temptation Omelette",
        "serving": "1 omelette",
        "calories": 1111,
        "protein": 74,
        "carbs": 16,
        "fat": 83,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/bacon-temptation-omelette"
      },
      {
        "id": "ihop:chicken-waffles",
        "name": "Chicken & Waffles",
        "serving": "1 order",
        "calories": 1051,
        "protein": 45,
        "carbs": 101,
        "fat": 52,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/chicken-waffles"
      },
      {
        "id": "ihop:belgian-waffle-with-whipped-butter",
        "name": "Belgian Waffle with Whipped Butter",
        "serving": "1 waffle",
        "calories": 591,
        "protein": 11,
        "carbs": 69,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/belgian-waffle-with-whipped-butter"
      },
      {
        "id": "ihop:original-french-toast-with-whipped-butter",
        "name": "Original French Toast with Whipped Butter",
        "serving": "1 order",
        "calories": 741,
        "protein": 20,
        "carbs": 84,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/original-french-toast-with-whipped-butter"
      },
      {
        "id": "ihop:split-decision-breakfast-combo",
        "name": "Split Decision Breakfast Combo",
        "serving": "1 order",
        "calories": 911,
        "protein": 27,
        "carbs": 69,
        "fat": 59,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/split-decision-breakfast-combo-"
      },
      {
        "id": "ihop:classic-steakburger",
        "name": "Classic Steakburger",
        "serving": "1 burger",
        "calories": 671,
        "protein": 32,
        "carbs": 42,
        "fat": 42,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/classic-steakburger"
      },
      {
        "id": "ihop:new-york-cheesecake-pancakes-4",
        "name": "New York Cheesecake Pancakes (4)",
        "serving": "4 pancakes",
        "calories": 931,
        "protein": 23,
        "carbs": 130,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/new-york-cheesecake-pancakes/4"
      },
      {
        "id": "ihop:hash-browns",
        "name": "Hash Browns",
        "serving": "1 side order",
        "calories": 210,
        "protein": 2,
        "carbs": 19,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/ihop/hash-browns"
      }
    ]
  },
  {
    "id": "in-n-out",
    "name": "In-N-Out Burger",
    "items": [
      {
        "id": "in-n-out:double-double-with-spread",
        "name": "Double-Double with Spread",
        "serving": "1 burger (287g)",
        "calories": 610,
        "protein": 34,
        "carbs": 42,
        "fat": 34,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:double-double-protein-style",
        "name": "Double-Double Protein Style",
        "serving": "1 burger (289g)",
        "calories": 460,
        "protein": 30,
        "carbs": 12,
        "fat": 32,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:cheeseburger-with-spread",
        "name": "Cheeseburger with Spread",
        "serving": "1 burger (229g)",
        "calories": 430,
        "protein": 20,
        "carbs": 40,
        "fat": 21,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:cheeseburger-with-mustard-ketchup",
        "name": "Cheeseburger with Mustard & Ketchup",
        "serving": "1 burger (222g)",
        "calories": 380,
        "protein": 20,
        "carbs": 39,
        "fat": 15,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:hamburger-with-spread",
        "name": "Hamburger with Spread",
        "serving": "1 burger (209g)",
        "calories": 360,
        "protein": 16,
        "carbs": 38,
        "fat": 16,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:hamburger-protein-style",
        "name": "Hamburger Protein Style",
        "serving": "1 burger (211g)",
        "calories": 210,
        "protein": 12,
        "carbs": 9,
        "fat": 14,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:french-fries",
        "name": "French Fries",
        "serving": "1 order (125g)",
        "calories": 360,
        "protein": 6,
        "carbs": 49,
        "fat": 15,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:chocolate-shake",
        "name": "Chocolate Shake",
        "serving": "15 fl oz",
        "calories": 610,
        "protein": 16,
        "carbs": 74,
        "fat": 30,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:vanilla-shake",
        "name": "Vanilla Shake",
        "serving": "15 fl oz",
        "calories": 590,
        "protein": 16,
        "carbs": 66,
        "fat": 31,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      },
      {
        "id": "in-n-out:strawberry-shake",
        "name": "Strawberry Shake",
        "serving": "15 fl oz",
        "calories": 610,
        "protein": 15,
        "carbs": 74,
        "fat": 30,
        "sourceUrl": "https://www.in-n-out.com/menu/nutrition-info"
      }
    ]
  },
  {
    "id": "jack-in-the-box",
    "name": "Jack in the Box",
    "items": [
      {
        "id": "jack-in-the-box:jumbo-jack-with-cheese",
        "name": "Jumbo Jack with Cheese",
        "serving": "1 burger (241g)",
        "calories": 570,
        "protein": 30,
        "carbs": 45,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/jumbo-jack/w-cheese"
      },
      {
        "id": "jack-in-the-box:bacon-ultimate-cheeseburger",
        "name": "Bacon Ultimate Cheeseburger",
        "serving": "1 burger (284g)",
        "calories": 910,
        "protein": 57,
        "carbs": 44,
        "fat": 56,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/bacon-ultimate-cheeseburger"
      },
      {
        "id": "jack-in-the-box:double-jack",
        "name": "Double Jack",
        "serving": "1 burger (319g)",
        "calories": 830,
        "protein": 46,
        "carbs": 34,
        "fat": 58,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/double-jack"
      },
      {
        "id": "jack-in-the-box:sourdough-jack",
        "name": "Sourdough Jack",
        "serving": "1 burger (223g)",
        "calories": 660,
        "protein": 35,
        "carbs": 40,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/sourdough-jack"
      },
      {
        "id": "jack-in-the-box:jacks-spicy-chicken",
        "name": "Jack's Spicy Chicken",
        "serving": "1 sandwich (242g)",
        "calories": 530,
        "protein": 28,
        "carbs": 61,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/jacks-spicy-chicken/no-cheese"
      },
      {
        "id": "jack-in-the-box:beef-taco",
        "name": "Beef Taco",
        "serving": "1 taco (84g)",
        "calories": 190,
        "protein": 6,
        "carbs": 17,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/beef-taco-1-taco"
      },
      {
        "id": "jack-in-the-box:jumbo-egg-rolls-3-piece",
        "name": "Jumbo Egg Rolls (3 Piece)",
        "serving": "3 egg rolls",
        "calories": 570,
        "protein": 21,
        "carbs": 60,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/jumbo-egg-rolls/3-piece"
      },
      {
        "id": "jack-in-the-box:seasoned-curly-fries-medium",
        "name": "Seasoned Curly Fries (Medium)",
        "serving": "1 medium order (130g)",
        "calories": 430,
        "protein": 5,
        "carbs": 46,
        "fat": 25,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/seasoned-curly-fries/medium"
      },
      {
        "id": "jack-in-the-box:chicken-nuggets-10-piece",
        "name": "Chicken Nuggets (10 Piece)",
        "serving": "10 nuggets (153g)",
        "calories": 480,
        "protein": 19,
        "carbs": 26,
        "fat": 33,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/chicken-nuggets/10-piece"
      },
      {
        "id": "jack-in-the-box:breakfast-jack",
        "name": "Breakfast Jack",
        "serving": "1 sandwich (125g)",
        "calories": 280,
        "protein": 16,
        "carbs": 30,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/breakfast-jack"
      },
      {
        "id": "jack-in-the-box:supreme-croissant",
        "name": "Supreme Croissant",
        "serving": "1 sandwich (148g)",
        "calories": 450,
        "protein": 19,
        "carbs": 32,
        "fat": 27,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/supreme-croissant"
      },
      {
        "id": "jack-in-the-box:oreo-cookie-shake-w-whipped-topping-small",
        "name": "Oreo Cookie Shake w/ Whipped Topping (Small)",
        "serving": "1 small shake (362g)",
        "calories": 810,
        "protein": 13,
        "carbs": 92,
        "fat": 43,
        "sourceUrl": "https://fastfoodnutrition.org/jack-in-the-box/oreo-cookie-shake-w-whipped-topping/small"
      }
    ]
  },
  {
    "id": "jersey-mikes",
    "name": "Jersey Mike's",
    "items": [
      {
        "id": "jersey-mikes:13-the-original-italian-regular-mikes-way",
        "name": "#13 The Original Italian (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 956,
        "protein": 47,
        "carbs": 71,
        "fat": 55,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:7-turkey-and-provolone-regular-mikes-way",
        "name": "#7 Turkey and Provolone (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 817,
        "protein": 45,
        "carbs": 66,
        "fat": 41,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:8-club-sub-regular-mikes-way",
        "name": "#8 Club Sub (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 1163,
        "protein": 50,
        "carbs": 68,
        "fat": 78,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:9-club-supreme-regular-mikes-way",
        "name": "#9 Club Supreme (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 1191,
        "protein": 59,
        "carbs": 67,
        "fat": 77,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:2-jersey-shores-favorite-regular-mikes-way",
        "name": "#2 Jersey Shore's Favorite (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 824,
        "protein": 39,
        "carbs": 69,
        "fat": 44,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:6-roast-beef-and-provolone-regular-mikes-way",
        "name": "#6 Roast Beef and Provolone (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 913,
        "protein": 57,
        "carbs": 66,
        "fat": 46,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:10-tuna-fish-regular-mikes-way",
        "name": "#10 Tuna Fish (Regular, Mike's Way)",
        "serving": "1 regular sub",
        "calories": 1062,
        "protein": 33,
        "carbs": 67,
        "fat": 75,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:17-mikes-famous-philly-regular",
        "name": "#17 Mike's Famous Philly (Regular)",
        "serving": "1 regular sub",
        "calories": 748,
        "protein": 46,
        "carbs": 74,
        "fat": 30,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:16-mikes-chicken-philly-regular",
        "name": "#16 Mike's Chicken Philly (Regular)",
        "serving": "1 regular sub",
        "calories": 684,
        "protein": 48,
        "carbs": 73,
        "fat": 22,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:56-big-kahuna-cheese-steak-regular",
        "name": "#56 Big Kahuna Cheese Steak (Regular)",
        "serving": "1 regular sub",
        "calories": 803,
        "protein": 49,
        "carbs": 76,
        "fat": 35,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:44-buffalo-chicken-cheese-steak-regular",
        "name": "#44 Buffalo Chicken Cheese Steak (Regular)",
        "serving": "1 regular sub",
        "calories": 894,
        "protein": 50,
        "carbs": 73,
        "fat": 44,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:chocolate-chip-cookie",
        "name": "Chocolate Chip Cookie",
        "serving": "1 cookie",
        "calories": 280,
        "protein": 3,
        "carbs": 37,
        "fat": 14,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      },
      {
        "id": "jersey-mikes:brownie",
        "name": "Brownie",
        "serving": "1 brownie",
        "calories": 500,
        "protein": 5,
        "carbs": 62,
        "fat": 28,
        "sourceUrl": "https://subs.jerseymikes.com/nutrition"
      }
    ]
  },
  {
    "id": "jimmy-johns",
    "name": "Jimmy John's",
    "items": [
      {
        "id": "jimmy-johns:1-the-pepe-8-inch-french",
        "name": "#1 The Pepe (8-inch French)",
        "serving": "1 sandwich",
        "calories": 650,
        "protein": 31,
        "carbs": 60,
        "fat": 30,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:2-big-john-8-inch-french",
        "name": "#2 Big John (8-inch French)",
        "serving": "1 sandwich",
        "calories": 550,
        "protein": 28,
        "carbs": 57,
        "fat": 22,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:3-totally-tuna-8-inch-french",
        "name": "#3 Totally Tuna (8-inch French)",
        "serving": "1 sandwich",
        "calories": 550,
        "protein": 23,
        "carbs": 61,
        "fat": 22,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:4-turkey-tom-8-inch-french",
        "name": "#4 Turkey Tom (8-inch French)",
        "serving": "1 sandwich",
        "calories": 530,
        "protein": 25,
        "carbs": 58,
        "fat": 19,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:5-vito-8-inch-french",
        "name": "#5 Vito (8-inch French)",
        "serving": "1 sandwich",
        "calories": 630,
        "protein": 34,
        "carbs": 61,
        "fat": 27,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:jjblt-8-inch-french",
        "name": "J.J.B.L.T. (8-inch French)",
        "serving": "1 sandwich",
        "calories": 590,
        "protein": 21,
        "carbs": 57,
        "fat": 28,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:8-billy-club-8-inch-french",
        "name": "#8 Billy Club (8-inch French)",
        "serving": "1 sandwich",
        "calories": 850,
        "protein": 52,
        "carbs": 80,
        "fat": 33,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:9-italian-night-club-8-inch-french",
        "name": "#9 Italian Night Club (8-inch French)",
        "serving": "1 sandwich",
        "calories": 970,
        "protein": 49,
        "carbs": 84,
        "fat": 46,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:11-country-club-8-inch-french",
        "name": "#11 Country Club (8-inch French)",
        "serving": "1 sandwich",
        "calories": 820,
        "protein": 49,
        "carbs": 81,
        "fat": 31,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:12-beach-club-8-inch-french",
        "name": "#12 Beach Club (8-inch French)",
        "serving": "1 sandwich",
        "calories": 900,
        "protein": 47,
        "carbs": 82,
        "fat": 41,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:14-bootlegger-club-8-inch-french",
        "name": "#14 Bootlegger Club (8-inch French)",
        "serving": "1 sandwich",
        "calories": 720,
        "protein": 46,
        "carbs": 78,
        "fat": 23,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:the-jj-gargantuan-8-inch-french",
        "name": "The J.J. Gargantuan (8-inch French)",
        "serving": "1 sandwich",
        "calories": 1120,
        "protein": 79,
        "carbs": 85,
        "fat": 50,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:regular-jimmy-chips",
        "name": "Regular Jimmy Chips",
        "serving": "1 bag",
        "calories": 300,
        "protein": 3,
        "carbs": 33,
        "fat": 18,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:triple-chocolate-chunk-cookie",
        "name": "Triple Chocolate Chunk Cookie",
        "serving": "1 cookie",
        "calories": 410,
        "protein": 5,
        "carbs": 56,
        "fat": 19,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      },
      {
        "id": "jimmy-johns:jumbo-kosher-dill-pickle",
        "name": "Jumbo Kosher Dill Pickle",
        "serving": "1 pickle",
        "calories": 20,
        "protein": 1,
        "carbs": 3,
        "fat": 0,
        "sourceUrl": "https://resources.jimmyjohns.com/downloadable-files/JimmyJohns_NutritionGuide_072219.pdf"
      }
    ]
  },
  {
    "id": "kfc",
    "name": "KFC",
    "items": [
      {
        "id": "kfc:original-recipe-chicken-breast",
        "name": "Original Recipe Chicken Breast",
        "serving": "1 breast",
        "calories": 390,
        "protein": 39,
        "carbs": 11,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/original-recipe-chicken-breast"
      },
      {
        "id": "kfc:original-recipe-chicken-drumstick",
        "name": "Original Recipe Chicken Drumstick",
        "serving": "1 drumstick",
        "calories": 130,
        "protein": 12,
        "carbs": 4,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/original-recipe-chicken-drumstick"
      },
      {
        "id": "kfc:original-recipe-chicken-thigh",
        "name": "Original Recipe Chicken Thigh",
        "serving": "1 thigh",
        "calories": 280,
        "protein": 19,
        "carbs": 8,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/original-recipe-chicken-thigh"
      },
      {
        "id": "kfc:extra-crispy-tenders-3-pc",
        "name": "Extra Crispy Tenders (3 pc)",
        "serving": "3 tenders",
        "calories": 410,
        "protein": 29,
        "carbs": 24,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/extra-crispy-tenders-3"
      },
      {
        "id": "kfc:classic-chicken-sandwich",
        "name": "Classic Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 650,
        "protein": 34,
        "carbs": 49,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/chicken-sandwich/classic"
      },
      {
        "id": "kfc:famous-bowl-mashed-potato-with-gravy",
        "name": "Famous Bowl (Mashed Potato with Gravy)",
        "serving": "1 bowl",
        "calories": 740,
        "protein": 26,
        "carbs": 81,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/kfc-famous-bowls-mashed-potato-with-gravy"
      },
      {
        "id": "kfc:popcorn-chicken-nuggets-large",
        "name": "Popcorn Chicken Nuggets (large)",
        "serving": "1 large serving",
        "calories": 620,
        "protein": 27,
        "carbs": 39,
        "fat": 39,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/popcorn-chicken-nuggets/large"
      },
      {
        "id": "kfc:mashed-potatoes-with-gravy-individual",
        "name": "Mashed Potatoes with Gravy (individual)",
        "serving": "1 individual (156g)",
        "calories": 130,
        "protein": 3,
        "carbs": 20,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/mashed-potatoes-with-gravy/individual"
      },
      {
        "id": "kfc:mac-cheese-individual",
        "name": "Mac & Cheese (individual)",
        "serving": "1 individual (120g)",
        "calories": 140,
        "protein": 5,
        "carbs": 17,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/macaroni-and-cheese/individual"
      },
      {
        "id": "kfc:cole-slaw-individual",
        "name": "Cole Slaw (individual)",
        "serving": "1 individual (113g)",
        "calories": 170,
        "protein": 1,
        "carbs": 14,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/cole-slaw/individual"
      },
      {
        "id": "kfc:secret-recipe-fries",
        "name": "Secret Recipe Fries",
        "serving": "1 serving",
        "calories": 320,
        "protein": 5,
        "carbs": 41,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/secret-recipe-fries"
      },
      {
        "id": "kfc:biscuit",
        "name": "Biscuit",
        "serving": "1 biscuit",
        "calories": 180,
        "protein": 4,
        "carbs": 22,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/biscuit"
      },
      {
        "id": "kfc:chocolate-chip-cookie",
        "name": "Chocolate Chip Cookie",
        "serving": "1 cookie",
        "calories": 120,
        "protein": 1,
        "carbs": 17,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/kfc/sweet-life-chocolate-chip-cookie"
      }
    ]
  },
  {
    "id": "little-caesars",
    "name": "Little Caesars",
    "items": [
      {
        "id": "little-caesars:classic-pepperoni-pizza",
        "name": "Classic Pepperoni Pizza",
        "serving": "1 large pizza (8 slices)",
        "calories": 2300,
        "protein": 109,
        "carbs": 250,
        "fat": 97,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:classic-cheese-pizza",
        "name": "Classic Cheese Pizza",
        "serving": "1 large pizza (8 slices)",
        "calories": 1950,
        "protein": 95,
        "carbs": 248,
        "fat": 65,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:extramostbestest-pepperoni-pizza",
        "name": "ExtraMostBestest Pepperoni Pizza",
        "serving": "1 large pizza (8 slices)",
        "calories": 2500,
        "protein": 122,
        "carbs": 252,
        "fat": 113,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:detroit-style-deep-dish-pepperoni-pizza",
        "name": "Detroit-Style Deep Dish Pepperoni Pizza",
        "serving": "1 large pizza (8 slices)",
        "calories": 2770,
        "protein": 129,
        "carbs": 319,
        "fat": 111,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:crazy-bread",
        "name": "Crazy Bread",
        "serving": "8 bread sticks",
        "calories": 800,
        "protein": 25,
        "carbs": 128,
        "fat": 22,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:crazy-sauce",
        "name": "Crazy Sauce",
        "serving": "1 sauce cup",
        "calories": 30,
        "protein": 1,
        "carbs": 7,
        "fat": 0,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:italian-cheese-bread",
        "name": "Italian Cheese Bread",
        "serving": "10 bread sticks",
        "calories": 1340,
        "protein": 59,
        "carbs": 156,
        "fat": 54,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:stuffed-crazy-bread",
        "name": "Stuffed Crazy Bread",
        "serving": "3 bread sticks & Crazy Sauce",
        "calories": 980,
        "protein": 36,
        "carbs": 126,
        "fat": 38,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:pepperoni-crazy-puffs",
        "name": "Pepperoni Crazy Puffs",
        "serving": "1 order (4 puffs)",
        "calories": 680,
        "protein": 34,
        "carbs": 56,
        "fat": 36,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:caesar-wings-buffalo",
        "name": "Caesar Wings - Buffalo",
        "serving": "1 order (8 wings)",
        "calories": 520,
        "protein": 47,
        "carbs": 7,
        "fat": 35,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      },
      {
        "id": "little-caesars:cookie-dough-brownie-made-with-m-ms-minis",
        "name": "Cookie Dough Brownie made with M&M'S Minis",
        "serving": "1 full package",
        "calories": 840,
        "protein": 12,
        "carbs": 96,
        "fat": 44,
        "sourceUrl": "https://littlecaesars.com/static/usnutritionguide.pdf"
      }
    ]
  },
  {
    "id": "mcdonalds",
    "name": "McDonald's",
    "items": [
      {
        "id": "mcdonalds:big-mac",
        "name": "Big Mac",
        "serving": "1 sandwich",
        "calories": 540,
        "protein": 25,
        "carbs": 45,
        "fat": 29,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:quarter-pounder-with-cheese",
        "name": "Quarter Pounder with Cheese",
        "serving": "1 sandwich",
        "calories": 510,
        "protein": 29,
        "carbs": 40,
        "fat": 26,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:mcchicken",
        "name": "McChicken",
        "serving": "1 sandwich",
        "calories": 360,
        "protein": 14,
        "carbs": 40,
        "fat": 16,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:chicken-mcnuggets-10-piece",
        "name": "Chicken McNuggets (10 piece)",
        "serving": "10 pieces",
        "calories": 470,
        "protein": 22,
        "carbs": 30,
        "fat": 30,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:medium-french-fries",
        "name": "Medium French Fries",
        "serving": "1 medium order",
        "calories": 380,
        "protein": 4,
        "carbs": 48,
        "fat": 19,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:filet-o-fish",
        "name": "Filet-O-Fish",
        "serving": "1 sandwich",
        "calories": 380,
        "protein": 15,
        "carbs": 38,
        "fat": 18,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:egg-mcmuffin",
        "name": "Egg McMuffin",
        "serving": "1 sandwich",
        "calories": 300,
        "protein": 18,
        "carbs": 30,
        "fat": 12,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:sausage-mcmuffin-with-egg",
        "name": "Sausage McMuffin with Egg",
        "serving": "1 sandwich",
        "calories": 450,
        "protein": 21,
        "carbs": 30,
        "fat": 27,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:mcdouble",
        "name": "McDouble",
        "serving": "1 sandwich",
        "calories": 390,
        "protein": 22,
        "carbs": 33,
        "fat": 19,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:cheeseburger",
        "name": "Cheeseburger",
        "serving": "1 sandwich",
        "calories": 300,
        "protein": 15,
        "carbs": 33,
        "fat": 12,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:hash-brown",
        "name": "Hash Brown",
        "serving": "1 hash brown",
        "calories": 150,
        "protein": 1,
        "carbs": 15,
        "fat": 9,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:hot-fudge-sundae",
        "name": "Hot Fudge Sundae",
        "serving": "1 sundae",
        "calories": 330,
        "protein": 8,
        "carbs": 54,
        "fat": 10,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      },
      {
        "id": "mcdonalds:mcflurry-with-oreo-cookies",
        "name": "McFlurry with OREO Cookies",
        "serving": "12 fl oz cup",
        "calories": 580,
        "protein": 13,
        "carbs": 89,
        "fat": 19,
        "sourceUrl": "https://www.nutrition-charts.com/mcdonalds-nutrition-facts/"
      }
    ]
  },
  {
    "id": "olive-garden",
    "name": "Olive Garden",
    "items": [
      {
        "id": "olive-garden:chicken-alfredo-with-grilled-chicken",
        "name": "Chicken Alfredo (with grilled chicken)",
        "serving": "1 dinner entree",
        "calories": 1480,
        "protein": 79,
        "carbs": 79,
        "fat": 95,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:chicken-tortelloni-alfredo",
        "name": "Chicken Tortelloni Alfredo",
        "serving": "1 dinner entree",
        "calories": 1980,
        "protein": 112,
        "carbs": 95,
        "fat": 131,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:fettuccine-alfredo",
        "name": "Fettuccine Alfredo",
        "serving": "1 dinner entree",
        "calories": 1220,
        "protein": 27,
        "carbs": 78,
        "fat": 89,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:tour-of-italy",
        "name": "Tour of Italy",
        "serving": "1 dinner entree",
        "calories": 1550,
        "protein": 72,
        "carbs": 99,
        "fat": 97,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:lasagna-classico",
        "name": "Lasagna Classico",
        "serving": "1 dinner entree",
        "calories": 940,
        "protein": 54,
        "carbs": 61,
        "fat": 55,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:chicken-parmigiana",
        "name": "Chicken Parmigiana",
        "serving": "1 dinner entree",
        "calories": 1020,
        "protein": 64,
        "carbs": 80,
        "fat": 51,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:five-cheese-ziti-al-forno",
        "name": "Five Cheese Ziti al Forno",
        "serving": "1 dinner entree",
        "calories": 1170,
        "protein": 46,
        "carbs": 98,
        "fat": 69,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:shrimp-alfredo",
        "name": "Shrimp Alfredo",
        "serving": "1 dinner entree",
        "calories": 1390,
        "protein": 60,
        "carbs": 79,
        "fat": 93,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:fried-mozzarella",
        "name": "Fried Mozzarella",
        "serving": "1 appetizer",
        "calories": 800,
        "protein": 33,
        "carbs": 57,
        "fat": 49,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:breadstick-with-garlic-topping",
        "name": "Breadstick with garlic topping",
        "serving": "1 breadstick",
        "calories": 140,
        "protein": 4,
        "carbs": 25,
        "fat": 2.5,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:zuppa-toscana-soup",
        "name": "Zuppa Toscana Soup",
        "serving": "1 bowl",
        "calories": 220,
        "protein": 7,
        "carbs": 15,
        "fat": 15,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      },
      {
        "id": "olive-garden:tiramisu",
        "name": "Tiramisu",
        "serving": "1 dessert",
        "calories": 470,
        "protein": 6,
        "carbs": 54,
        "fat": 27,
        "sourceUrl": "https://media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf"
      }
    ]
  },
  {
    "id": "outback-steakhouse",
    "name": "Outback Steakhouse",
    "items": [
      {
        "id": "outback-steakhouse:bloomin-onion",
        "name": "Bloomin' Onion",
        "serving": "1 appetizer",
        "calories": 1620,
        "protein": 15,
        "carbs": 107,
        "fat": 126,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:aussie-cheese-fries",
        "name": "Aussie Cheese Fries",
        "serving": "1 appetizer",
        "calories": 2620,
        "protein": 89,
        "carbs": 153,
        "fat": 182,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:gold-coast-coconut-shrimp",
        "name": "Gold Coast Coconut Shrimp",
        "serving": "1 appetizer",
        "calories": 520,
        "protein": 31,
        "carbs": 49,
        "fat": 21,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:grilled-shrimp-on-the-barbie",
        "name": "Grilled Shrimp on the Barbie",
        "serving": "1 appetizer",
        "calories": 580,
        "protein": 34,
        "carbs": 29,
        "fat": 37,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:victorias-filet-mignon-6-oz",
        "name": "Victoria's Filet Mignon 6 oz",
        "serving": "1 steak (6 oz)",
        "calories": 380,
        "protein": 47,
        "carbs": 1,
        "fat": 19,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:outback-center-cut-sirloin-6-oz",
        "name": "Outback Center-Cut Sirloin 6 oz",
        "serving": "1 steak (6 oz)",
        "calories": 370,
        "protein": 46,
        "carbs": 1,
        "fat": 20,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:ribeye-12-oz",
        "name": "Ribeye 12 oz",
        "serving": "1 steak (12 oz)",
        "calories": 900,
        "protein": 58,
        "carbs": 1,
        "fat": 72,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:alice-springs-chicken",
        "name": "Alice Springs Chicken",
        "serving": "1 entree",
        "calories": 780,
        "protein": 79,
        "carbs": 14,
        "fat": 47,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:grilled-chicken-on-the-barbie",
        "name": "Grilled Chicken on the Barbie",
        "serving": "1 entree",
        "calories": 410,
        "protein": 62,
        "carbs": 22,
        "fat": 9,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:toowoomba-salmon",
        "name": "Toowoomba Salmon",
        "serving": "1 entree",
        "calories": 760,
        "protein": 61,
        "carbs": 7,
        "fat": 53,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:aussie-fries",
        "name": "Aussie Fries",
        "serving": "1 side",
        "calories": 500,
        "protein": 7,
        "carbs": 67,
        "fat": 23,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:baked-potato-with-everything",
        "name": "Baked Potato with Everything",
        "serving": "1 side",
        "calories": 440,
        "protein": 13,
        "carbs": 58,
        "fat": 17,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:salted-caramel-cookie",
        "name": "Salted Caramel Cookie",
        "serving": "1 dessert",
        "calories": 930,
        "protein": 10,
        "carbs": 132,
        "fat": 42,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      },
      {
        "id": "outback-steakhouse:cheesecake-with-raspberry-sauce",
        "name": "Cheesecake with Raspberry Sauce",
        "serving": "1 dessert",
        "calories": 1040,
        "protein": 17,
        "carbs": 105,
        "fat": 62,
        "sourceUrl": "https://outback.blob.core.windows.net/content/images/OBS_Full_Nutrition_Information_Core_Menu_Items.pdf"
      }
    ]
  },
  {
    "id": "panda-express",
    "name": "Panda Express",
    "items": [
      {
        "id": "panda-express:the-original-orange-chicken",
        "name": "The Original Orange Chicken",
        "serving": "1 entree serving",
        "calories": 370,
        "protein": 19,
        "carbs": 38,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/orange-chicken"
      },
      {
        "id": "panda-express:beijing-beef",
        "name": "Beijing Beef",
        "serving": "1 entree serving",
        "calories": 470,
        "protein": 13,
        "carbs": 46,
        "fat": 26,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/beijing-beef"
      },
      {
        "id": "panda-express:broccoli-beef",
        "name": "Broccoli Beef",
        "serving": "1 entree serving",
        "calories": 150,
        "protein": 9,
        "carbs": 13,
        "fat": 7,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/broccoli-beef"
      },
      {
        "id": "panda-express:kung-pao-chicken",
        "name": "Kung Pao Chicken",
        "serving": "1 entree serving",
        "calories": 290,
        "protein": 16,
        "carbs": 14,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/kung-pao-chicken"
      },
      {
        "id": "panda-express:grilled-teriyaki-chicken",
        "name": "Grilled Teriyaki Chicken",
        "serving": "1 entree serving",
        "calories": 300,
        "protein": 36,
        "carbs": 8,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/grilled-teriyaki-chicken"
      },
      {
        "id": "panda-express:honey-walnut-shrimp",
        "name": "Honey Walnut Shrimp",
        "serving": "1 entree serving",
        "calories": 360,
        "protein": 13,
        "carbs": 35,
        "fat": 23,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/honey-walnut-shrimp"
      },
      {
        "id": "panda-express:black-pepper-chicken",
        "name": "Black Pepper Chicken",
        "serving": "1 entree serving",
        "calories": 280,
        "protein": 13,
        "carbs": 15,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/black-pepper-chicken"
      },
      {
        "id": "panda-express:mushroom-chicken",
        "name": "Mushroom Chicken",
        "serving": "1 entree serving",
        "calories": 220,
        "protein": 12,
        "carbs": 11,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/mushroom-chicken"
      },
      {
        "id": "panda-express:honey-sesame-chicken-breast",
        "name": "Honey Sesame Chicken Breast",
        "serving": "1 entree serving",
        "calories": 490,
        "protein": 16,
        "carbs": 40,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/honey-sesame-chicken-breast"
      },
      {
        "id": "panda-express:chow-mein",
        "name": "Chow Mein",
        "serving": "1 side serving",
        "calories": 510,
        "protein": 13,
        "carbs": 80,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/chow-mein"
      },
      {
        "id": "panda-express:fried-rice",
        "name": "Fried Rice",
        "serving": "1 side serving",
        "calories": 520,
        "protein": 11,
        "carbs": 85,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/fried-rice"
      },
      {
        "id": "panda-express:white-steamed-rice",
        "name": "White Steamed Rice",
        "serving": "1 side serving",
        "calories": 380,
        "protein": 7,
        "carbs": 86,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/steamed-white-rice"
      },
      {
        "id": "panda-express:mixed-vegetables-side",
        "name": "Mixed Vegetables (Side)",
        "serving": "1 side serving",
        "calories": 90,
        "protein": 6,
        "carbs": 10,
        "fat": 2.5,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/mixed-veggies-side"
      },
      {
        "id": "panda-express:cream-cheese-rangoon",
        "name": "Cream Cheese Rangoon",
        "serving": "3 pieces",
        "calories": 190,
        "protein": 5,
        "carbs": 24,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/cream-cheese-rangoon"
      },
      {
        "id": "panda-express:chicken-egg-roll",
        "name": "Chicken Egg Roll",
        "serving": "1 egg roll",
        "calories": 200,
        "protein": 8,
        "carbs": 16,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/panda-express/chicken-egg-roll"
      }
    ]
  },
  {
    "id": "panera-bread",
    "name": "Panera Bread",
    "items": [
      {
        "id": "panera-bread:broccoli-cheddar-soup-bowl",
        "name": "Broccoli Cheddar Soup (bowl)",
        "serving": "1 bowl",
        "calories": 360,
        "protein": 14,
        "carbs": 30,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/broccoli-cheddar-soup/bowl"
      },
      {
        "id": "panera-bread:chicken-noodle-soup-bowl",
        "name": "Chicken Noodle Soup (bowl)",
        "serving": "1 bowl",
        "calories": 160,
        "protein": 14,
        "carbs": 19,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/chicken-noodle-soup/bowl"
      },
      {
        "id": "panera-bread:mac-cheese-cup",
        "name": "Mac & Cheese (cup)",
        "serving": "1 cup",
        "calories": 470,
        "protein": 17,
        "carbs": 33,
        "fat": 31,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/mac-cheese"
      },
      {
        "id": "panera-bread:chicken-caesar-salad-full",
        "name": "Chicken Caesar Salad (full)",
        "serving": "1 full salad",
        "calories": 470,
        "protein": 34,
        "carbs": 21,
        "fat": 28,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/chicken-caesar-salad/full"
      },
      {
        "id": "panera-bread:fuji-apple-salad-with-chicken-full",
        "name": "Fuji Apple Salad with Chicken (full)",
        "serving": "1 full salad",
        "calories": 580,
        "protein": 32,
        "carbs": 38,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/fuji-apple-with-chicken-salad/full"
      },
      {
        "id": "panera-bread:green-goddess-cobb-salad-with-chicken-whole",
        "name": "Green Goddess Cobb Salad with Chicken (whole)",
        "serving": "1 whole salad",
        "calories": 530,
        "protein": 42,
        "carbs": 27,
        "fat": 30,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/green-goddess-cobb-salad-with-chicken/whole"
      },
      {
        "id": "panera-bread:bacon-turkey-bravo-on-xl-tomato-basil-full",
        "name": "Bacon Turkey Bravo on XL Tomato Basil (full)",
        "serving": "1 full sandwich",
        "calories": 640,
        "protein": 45,
        "carbs": 68,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/full-bacon-turkey-bravo-on-xl-tomato-basil"
      },
      {
        "id": "panera-bread:chipotle-chicken-avocado-melt-whole",
        "name": "Chipotle Chicken Avocado Melt (whole)",
        "serving": "1 whole sandwich",
        "calories": 850,
        "protein": 41,
        "carbs": 80,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/chipotle-chicken-avocado-melt/whole"
      },
      {
        "id": "panera-bread:frontega-chicken-panini-whole",
        "name": "Frontega Chicken Panini (whole)",
        "serving": "1 whole panini",
        "calories": 730,
        "protein": 39,
        "carbs": 79,
        "fat": 29,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/frontega-chicken-panini/whole"
      },
      {
        "id": "panera-bread:mediterranean-veggie-on-xl-tomato-basil-whole",
        "name": "Mediterranean Veggie on XL Tomato Basil (whole)",
        "serving": "1 whole sandwich",
        "calories": 470,
        "protein": 18,
        "carbs": 68,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/mediterranean-veggie-on-xl-tomato-basil/whole"
      },
      {
        "id": "panera-bread:cinnamon-crunch-bagel",
        "name": "Cinnamon Crunch Bagel",
        "serving": "1 bagel",
        "calories": 420,
        "protein": 10,
        "carbs": 82,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/cinnamon-crunch-bagel"
      },
      {
        "id": "panera-bread:chocolate-chipper-cookie",
        "name": "Chocolate Chipper Cookie",
        "serving": "1 cookie",
        "calories": 390,
        "protein": 4,
        "carbs": 52,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/chocolate-chipper-cookie"
      },
      {
        "id": "panera-bread:kitchen-sink-cookie",
        "name": "Kitchen Sink Cookie",
        "serving": "1 cookie",
        "calories": 800,
        "protein": 8,
        "carbs": 99,
        "fat": 44,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/kitchen-sink-cookie"
      },
      {
        "id": "panera-bread:mango-yuzu-citrus-charged-lemonade-regular",
        "name": "Mango Yuzu Citrus Charged Lemonade (regular)",
        "serving": "20 fl oz",
        "calories": 350,
        "protein": 0,
        "carbs": 86,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/panera-bread/mango-yuzu-citrus-charged-lemonade/regular"
      }
    ]
  },
  {
    "id": "papa-johns",
    "name": "Papa Johns",
    "items": [
      {
        "id": "papa-johns:cheese-pizza-large-original-crust",
        "name": "Cheese Pizza (large, original crust)",
        "serving": "1 slice (1/8 pizza)",
        "calories": 290,
        "protein": 11,
        "carbs": 37,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/cheese-pizza/large"
      },
      {
        "id": "papa-johns:pepperoni-pizza-large-original-crust",
        "name": "Pepperoni Pizza (large, original crust)",
        "serving": "1 slice (1/8 pizza)",
        "calories": 330,
        "protein": 13,
        "carbs": 37,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/pepperoni-pizza/large"
      },
      {
        "id": "papa-johns:the-works-pizza-large-original-crust",
        "name": "The Works Pizza (large, original crust)",
        "serving": "1 slice (1/8 pizza)",
        "calories": 330,
        "protein": 13,
        "carbs": 39,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/the-works-pizza/large"
      },
      {
        "id": "papa-johns:bbq-chicken-bacon-pizza-large-original-crust",
        "name": "BBQ Chicken Bacon Pizza (large, original crust)",
        "serving": "1 slice (1/8 pizza)",
        "calories": 350,
        "protein": 15,
        "carbs": 45,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/bbq-chicken-bacon-pizza/large"
      },
      {
        "id": "papa-johns:breadsticks",
        "name": "Breadsticks",
        "serving": "2 sticks",
        "calories": 290,
        "protein": 9,
        "carbs": 53,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/breadsticks"
      },
      {
        "id": "papa-johns:cheesesticks",
        "name": "Cheesesticks",
        "serving": "4 sticks",
        "calories": 370,
        "protein": 14,
        "carbs": 41,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/cheesesticks"
      },
      {
        "id": "papa-johns:italian-papadia",
        "name": "Italian Papadia",
        "serving": "1 papadia",
        "calories": 940,
        "protein": 38,
        "carbs": 76,
        "fat": 53,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/italian-papadia"
      },
      {
        "id": "papa-johns:bbq-wings",
        "name": "BBQ Wings",
        "serving": "2 wings",
        "calories": 190,
        "protein": 12,
        "carbs": 6,
        "fat": 12,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/bbq-wings"
      },
      {
        "id": "papa-johns:special-garlic-sauce",
        "name": "Special Garlic Sauce",
        "serving": "1 cup (14g)",
        "calories": 75,
        "protein": 0,
        "carbs": 2,
        "fat": 9,
        "sourceUrl": "https://fastfoodnutrition.org/papa-johns/garlic-sauce-1-tablespoon"
      }
    ]
  },
  {
    "id": "pizza-hut",
    "name": "Pizza Hut",
    "items": [
      {
        "id": "pizza-hut:pepperoni-pan-pizza-medium-slice",
        "name": "Pepperoni Pan Pizza (medium slice)",
        "serving": "1 slice, medium 12\"",
        "calories": 260,
        "protein": 10,
        "carbs": 26,
        "fat": 13,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/pepperoni-pan-pizza/medium"
      },
      {
        "id": "pizza-hut:cheese-pan-pizza-medium-slice",
        "name": "Cheese Pan Pizza (medium slice)",
        "serving": "1 slice, medium 12\"",
        "calories": 240,
        "protein": 10,
        "carbs": 26,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/cheese-pan-pizza/medium"
      },
      {
        "id": "pizza-hut:meat-lovers-pan-pizza-medium-slice",
        "name": "Meat Lover's Pan Pizza (medium slice)",
        "serving": "1 slice, medium 12\"",
        "calories": 320,
        "protein": 13,
        "carbs": 26,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/meat-lovers-pan-pizza/medium"
      },
      {
        "id": "pizza-hut:supreme-pan-pizza-medium-slice",
        "name": "Supreme Pan Pizza (medium slice)",
        "serving": "1 slice, medium 12\"",
        "calories": 280,
        "protein": 11,
        "carbs": 27,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/supreme-pan-pizza/medium"
      },
      {
        "id": "pizza-hut:hand-tossed-pepperoni-pizza-medium-slice",
        "name": "Hand Tossed Pepperoni Pizza (medium slice)",
        "serving": "1 slice, medium",
        "calories": 230,
        "protein": 9,
        "carbs": 25,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/hand-tossed-pepperoni-pizza/medium"
      },
      {
        "id": "pizza-hut:hand-tossed-cheese-pizza-medium-slice",
        "name": "Hand Tossed Cheese Pizza (medium slice)",
        "serving": "1 slice, medium",
        "calories": 210,
        "protein": 9,
        "carbs": 26,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/hand-tossed-cheese-pizza/medium"
      },
      {
        "id": "pizza-hut:pepperoni-stuffed-crust-pizza-slice",
        "name": "Pepperoni Stuffed Crust Pizza (slice)",
        "serving": "1 slice, large",
        "calories": 340,
        "protein": 15,
        "carbs": 35,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/pepperoni-stuffed-crust-pizza"
      },
      {
        "id": "pizza-hut:breadstick",
        "name": "Breadstick",
        "serving": "1 breadstick (44g)",
        "calories": 140,
        "protein": 5,
        "carbs": 19,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/breadsticks-each"
      },
      {
        "id": "pizza-hut:cinnamon-sticks",
        "name": "Cinnamon Sticks",
        "serving": "2 pieces",
        "calories": 160,
        "protein": 4,
        "carbs": 26,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/cinnamon-sticks"
      },
      {
        "id": "pizza-hut:honey-bbq-traditional-wings",
        "name": "Honey BBQ Traditional Wings",
        "serving": "2 wings",
        "calories": 140,
        "protein": 8,
        "carbs": 16,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/honey-bbq-wings"
      },
      {
        "id": "pizza-hut:garlic-parmesan-boneless-wings",
        "name": "Garlic Parmesan Boneless Wings",
        "serving": "2 wings",
        "calories": 260,
        "protein": 11,
        "carbs": 11,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/garlic-parmesan-bonless-wings"
      },
      {
        "id": "pizza-hut:pepperoni-pzone",
        "name": "Pepperoni P'Zone",
        "serving": "1/2 P'Zone",
        "calories": 460,
        "protein": 19,
        "carbs": 60,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/pizza-hut/pepperoni-pzone"
      }
    ]
  },
  {
    "id": "popeyes",
    "name": "Popeyes",
    "items": [
      {
        "id": "popeyes:classic-chicken-sandwich",
        "name": "Classic Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 699,
        "protein": 28,
        "carbs": 50,
        "fat": 42,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/chicken-sandwich"
      },
      {
        "id": "popeyes:spicy-chicken-sandwich",
        "name": "Spicy Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 700,
        "protein": 28,
        "carbs": 50,
        "fat": 42,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/spicy-chicken-sandwich"
      },
      {
        "id": "popeyes:bonafide-mild-chicken-breast",
        "name": "Bonafide Mild Chicken Breast",
        "serving": "1 breast (157g)",
        "calories": 440,
        "protein": 35,
        "carbs": 16,
        "fat": 27,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/bonafide-mild-chicken-breast"
      },
      {
        "id": "popeyes:bonafide-mild-chicken-thigh",
        "name": "Bonafide Mild Chicken Thigh",
        "serving": "1 thigh (80g)",
        "calories": 280,
        "protein": 14,
        "carbs": 7,
        "fat": 21,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/bonafide-mild-chicken-thigh"
      },
      {
        "id": "popeyes:bonafide-mild-chicken-leg",
        "name": "Bonafide Mild Chicken Leg",
        "serving": "1 leg (67g)",
        "calories": 160,
        "protein": 14,
        "carbs": 5,
        "fat": 9,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/bonafide-mild-chicken-leg"
      },
      {
        "id": "popeyes:handcrafted-mild-tenders-3-pc",
        "name": "Handcrafted Mild Tenders (3 pc)",
        "serving": "3 tenders (126g)",
        "calories": 340,
        "protein": 27,
        "carbs": 26,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/chicken-mild-tenders-3pcs"
      },
      {
        "id": "popeyes:cajun-fries-regular",
        "name": "Cajun Fries (regular)",
        "serving": "1 regular (85g)",
        "calories": 260,
        "protein": 3,
        "carbs": 30,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/cajun-fries/regular"
      },
      {
        "id": "popeyes:mashed-potatoes-with-cajun-gravy-regular",
        "name": "Mashed Potatoes with Cajun Gravy (regular)",
        "serving": "1 regular (142g)",
        "calories": 110,
        "protein": 3,
        "carbs": 18,
        "fat": 4,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/mashed-potatoes/regular"
      },
      {
        "id": "popeyes:red-beans-rice-regular",
        "name": "Red Beans & Rice (regular)",
        "serving": "1 regular (146g)",
        "calories": 230,
        "protein": 7,
        "carbs": 23,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/red-beans-rice/regular"
      },
      {
        "id": "popeyes:cole-slaw-regular",
        "name": "Cole Slaw (regular)",
        "serving": "1 regular (138g)",
        "calories": 220,
        "protein": 1,
        "carbs": 19,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/cole-slaw/regular"
      },
      {
        "id": "popeyes:homestyle-mac-cheese-regular",
        "name": "Homestyle Mac & Cheese (regular)",
        "serving": "1 regular (132g)",
        "calories": 300,
        "protein": 11,
        "carbs": 15,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/macaroni-cheese/regular"
      },
      {
        "id": "popeyes:biscuit",
        "name": "Biscuit",
        "serving": "1 biscuit (60g)",
        "calories": 260,
        "protein": 4,
        "carbs": 26,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/biscuit"
      },
      {
        "id": "popeyes:popcorn-shrimp-1-4-lb",
        "name": "Popcorn Shrimp (1/4 lb)",
        "serving": "1/4 pound",
        "calories": 390,
        "protein": 14,
        "carbs": 28,
        "fat": 25,
        "sourceUrl": "https://fastfoodnutrition.org/popeyes/popcorn-shrimp"
      }
    ]
  },
  {
    "id": "qdoba",
    "name": "Qdoba",
    "items": [
      {
        "id": "qdoba:chicken-queso-burrito",
        "name": "Chicken Queso Burrito",
        "serving": "584 grams",
        "calories": 1080,
        "protein": 51,
        "carbs": 127,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/chicken-queso-burrito"
      },
      {
        "id": "qdoba:chicken-queso-bowl",
        "name": "Chicken Queso Bowl",
        "serving": "482 grams",
        "calories": 780,
        "protein": 43,
        "carbs": 75,
        "fat": 34,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/chicken-queso-bowl"
      },
      {
        "id": "qdoba:chicken-protein-bowl",
        "name": "Chicken Protein Bowl",
        "serving": "546 grams",
        "calories": 610,
        "protein": 44,
        "carbs": 48,
        "fat": 29,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/chicken-protein-bowl"
      },
      {
        "id": "qdoba:fresca-chicken-bowl",
        "name": "Fresca Chicken Bowl",
        "serving": "1 bowl",
        "calories": 490,
        "protein": 37,
        "carbs": 54,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/fresca-chicken-bowl"
      },
      {
        "id": "qdoba:southwest-steak-burrito",
        "name": "Southwest Steak Burrito",
        "serving": "1 burrito",
        "calories": 1060,
        "protein": 48,
        "carbs": 134,
        "fat": 37,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/southwest-steak-burrito"
      },
      {
        "id": "qdoba:smoked-brisket-keto-bowl",
        "name": "Smoked Brisket Keto Bowl",
        "serving": "369 grams",
        "calories": 620,
        "protein": 36,
        "carbs": 18,
        "fat": 45,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/smoked-brisket-keto-bowl"
      },
      {
        "id": "qdoba:impossible-fajita-bowl",
        "name": "Impossible Fajita Bowl",
        "serving": "428 grams",
        "calories": 580,
        "protein": 28,
        "carbs": 85,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/impossible-fajita-bowl"
      },
      {
        "id": "qdoba:street-style-chicken-tacos",
        "name": "Street Style Chicken Tacos",
        "serving": "324 grams",
        "calories": 470,
        "protein": 24,
        "carbs": 50,
        "fat": 22,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/street-style-chicken-tacos/with-corn-tortilla"
      },
      {
        "id": "qdoba:steak-fajita-quesadilla",
        "name": "Steak Fajita Quesadilla",
        "serving": "491 grams",
        "calories": 1130,
        "protein": 57,
        "carbs": 72,
        "fat": 68,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/steak-fajita-quesadilla"
      },
      {
        "id": "qdoba:3-cheese-queso",
        "name": "3-Cheese Queso",
        "serving": "57 grams",
        "calories": 90,
        "protein": 3,
        "carbs": 3,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/3-cheese-queso/2-oz"
      },
      {
        "id": "qdoba:guacamole",
        "name": "Guacamole",
        "serving": "57 grams",
        "calories": 90,
        "protein": 1,
        "carbs": 5,
        "fat": 7,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/guacamole/2-oz"
      },
      {
        "id": "qdoba:corn-tortilla-chips",
        "name": "Corn Tortilla Chips",
        "serving": "113 grams",
        "calories": 560,
        "protein": 7,
        "carbs": 75,
        "fat": 26,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/corn-tortilla-chips"
      },
      {
        "id": "qdoba:chocolate-chunk-cookie",
        "name": "Chocolate Chunk Cookie",
        "serving": "54 grams",
        "calories": 260,
        "protein": 2,
        "carbs": 34,
        "fat": 14,
        "sourceUrl": "https://fastfoodnutrition.org/qdoba/chocolate-chunk-cookie"
      }
    ]
  },
  {
    "id": "raising-canes",
    "name": "Raising Cane's",
    "items": [
      {
        "id": "raising-canes:chicken-finger",
        "name": "Chicken Finger",
        "serving": "1 finger",
        "calories": 130,
        "protein": 13,
        "carbs": 5,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/chicken-fingers"
      },
      {
        "id": "raising-canes:chicken-sandwich",
        "name": "Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 780,
        "protein": 48,
        "carbs": 66,
        "fat": 39,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/chicken-sandwich"
      },
      {
        "id": "raising-canes:box-combo",
        "name": "Box Combo",
        "serving": "1 meal",
        "calories": 1250,
        "protein": 61,
        "carbs": 97,
        "fat": 68,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/box-combo"
      },
      {
        "id": "raising-canes:caniac-combo",
        "name": "Caniac Combo",
        "serving": "1 meal",
        "calories": 1790,
        "protein": 89,
        "carbs": 124,
        "fat": 104,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/caniac-combo"
      },
      {
        "id": "raising-canes:crinkle-cut-fries",
        "name": "Crinkle-Cut Fries",
        "serving": "1 basket",
        "calories": 390,
        "protein": 5,
        "carbs": 49,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/crinkle-cut-fries"
      },
      {
        "id": "raising-canes:texas-toast",
        "name": "Texas Toast",
        "serving": "1 piece",
        "calories": 140,
        "protein": 4,
        "carbs": 23,
        "fat": 4,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/texas-toast"
      },
      {
        "id": "raising-canes:coleslaw",
        "name": "Coleslaw",
        "serving": "1 serving",
        "calories": 100,
        "protein": 1,
        "carbs": 11,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/coleslaw"
      },
      {
        "id": "raising-canes:canes-sauce",
        "name": "Cane's Sauce",
        "serving": "1 serving (1.5 oz)",
        "calories": 190,
        "protein": 0,
        "carbs": 6,
        "fat": 19,
        "sourceUrl": "https://fastfoodnutrition.org/raising-canes/canes-sauce"
      }
    ]
  },
  {
    "id": "red-lobster",
    "name": "Red Lobster",
    "items": [
      {
        "id": "red-lobster:ultimate-feast",
        "name": "Ultimate Feast",
        "serving": "1 entree",
        "calories": 1280,
        "protein": 52,
        "carbs": 35,
        "fat": 98,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:admirals-feast",
        "name": "Admiral's Feast",
        "serving": "1 entree",
        "calories": 1670,
        "protein": 57,
        "carbs": 131,
        "fat": 99,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:walts-favorite-shrimp",
        "name": "Walt's Favorite Shrimp",
        "serving": "1 entree",
        "calories": 520,
        "protein": 22,
        "carbs": 60,
        "fat": 24,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:parrot-isle-jumbo-coconut-shrimp",
        "name": "Parrot Isle Jumbo Coconut Shrimp",
        "serving": "1 entree",
        "calories": 940,
        "protein": 32,
        "carbs": 82,
        "fat": 64,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:cheddar-bay-biscuit",
        "name": "Cheddar Bay Biscuit",
        "serving": "1 biscuit",
        "calories": 160,
        "protein": 3,
        "carbs": 16,
        "fat": 10,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:atlantic-salmon-grilled",
        "name": "Atlantic Salmon, Grilled",
        "serving": "1 entree",
        "calories": 510,
        "protein": 47,
        "carbs": 1,
        "fat": 34,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:fish-chips-with-fries-coleslaw-hush-puppies",
        "name": "Fish & Chips with fries, coleslaw, hush puppies",
        "serving": "1 entree",
        "calories": 1660,
        "protein": 39,
        "carbs": 148,
        "fat": 100,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:new-england-clam-chowder-bowl",
        "name": "New England Clam Chowder, Bowl",
        "serving": "1 bowl",
        "calories": 460,
        "protein": 15,
        "carbs": 40,
        "fat": 27,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:lobster-shrimp-linguini",
        "name": "Lobster & Shrimp Linguini",
        "serving": "1 entree",
        "calories": 1240,
        "protein": 63,
        "carbs": 85,
        "fat": 74,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:salmon-new-orleans",
        "name": "Salmon New Orleans",
        "serving": "1 entree",
        "calories": 1160,
        "protein": 102,
        "carbs": 9,
        "fat": 77,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:crispy-dragon-shrimp",
        "name": "Crispy Dragon Shrimp",
        "serving": "1 order",
        "calories": 1010,
        "protein": 25,
        "carbs": 67,
        "fat": 72,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:surf-turf-maine-lobster-tail-7-oz-sirloin",
        "name": "Surf & Turf - Maine Lobster Tail & 7 oz. Sirloin",
        "serving": "1 entree",
        "calories": 740,
        "protein": 56,
        "carbs": 1,
        "fat": 59,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:mozzarella-cheesesticks",
        "name": "Mozzarella Cheesesticks",
        "serving": "1 order",
        "calories": 730,
        "protein": 31,
        "carbs": 58,
        "fat": 41,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:key-lime-pie",
        "name": "Key Lime Pie",
        "serving": "1 slice",
        "calories": 580,
        "protein": 10,
        "carbs": 76,
        "fat": 27,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      },
      {
        "id": "red-lobster:brownie-overboard",
        "name": "Brownie Overboard",
        "serving": "1 dessert",
        "calories": 1020,
        "protein": 13,
        "carbs": 121,
        "fat": 57,
        "sourceUrl": "https://img-ecomm-rl-prod-fye5gqbxdtbghqer.a03.azurefd.net/brandsite/documents/US_Nutrition_6-23-25.pdf"
      }
    ]
  },
  {
    "id": "shake-shack",
    "name": "Shake Shack",
    "items": [
      {
        "id": "shake-shack:shackburger-single",
        "name": "ShackBurger (single)",
        "serving": "1 burger",
        "calories": 500,
        "protein": 29,
        "carbs": 26,
        "fat": 30,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:double-shackburger",
        "name": "Double ShackBurger",
        "serving": "1 burger",
        "calories": 760,
        "protein": 51,
        "carbs": 27,
        "fat": 48,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:single-cheeseburger",
        "name": "Single Cheeseburger",
        "serving": "1 burger",
        "calories": 440,
        "protein": 29,
        "carbs": 25,
        "fat": 24,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:smokeshack-single",
        "name": "SmokeShack (single)",
        "serving": "1 burger",
        "calories": 570,
        "protein": 36,
        "carbs": 28,
        "fat": 35,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:shroom-burger",
        "name": "'Shroom Burger",
        "serving": "1 burger",
        "calories": 510,
        "protein": 18,
        "carbs": 49,
        "fat": 27,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:shack-stack",
        "name": "Shack Stack",
        "serving": "1 burger",
        "calories": 770,
        "protein": 40,
        "carbs": 50,
        "fat": 45,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:chickn-shack",
        "name": "Chick'n Shack",
        "serving": "1 sandwich",
        "calories": 550,
        "protein": 33,
        "carbs": 34,
        "fat": 31,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:chickn-bites-10-piece",
        "name": "Chick'n Bites (10 piece)",
        "serving": "10 pieces",
        "calories": 510,
        "protein": 29,
        "carbs": 26,
        "fat": 32,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:hot-dog",
        "name": "Hot Dog",
        "serving": "1 hot dog",
        "calories": 350,
        "protein": 16,
        "carbs": 25,
        "fat": 22,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:fries-regular",
        "name": "Fries (regular)",
        "serving": "1 regular order",
        "calories": 470,
        "protein": 6,
        "carbs": 63,
        "fat": 22,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:cheese-fries",
        "name": "Cheese Fries",
        "serving": "1 order",
        "calories": 710,
        "protein": 12,
        "carbs": 64,
        "fat": 44,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:vanilla-shake",
        "name": "Vanilla Shake",
        "serving": "1 shake",
        "calories": 680,
        "protein": 18,
        "carbs": 72,
        "fat": 36,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      },
      {
        "id": "shake-shack:chocolate-shake",
        "name": "Chocolate Shake",
        "serving": "1 shake",
        "calories": 750,
        "protein": 16,
        "carbs": 76,
        "fat": 45,
        "sourceUrl": "https://shakeshack.com/sites/default/files/2021-09/SHA_NutritionFacts_ShakeShack-tables-August%2031,%202021%20.pdf"
      }
    ]
  },
  {
    "id": "sonic-drive-in",
    "name": "Sonic Drive-In",
    "items": [
      {
        "id": "sonic-drive-in:sonic-cheeseburger-with-ketchup-mayo",
        "name": "Sonic Cheeseburger with Ketchup & Mayo",
        "serving": "1 burger",
        "calories": 700,
        "protein": 30,
        "carbs": 52,
        "fat": 41,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:supersonic-double-cheeseburger-with-ketchup-mayo",
        "name": "SuperSONIC Double Cheeseburger with Ketchup & Mayo",
        "serving": "1 burger",
        "calories": 1040,
        "protein": 50,
        "carbs": 54,
        "fat": 68,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:jr-double-cheeseburger",
        "name": "Jr. Double Cheeseburger",
        "serving": "1 burger",
        "calories": 390,
        "protein": 21,
        "carbs": 25,
        "fat": 23,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:chili-cheese-coney",
        "name": "Chili Cheese Coney",
        "serving": "1 coney",
        "calories": 470,
        "protein": 18,
        "carbs": 34,
        "fat": 29,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:crispy-tenders-3-pc",
        "name": "Crispy Tenders (3 pc)",
        "serving": "3 tenders",
        "calories": 260,
        "protein": 21,
        "carbs": 16,
        "fat": 12,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:crispy-tenders-5-pc",
        "name": "Crispy Tenders (5 pc)",
        "serving": "5 tenders",
        "calories": 430,
        "protein": 35,
        "carbs": 27,
        "fat": 20,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:tots-medium",
        "name": "Tots (medium)",
        "serving": "1 medium",
        "calories": 360,
        "protein": 3,
        "carbs": 43,
        "fat": 19,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:groovy-fries-medium",
        "name": "Groovy Fries (medium)",
        "serving": "1 medium",
        "calories": 370,
        "protein": 4,
        "carbs": 39,
        "fat": 22,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:mozzarella-sticks-6-pc-medium",
        "name": "Mozzarella Sticks (6 pc, medium)",
        "serving": "6 sticks",
        "calories": 560,
        "protein": 22,
        "carbs": 54,
        "fat": 28,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:onion-rings-medium",
        "name": "Onion Rings (medium)",
        "serving": "1 medium",
        "calories": 580,
        "protein": 8,
        "carbs": 74,
        "fat": 29,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:corn-dog",
        "name": "Corn Dog",
        "serving": "1 corn dog",
        "calories": 230,
        "protein": 6,
        "carbs": 23,
        "fat": 13,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:vanilla-shake-medium",
        "name": "Vanilla Shake (medium)",
        "serving": "1 medium",
        "calories": 770,
        "protein": 12,
        "carbs": 107,
        "fat": 27,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:sonic-blast-with-oreo-cookie-pieces-medium",
        "name": "Sonic Blast with Oreo Cookie Pieces (medium)",
        "serving": "1 medium",
        "calories": 770,
        "protein": 15,
        "carbs": 121,
        "fat": 28,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      },
      {
        "id": "sonic-drive-in:limeade-slush-medium",
        "name": "Limeade Slush (medium)",
        "serving": "1 medium",
        "calories": 280,
        "protein": 0,
        "carbs": 75,
        "fat": 0,
        "sourceUrl": "https://assets.ctfassets.net/2iottqjdrp5h/65XT3FGLAwpNbHl1HpDh3Y/e51df0cbbe1224e12bc7d5abfc271205/58778-3_F25_NAT_NutritionalBrochure_FA_rg_Spread_WCAG__1_.pdf"
      }
    ]
  },
  {
    "id": "starbucks",
    "name": "Starbucks",
    "items": [
      {
        "id": "starbucks:caffe-latte-grande-2-milk",
        "name": "Caffe Latte (Grande, 2% Milk)",
        "serving": "16 fl oz",
        "calories": 190,
        "protein": 12,
        "carbs": 18,
        "fat": 7,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/caffe-latte-with-2-milk/grande"
      },
      {
        "id": "starbucks:caramel-macchiato-grande-2-milk",
        "name": "Caramel Macchiato (Grande, 2% Milk)",
        "serving": "16 fl oz",
        "calories": 250,
        "protein": 10,
        "carbs": 35,
        "fat": 7,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/caramel-macchiato-with-2-milk/grande"
      },
      {
        "id": "starbucks:vanilla-latte-grande-2-milk",
        "name": "Vanilla Latte (Grande, 2% Milk)",
        "serving": "16 fl oz",
        "calories": 250,
        "protein": 12,
        "carbs": 37,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/vanilla-latte-with-2-milk/grande"
      },
      {
        "id": "starbucks:caffe-mocha-grande-2-milk",
        "name": "Caffe Mocha (Grande, 2% Milk)",
        "serving": "16 fl oz",
        "calories": 290,
        "protein": 13,
        "carbs": 42,
        "fat": 8,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/caffe-mocha-with-2-milk/grande"
      },
      {
        "id": "starbucks:white-chocolate-mocha-grande-2-milk",
        "name": "White Chocolate Mocha (Grande, 2% Milk)",
        "serving": "16 fl oz",
        "calories": 400,
        "protein": 14,
        "carbs": 60,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/white-chocolate-mocha-with-2-milk/grande"
      },
      {
        "id": "starbucks:caramel-frappuccino-grande",
        "name": "Caramel Frappuccino (Grande)",
        "serving": "16 fl oz",
        "calories": 370,
        "protein": 4,
        "carbs": 57,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/caramel-frappuccino/grande"
      },
      {
        "id": "starbucks:mocha-frappuccino-grande",
        "name": "Mocha Frappuccino (Grande)",
        "serving": "16 fl oz",
        "calories": 370,
        "protein": 5,
        "carbs": 55,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/mocha-frappuccino/grande"
      },
      {
        "id": "starbucks:pink-drink-grande",
        "name": "Pink Drink (Grande)",
        "serving": "16 fl oz",
        "calories": 140,
        "protein": 1,
        "carbs": 27,
        "fat": 3,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/pink-drink/grande"
      },
      {
        "id": "starbucks:iced-brown-sugar-oatmilk-shaken-espresso-grande",
        "name": "Iced Brown Sugar Oatmilk Shaken Espresso (Grande)",
        "serving": "16 fl oz",
        "calories": 120,
        "protein": 2,
        "carbs": 20,
        "fat": 3,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/iced-brown-sugar-oatmilk-shaken-espresso/grande"
      },
      {
        "id": "starbucks:bacon-gouda-breakfast-sandwich",
        "name": "Bacon & Gouda Breakfast Sandwich",
        "serving": "1 sandwich (116g)",
        "calories": 370,
        "protein": 18,
        "carbs": 33,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/bacon-gouda-artisan-breakfast-sandwich"
      },
      {
        "id": "starbucks:double-smoked-bacon-cheddar-egg-sandwich",
        "name": "Double-Smoked Bacon, Cheddar & Egg Sandwich",
        "serving": "1 sandwich",
        "calories": 510,
        "protein": 22,
        "carbs": 42,
        "fat": 28,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/double-smoked-bacon-cheddar-egg-sandwich"
      },
      {
        "id": "starbucks:butter-croissant",
        "name": "Butter Croissant",
        "serving": "1 croissant",
        "calories": 260,
        "protein": 5,
        "carbs": 27,
        "fat": 15,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/butter-croissant"
      },
      {
        "id": "starbucks:chocolate-croissant",
        "name": "Chocolate Croissant",
        "serving": "1 croissant",
        "calories": 340,
        "protein": 5,
        "carbs": 38,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/chocolate-croissant"
      },
      {
        "id": "starbucks:blueberry-streusel-muffin",
        "name": "Blueberry Streusel Muffin",
        "serving": "1 muffin",
        "calories": 360,
        "protein": 7,
        "carbs": 59,
        "fat": 11,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/blueberry-streusel-muffin"
      },
      {
        "id": "starbucks:birthday-cake-pop",
        "name": "Birthday Cake Pop",
        "serving": "1 cake pop (43g)",
        "calories": 170,
        "protein": 1,
        "carbs": 23,
        "fat": 9,
        "sourceUrl": "https://fastfoodnutrition.org/starbucks/birthday-cake-pop"
      }
    ]
  },
  {
    "id": "subway",
    "name": "Subway",
    "items": [
      {
        "id": "subway:6-inch-turkey-breast-sub",
        "name": "6-inch Turkey Breast Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 260,
        "protein": 20,
        "carbs": 39,
        "fat": 3,
        "sourceUrl": "https://fastfoodnutrition.org/subway/turkey-breast/6"
      },
      {
        "id": "subway:6-inch-italian-bmt-sub",
        "name": "6-inch Italian B.M.T. Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 360,
        "protein": 19,
        "carbs": 39,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/subway/italian-bmt/6"
      },
      {
        "id": "subway:6-inch-meatball-marinara-sub",
        "name": "6-inch Meatball Marinara Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 410,
        "protein": 20,
        "carbs": 48,
        "fat": 18,
        "sourceUrl": "https://fastfoodnutrition.org/subway/meatball-marinara/6"
      },
      {
        "id": "subway:6-inch-tuna-sub",
        "name": "6-inch Tuna Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 430,
        "protein": 19,
        "carbs": 37,
        "fat": 25,
        "sourceUrl": "https://fastfoodnutrition.org/subway/tuna/6"
      },
      {
        "id": "subway:6-inch-spicy-italian-sub",
        "name": "6-inch Spicy Italian Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 430,
        "protein": 19,
        "carbs": 39,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/subway/spicy-italian/6"
      },
      {
        "id": "subway:6-inch-black-forest-ham-sub",
        "name": "6-inch Black Forest Ham Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 270,
        "protein": 18,
        "carbs": 41,
        "fat": 4,
        "sourceUrl": "https://fastfoodnutrition.org/subway/black-forest-ham/6"
      },
      {
        "id": "subway:6-inch-cold-cut-combo-sub",
        "name": "6-inch Cold Cut Combo Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 280,
        "protein": 17,
        "carbs": 38,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/subway/cold-cut-combo/6"
      },
      {
        "id": "subway:6-inch-sweet-onion-chicken-teriyaki-sub",
        "name": "6-inch Sweet Onion Chicken Teriyaki Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 340,
        "protein": 24,
        "carbs": 54,
        "fat": 4,
        "sourceUrl": "https://fastfoodnutrition.org/subway/sweet-onion-chicken-teriyaki/6"
      },
      {
        "id": "subway:6-inch-oven-roasted-chicken-sub",
        "name": "6-inch Oven Roasted Chicken Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 280,
        "protein": 21,
        "carbs": 41,
        "fat": 5,
        "sourceUrl": "https://fastfoodnutrition.org/subway/oven-roasted-chicken/6"
      },
      {
        "id": "subway:6-inch-veggie-delite-sub",
        "name": "6-inch Veggie Delite Sub",
        "serving": "1 six-inch sub, standard recipe",
        "calories": 200,
        "protein": 8,
        "carbs": 39,
        "fat": 2,
        "sourceUrl": "https://fastfoodnutrition.org/subway/veggie-delite/6"
      },
      {
        "id": "subway:chocolate-chip-cookie",
        "name": "Chocolate Chip Cookie",
        "serving": "1 cookie",
        "calories": 220,
        "protein": 2,
        "carbs": 30,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/subway/chocolate-chip-cookie"
      }
    ]
  },
  {
    "id": "taco-bell",
    "name": "Taco Bell",
    "items": [
      {
        "id": "taco-bell:crunchy-taco",
        "name": "Crunchy Taco",
        "serving": "1 taco",
        "calories": 170,
        "protein": 8,
        "carbs": 13,
        "fat": 9,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:soft-taco-beef",
        "name": "Soft Taco (Beef)",
        "serving": "1 taco",
        "calories": 180,
        "protein": 9,
        "carbs": 17,
        "fat": 9,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:nacho-cheese-doritos-locos-taco",
        "name": "Nacho Cheese Doritos Locos Taco",
        "serving": "1 taco",
        "calories": 170,
        "protein": 8,
        "carbs": 13,
        "fat": 9,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:crunchwrap-supreme",
        "name": "Crunchwrap Supreme",
        "serving": "1 crunchwrap",
        "calories": 530,
        "protein": 16,
        "carbs": 71,
        "fat": 21,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:beefy-5-layer-burrito",
        "name": "Beefy 5-Layer Burrito",
        "serving": "1 burrito",
        "calories": 490,
        "protein": 18,
        "carbs": 63,
        "fat": 18,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:bean-burrito",
        "name": "Bean Burrito",
        "serving": "1 burrito",
        "calories": 350,
        "protein": 13,
        "carbs": 54,
        "fat": 9,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:burrito-supreme-beef",
        "name": "Burrito Supreme (Beef)",
        "serving": "1 burrito",
        "calories": 390,
        "protein": 16,
        "carbs": 51,
        "fat": 14,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:chicken-quesadilla",
        "name": "Chicken Quesadilla",
        "serving": "1 quesadilla",
        "calories": 510,
        "protein": 27,
        "carbs": 38,
        "fat": 26,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:cheesy-gordita-crunch",
        "name": "Cheesy Gordita Crunch",
        "serving": "1 gordita",
        "calories": 500,
        "protein": 20,
        "carbs": 41,
        "fat": 28,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:chalupa-supreme-beef",
        "name": "Chalupa Supreme (Beef)",
        "serving": "1 chalupa",
        "calories": 350,
        "protein": 13,
        "carbs": 33,
        "fat": 18,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:nachos-bellgrande",
        "name": "Nachos BellGrande",
        "serving": "1 order",
        "calories": 740,
        "protein": 16,
        "carbs": 82,
        "fat": 38,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      },
      {
        "id": "taco-bell:cinnamon-twists",
        "name": "Cinnamon Twists",
        "serving": "1 order",
        "calories": 170,
        "protein": 1,
        "carbs": 27,
        "fat": 6,
        "sourceUrl": "https://www.nutrition-charts.com/taco-bell-nutrition-facts-calorie-information/"
      }
    ]
  },
  {
    "id": "texas-roadhouse",
    "name": "Texas Roadhouse",
    "items": [
      {
        "id": "texas-roadhouse:6-oz-sirloin-steak",
        "name": "6 oz Sirloin Steak",
        "serving": "1 steak (6 oz)",
        "calories": 250,
        "protein": 46,
        "carbs": 3,
        "fat": 6,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/sirloin-steak/6-oz"
      },
      {
        "id": "texas-roadhouse:12-oz-ft-worth-ribeye",
        "name": "12 oz Ft. Worth Ribeye",
        "serving": "1 steak (12 oz)",
        "calories": 960,
        "protein": 78,
        "carbs": 2,
        "fat": 72,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/ft.-worth-ribeye/12-oz"
      },
      {
        "id": "texas-roadhouse:6-oz-dallas-filet",
        "name": "6 oz Dallas Filet",
        "serving": "1 steak (6 oz)",
        "calories": 270,
        "protein": 45,
        "carbs": 6,
        "fat": 10,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/dallas-filet/6-oz"
      },
      {
        "id": "texas-roadhouse:cactus-blossom",
        "name": "Cactus Blossom",
        "serving": "1 appetizer",
        "calories": 1700,
        "protein": 27,
        "carbs": 202,
        "fat": 89,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/cactus-blossom"
      },
      {
        "id": "texas-roadhouse:rattlesnake-bites",
        "name": "Rattlesnake Bites",
        "serving": "1 appetizer",
        "calories": 560,
        "protein": 25,
        "carbs": 34,
        "fat": 36,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/rattlesnake-bites"
      },
      {
        "id": "texas-roadhouse:country-fried-chicken",
        "name": "Country Fried Chicken",
        "serving": "1 entree",
        "calories": 750,
        "protein": 47,
        "carbs": 43,
        "fat": 43,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/country-fried-chicken"
      },
      {
        "id": "texas-roadhouse:grilled-bbq-chicken",
        "name": "Grilled BBQ Chicken",
        "serving": "1 entree",
        "calories": 260,
        "protein": 46,
        "carbs": 10,
        "fat": 3.5,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/grilled-bbq-chicken"
      },
      {
        "id": "texas-roadhouse:pulled-pork-dinner",
        "name": "Pulled Pork Dinner",
        "serving": "1 entree",
        "calories": 860,
        "protein": 80,
        "carbs": 50,
        "fat": 40,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/pulled-pork-dinner"
      },
      {
        "id": "texas-roadhouse:half-slab-fall-off-the-bone-ribs",
        "name": "Half Slab Fall-Off-The-Bone Ribs",
        "serving": "1 half slab",
        "calories": 900,
        "protein": 72,
        "carbs": 9,
        "fat": 63,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/ribs/half-slab"
      },
      {
        "id": "texas-roadhouse:smokehouse-burger",
        "name": "Smokehouse Burger",
        "serving": "1 burger",
        "calories": 1200,
        "protein": 60,
        "carbs": 62,
        "fat": 80,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/smokehouse-burger"
      },
      {
        "id": "texas-roadhouse:fresh-baked-bread-roll",
        "name": "Fresh Baked Bread (Roll)",
        "serving": "1 roll",
        "calories": 120,
        "protein": 4,
        "carbs": 24,
        "fat": 1,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/fresh-baked-bread"
      },
      {
        "id": "texas-roadhouse:loaded-sweet-potato",
        "name": "Loaded Sweet Potato",
        "serving": "1 side",
        "calories": 770,
        "protein": 7,
        "carbs": 126,
        "fat": 28,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/loaded-sweet-potato"
      },
      {
        "id": "texas-roadhouse:big-ol-brownie",
        "name": "Big Ol' Brownie",
        "serving": "1 dessert",
        "calories": 1230,
        "protein": 9,
        "carbs": 205,
        "fat": 42,
        "sourceUrl": "https://fastfoodnutrition.org/texas-roadhouse/big-ol039-brownie"
      }
    ]
  },
  {
    "id": "tropical-smoothie-cafe",
    "name": "Tropical Smoothie Cafe",
    "items": [
      {
        "id": "tropical-smoothie-cafe:mango-magic-smoothie",
        "name": "Mango Magic Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 400,
        "protein": 3,
        "carbs": 98,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/mango-magic-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:jetty-punch-smoothie",
        "name": "Jetty Punch Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 370,
        "protein": 2,
        "carbs": 94,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/jetty-punch-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:bahama-mama-smoothie",
        "name": "Bahama Mama Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 500,
        "protein": 3,
        "carbs": 117,
        "fat": 4.5,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/bahama-mama-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:sunshine-smoothie",
        "name": "Sunshine Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 390,
        "protein": 2,
        "carbs": 98,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/sunshine-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:detox-island-green-smoothie",
        "name": "Detox Island Green Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 180,
        "protein": 4,
        "carbs": 43,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/detox-island-green-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:island-green-smoothie",
        "name": "Island Green Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 410,
        "protein": 3,
        "carbs": 102,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/island-green-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:peanut-paradise-smoothie",
        "name": "Peanut Paradise Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 690,
        "protein": 33,
        "carbs": 105,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/peanut-paradise-smoothie/with-whey"
      },
      {
        "id": "tropical-smoothie-cafe:kiwi-quencher-smoothie",
        "name": "Kiwi Quencher Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 450,
        "protein": 2,
        "carbs": 111,
        "fat": 0,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/kiwi-quencher-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:avocolada-smoothie",
        "name": "Avocolada Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 600,
        "protein": 4,
        "carbs": 112,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/avocolada-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:acai-berry-boost-smoothie",
        "name": "Acai Berry Boost Smoothie",
        "serving": "24 fl oz smoothie",
        "calories": 470,
        "protein": 1,
        "carbs": 114,
        "fat": 2,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/acai-berry-boost-smoothie"
      },
      {
        "id": "tropical-smoothie-cafe:caribbean-jerk-chicken-toasted-wrap",
        "name": "Caribbean Jerk Chicken Toasted Wrap",
        "serving": "1 wrap",
        "calories": 590,
        "protein": 37,
        "carbs": 74,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/caribbean-jerk-chicken-toasted-wrap"
      },
      {
        "id": "tropical-smoothie-cafe:baja-chicken-toasted-wrap",
        "name": "Baja Chicken Toasted Wrap",
        "serving": "1 wrap",
        "calories": 640,
        "protein": 38,
        "carbs": 67,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/baja-chicken-toasted-wrap"
      },
      {
        "id": "tropical-smoothie-cafe:chipotle-chicken-club-toasted-flatbread",
        "name": "Chipotle Chicken Club Toasted Flatbread",
        "serving": "1 flatbread",
        "calories": 490,
        "protein": 27,
        "carbs": 42,
        "fat": 24,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/chipotle-chicken-club-toasted-flatbread"
      },
      {
        "id": "tropical-smoothie-cafe:turkey-bacon-ranch-pressed-sandwich",
        "name": "Turkey Bacon Ranch Pressed Sandwich",
        "serving": "1 Serving",
        "calories": 560,
        "protein": 42,
        "carbs": 59,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/tropical-smoothie-cafe/turkey-bacon-ranch-pressed-sandwich/whole"
      }
    ]
  },
  {
    "id": "wendys",
    "name": "Wendy's",
    "items": [
      {
        "id": "wendys:daves-single",
        "name": "Dave's Single",
        "serving": "1 sandwich",
        "calories": 570,
        "protein": 30,
        "carbs": 40,
        "fat": 34,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:daves-double",
        "name": "Dave's Double",
        "serving": "1 sandwich",
        "calories": 810,
        "protein": 49,
        "carbs": 41,
        "fat": 51,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:baconator",
        "name": "Baconator",
        "serving": "1 sandwich",
        "calories": 950,
        "protein": 59,
        "carbs": 40,
        "fat": 62,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:jr-bacon-cheeseburger",
        "name": "Jr. Bacon Cheeseburger",
        "serving": "1 sandwich",
        "calories": 380,
        "protein": 19,
        "carbs": 25,
        "fat": 22,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:spicy-chicken-sandwich",
        "name": "Spicy Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 510,
        "protein": 29,
        "carbs": 54,
        "fat": 20,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:crispy-chicken-sandwich",
        "name": "Crispy Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 330,
        "protein": 14,
        "carbs": 33,
        "fat": 16,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:chicken-nuggets-10-piece",
        "name": "Chicken Nuggets (10 piece)",
        "serving": "10 pieces",
        "calories": 420,
        "protein": 22,
        "carbs": 24,
        "fat": 27,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:natural-cut-fries-medium",
        "name": "Natural-Cut Fries (Medium)",
        "serving": "1 medium order",
        "calories": 420,
        "protein": 6,
        "carbs": 56,
        "fat": 19,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:chili-small",
        "name": "Chili (Small)",
        "serving": "1 small cup",
        "calories": 170,
        "protein": 15,
        "carbs": 16,
        "fat": 5,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:chili-large",
        "name": "Chili (Large)",
        "serving": "1 large cup",
        "calories": 250,
        "protein": 23,
        "carbs": 23,
        "fat": 7,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:plain-baked-potato",
        "name": "Plain Baked Potato",
        "serving": "1 potato",
        "calories": 270,
        "protein": 7,
        "carbs": 61,
        "fat": 0,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      },
      {
        "id": "wendys:classic-chocolate-frosty-medium",
        "name": "Classic Chocolate Frosty (Medium)",
        "serving": "1 medium",
        "calories": 470,
        "protein": 13,
        "carbs": 79,
        "fat": 12,
        "sourceUrl": "https://www.nutrition-charts.com/wendys-nutrition-facts/"
      }
    ]
  },
  {
    "id": "whataburger",
    "name": "Whataburger",
    "items": [
      {
        "id": "whataburger:whataburger",
        "name": "Whataburger",
        "serving": "1 burger",
        "calories": 590,
        "protein": 29,
        "carbs": 62,
        "fat": 25,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:double-meat-whataburger",
        "name": "Double Meat Whataburger",
        "serving": "1 burger",
        "calories": 830,
        "protein": 47,
        "carbs": 62,
        "fat": 44,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:bacon-cheese-whataburger",
        "name": "Bacon & Cheese Whataburger",
        "serving": "1 burger",
        "calories": 750,
        "protein": 39,
        "carbs": 62,
        "fat": 37,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:whataburger-jr",
        "name": "Whataburger Jr.",
        "serving": "1 burger",
        "calories": 310,
        "protein": 14,
        "carbs": 37,
        "fat": 11,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:whataburger-patty-melt",
        "name": "Whataburger Patty Melt",
        "serving": "1 sandwich",
        "calories": 940,
        "protein": 49,
        "carbs": 45,
        "fat": 61,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:whatachickn-sandwich-with-whatasauce",
        "name": "Whatachick'n Sandwich with Whatasauce",
        "serving": "1 sandwich",
        "calories": 540,
        "protein": 32,
        "carbs": 54,
        "fat": 22,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:whatachickn-strips-3",
        "name": "Whatachick'n Strips (3)",
        "serving": "3 strips",
        "calories": 460,
        "protein": 24,
        "carbs": 30,
        "fat": 27,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:honey-butter-chicken-biscuit",
        "name": "Honey Butter Chicken Biscuit",
        "serving": "1 biscuit sandwich",
        "calories": 580,
        "protein": 13,
        "carbs": 52,
        "fat": 36,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:breakfast-on-a-bun-with-sausage",
        "name": "Breakfast On A Bun with Sausage",
        "serving": "1 sandwich",
        "calories": 510,
        "protein": 27,
        "carbs": 35,
        "fat": 28,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:taquito-with-cheese-bacon",
        "name": "Taquito with Cheese & Bacon",
        "serving": "1 taquito",
        "calories": 400,
        "protein": 20,
        "carbs": 29,
        "fat": 23,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:medium-french-fries",
        "name": "Medium French Fries",
        "serving": "1 medium order",
        "calories": 400,
        "protein": 4,
        "carbs": 51,
        "fat": 21,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:medium-onion-rings",
        "name": "Medium Onion Rings",
        "serving": "1 medium order",
        "calories": 300,
        "protein": 4,
        "carbs": 33,
        "fat": 17,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:medium-chocolate-shake",
        "name": "Medium Chocolate Shake",
        "serving": "20 fl oz",
        "calories": 560,
        "protein": 13,
        "carbs": 102,
        "fat": 14,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      },
      {
        "id": "whataburger:hot-apple-pie",
        "name": "Hot Apple Pie",
        "serving": "1 pie",
        "calories": 270,
        "protein": 3,
        "carbs": 34,
        "fat": 14,
        "sourceUrl": "https://wbimageserver.whataburger.com/Nutrition.pdf"
      }
    ]
  },
  {
    "id": "wingstop",
    "name": "Wingstop",
    "items": [
      {
        "id": "wingstop:classic-wing-lemon-pepper",
        "name": "Classic Wing, Lemon Pepper",
        "serving": "1 wing (35g)",
        "calories": 120,
        "protein": 10,
        "carbs": 0,
        "fat": 8,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:classic-wing-original-hot",
        "name": "Classic Wing, Original Hot",
        "serving": "1 wing (38g)",
        "calories": 90,
        "protein": 10,
        "carbs": 0,
        "fat": 5,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:classic-wing-garlic-parmesan",
        "name": "Classic Wing, Garlic Parmesan",
        "serving": "1 wing (36g)",
        "calories": 120,
        "protein": 10,
        "carbs": 1,
        "fat": 8,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:classic-wing-hickory-smoked-bbq",
        "name": "Classic Wing, Hickory Smoked BBQ",
        "serving": "1 wing (40g)",
        "calories": 100,
        "protein": 10,
        "carbs": 4,
        "fat": 5,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:boneless-wing-lemon-pepper",
        "name": "Boneless Wing, Lemon Pepper",
        "serving": "1 piece (30g)",
        "calories": 110,
        "protein": 4,
        "carbs": 6,
        "fat": 7,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:boneless-wing-hickory-smoked-bbq",
        "name": "Boneless Wing, Hickory Smoked BBQ",
        "serving": "1 piece (34g)",
        "calories": 90,
        "protein": 5,
        "carbs": 9,
        "fat": 4.5,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:chicken-tender-original-hot",
        "name": "Chicken Tender, Original Hot",
        "serving": "1 tender (73g)",
        "calories": 140,
        "protein": 10,
        "carbs": 10,
        "fat": 7,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:chicken-tender-lemon-pepper",
        "name": "Chicken Tender, Lemon Pepper",
        "serving": "1 tender (65g)",
        "calories": 200,
        "protein": 10,
        "carbs": 10,
        "fat": 13,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:chicken-sandwich-plain",
        "name": "Chicken Sandwich, Plain",
        "serving": "1 sandwich (241g)",
        "calories": 610,
        "protein": 32,
        "carbs": 66,
        "fat": 24,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:seasoned-fries-regular",
        "name": "Seasoned Fries (Regular)",
        "serving": "1 regular (191g)",
        "calories": 500,
        "protein": 8,
        "carbs": 69,
        "fat": 21,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:cheese-fries-regular",
        "name": "Cheese Fries (Regular)",
        "serving": "1 regular (255g)",
        "calories": 580,
        "protein": 9,
        "carbs": 75,
        "fat": 27,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:louisiana-voodoo-fries-regular",
        "name": "Louisiana Voodoo Fries (Regular)",
        "serving": "1 regular (283g)",
        "calories": 680,
        "protein": 9,
        "carbs": 75,
        "fat": 38,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:ranch-dip",
        "name": "Ranch Dip",
        "serving": "3.25 oz cup (85g)",
        "calories": 320,
        "protein": 1,
        "carbs": 2,
        "fat": 34,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      },
      {
        "id": "wingstop:brownie",
        "name": "Brownie",
        "serving": "1 brownie (98g)",
        "calories": 430,
        "protein": 6,
        "carbs": 49,
        "fat": 24,
        "sourceUrl": "https://s3.amazonaws.com/wingstop.com/assets/static/WSR18-0009-Corporate-NutritionalGuide-JumboWings-HR_OFFICAL.pdf"
      }
    ]
  },
  {
    "id": "zaxbys",
    "name": "Zaxby's",
    "items": [
      {
        "id": "zaxbys:chicken-fingerz-5-piece",
        "name": "Chicken Fingerz (5 piece)",
        "serving": "5 fingerz",
        "calories": 610,
        "protein": 46,
        "carbs": 19,
        "fat": 39,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/chicken-fingerz/5-piece"
      },
      {
        "id": "zaxbys:boneless-wings-5-piece",
        "name": "Boneless Wings (5 piece)",
        "serving": "5 wings",
        "calories": 480,
        "protein": 20,
        "carbs": 23,
        "fat": 35,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/boneless-wings/5-piece"
      },
      {
        "id": "zaxbys:traditional-buffalo-wings-5-piece",
        "name": "Traditional Buffalo Wings (5 piece)",
        "serving": "5 wings",
        "calories": 540,
        "protein": 40,
        "carbs": 3,
        "fat": 41,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/buffalo-wings/5-piece"
      },
      {
        "id": "zaxbys:signature-chicken-sandwich",
        "name": "Signature Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 780,
        "protein": 45,
        "carbs": 53,
        "fat": 43,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/signature-chicken-sandwich"
      },
      {
        "id": "zaxbys:signature-spicy-chicken-sandwich",
        "name": "Signature Spicy Chicken Sandwich",
        "serving": "1 sandwich",
        "calories": 770,
        "protein": 45,
        "carbs": 53,
        "fat": 42,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/signature-spicy-chicken-sandwich"
      },
      {
        "id": "zaxbys:crinkle-fries-regular",
        "name": "Crinkle Fries (Regular)",
        "serving": "1 regular order",
        "calories": 360,
        "protein": 6,
        "carbs": 48,
        "fat": 16,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/crinkle-fries/regular"
      },
      {
        "id": "zaxbys:basket-of-texas-toast",
        "name": "Basket of Texas Toast",
        "serving": "1 basket",
        "calories": 440,
        "protein": 10,
        "carbs": 60,
        "fat": 20,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/basket-of-texas-toast"
      },
      {
        "id": "zaxbys:fried-pickles",
        "name": "Fried Pickles",
        "serving": "1 order",
        "calories": 860,
        "protein": 7,
        "carbs": 54,
        "fat": 69,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/fried-pickles"
      },
      {
        "id": "zaxbys:cobb-zalad-with-fried-chicken",
        "name": "Cobb Zalad with Fried Chicken",
        "serving": "1 salad",
        "calories": 875,
        "protein": 58,
        "carbs": 45,
        "fat": 50,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/cobb-salad/w-fried-chicken"
      },
      {
        "id": "zaxbys:zax-sauce",
        "name": "Zax Sauce",
        "serving": "1 serving",
        "calories": 180,
        "protein": 0,
        "carbs": 6,
        "fat": 17,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/zax-sauce"
      },
      {
        "id": "zaxbys:birthday-cake-milkshake",
        "name": "Birthday Cake Milkshake",
        "serving": "1 shake",
        "calories": 860,
        "protein": 10,
        "carbs": 115,
        "fat": 38,
        "sourceUrl": "https://fastfoodnutrition.org/zaxbys/birthday-cake-milkshake"
      }
    ]
  }
];

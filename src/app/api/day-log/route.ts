import { z } from "zod";
import {
  deleteDayMeal,
  loadDayMeals,
  saveMeal,
  updateDayMealItem,
} from "@/lib/day-log-repository";
import { todayIsoDate } from "@/lib/fuelwell-data";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const uuidSchema = z.string().uuid();
const nonNegativeNumber = z.number().finite().nonnegative();
const mealItemSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1).max(200),
  servings: nonNegativeNumber,
  calories: nonNegativeNumber,
  protein: nonNegativeNumber,
  carbs: nonNegativeNumber,
  fat: nonNegativeNumber,
});
const mealSchema = z.object({
  id: uuidSchema,
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  name: z.string().trim().min(1).max(200),
  loggedAt: z.string().datetime(),
  items: z.array(mealItemSchema).max(100),
});
const itemPatchSchema = mealItemSchema.omit({ id: true }).partial().refine(
  (patch) => Object.keys(patch).length > 0,
  "At least one item field is required.",
);

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Day log request failed.";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ signedIn: false, meals: [] });

  const url = new URL(request.url);
  const parsedDate = dateSchema.safeParse(url.searchParams.get("date") ?? todayIsoDate());
  if (!parsedDate.success) {
    return Response.json({ error: "Invalid day log date." }, { status: 400 });
  }

  try {
    const meals = await loadDayMeals(auth.supabase, auth.userId, parsedDate.data);
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsedDate.data,
      meals,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = z.object({ date: dateSchema, meal: mealSchema }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid meal payload." }, { status: 400 });
  }

  try {
    const meals = await saveMeal(auth.supabase, auth.userId, parsed.data.date, parsed.data.meal);
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      meals,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = z.object({
    date: dateSchema,
    mealId: uuidSchema,
    itemId: uuidSchema,
    patch: itemPatchSchema,
  }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid meal item update." }, { status: 400 });
  }

  try {
    const meals = await updateDayMealItem(
      auth.supabase,
      auth.userId,
      parsed.data.date,
      parsed.data.mealId,
      parsed.data.itemId,
      parsed.data.patch,
    );
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      meals,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = z.object({ date: dateSchema, mealId: uuidSchema }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid meal delete request." }, { status: 400 });
  }

  try {
    const meals = await deleteDayMeal(
      auth.supabase,
      auth.userId,
      parsed.data.date,
      parsed.data.mealId,
    );
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      meals,
    });
  } catch (error) {
    return failure(error);
  }
}

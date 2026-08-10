import { z } from "zod";
import { loadWeeklyMealPlan, replaceWeeklyMealPlan } from "@/lib/meal-plan-repository";
import { planDaysSchema, weekStartSchema } from "@/lib/meal-plan-types";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Meal plan request failed.";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ signedIn: false, days: [] });

  const parsedWeek = weekStartSchema.safeParse(
    new URL(request.url).searchParams.get("weekStart"),
  );
  if (!parsedWeek.success) {
    return Response.json({ error: "Invalid meal plan week." }, { status: 400 });
  }

  try {
    const days = await loadWeeklyMealPlan(auth.supabase, auth.userId, parsedWeek.data);
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      weekStart: parsedWeek.data,
      days,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = z.object({
    weekStart: weekStartSchema,
    days: planDaysSchema,
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid meal plan payload." }, { status: 400 });
  }

  try {
    const days = await replaceWeeklyMealPlan(
      auth.supabase,
      auth.userId,
      parsed.data.weekStart,
      parsed.data.days,
    );
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      weekStart: parsed.data.weekStart,
      days,
    });
  } catch (error) {
    return failure(error);
  }
}

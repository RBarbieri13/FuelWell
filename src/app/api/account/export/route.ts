import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/preview-session";
import {
  buildAccountExportPayload,
  createExportHeaders,
  createJsonError,
} from "@/app/api/account/shared";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return createJsonError("Supabase is not configured for account export.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createJsonError("Authentication required.", 401);
  }

  try {
    const basePayload = await buildAccountExportPayload(supabase, user);
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from("user_weekly_meal_plans")
      .select("*")
      .eq("user_id", user.id);
    if (mealPlansError) {
      throw new Error(`Failed to export user_weekly_meal_plans: ${mealPlansError.message}`);
    }
    const payload = {
      ...basePayload,
      tables: {
        ...basePayload.tables,
        user_weekly_meal_plans: mealPlans ?? [],
      },
    };
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: createExportHeaders(),
    });
  } catch (error) {
    return createJsonError(
      error instanceof Error ? error.message : "Account export failed.",
      500,
    );
  }
}

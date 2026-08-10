import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const mealPlanSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260810014631_user_weekly_meal_plans.sql"),
  "utf8",
);
const accountSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260809173000_account_controls_and_authenticated_grants.sql"),
  "utf8",
);

describe("user weekly meal plans migration", () => {
  it("creates one indexed weekly plan per user with cascade deletion", () => {
    expect(mealPlanSql).toContain("CREATE TABLE public.user_weekly_meal_plans");
    expect(mealPlanSql).toContain("REFERENCES public.profiles(id) ON DELETE CASCADE");
    expect(mealPlanSql).toContain("UNIQUE (user_id, week_start)");
    expect(mealPlanSql).toContain("CHECK (jsonb_typeof(plan_days) = 'array')");
    expect(mealPlanSql).toContain("user_weekly_meal_plans_user_week_idx");
  });

  it("enables owner-only RLS and authenticated CRUD grants", () => {
    expect(mealPlanSql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(mealPlanSql).toContain(
      "REVOKE ALL ON TABLE public.user_weekly_meal_plans FROM anon, authenticated",
    );
    expect(mealPlanSql).toContain("TO authenticated");
    expect(mealPlanSql.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(5);
    for (const operation of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
      expect(mealPlanSql).toContain(`FOR ${operation} TO authenticated`);
    }
  });

  it("is covered by the self-delete RPC cascade path", () => {
    expect(accountSql).toContain("DELETE FROM auth.users");
    expect(mealPlanSql).toContain("REFERENCES public.profiles(id) ON DELETE CASCADE");
    expect(mealPlanSql).toContain("delete_own_account() RPC");
  });
});

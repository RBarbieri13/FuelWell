import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260809173000_account_controls_and_authenticated_grants.sql",
);
const sql = readFileSync(migrationPath, "utf8");

const grantedTables = [
  "profiles",
  "daily_logs",
  "foods",
  "meals",
  "meal_items",
  "recipes",
  "recipe_ingredients",
  "user_goals",
  "progress_photos",
  "ai_conversations",
  "coach_conversations",
  "coach_messages",
  "coach_usage",
  "coach_audit",
  "goal_plans",
  "goal_events",
  "connected_accounts",
  "integration_daily_summaries",
  "daily_goal_contexts",
  "coach_knowledge_bases",
] as const;

describe("account controls Supabase migration", () => {
  it("backfills explicit anon-select and authenticated CRUD grants for legacy app tables", () => {
    for (const table of grantedTables) {
      expect(sql).toContain(`REVOKE ALL ON TABLE public.${table} FROM anon, authenticated;`);
      expect(sql).toContain(`GRANT SELECT ON TABLE public.${table} TO anon;`);
      expect(sql).toContain(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.${table} TO authenticated;`,
      );
    }
  });

  it("adds a security-definer self-delete function that clears storage objects and auth rows", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.delete_own_account()");
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("DELETE FROM storage.objects");
    expect(sql).toContain("bucket_id = 'coach-artifacts'");
    expect(sql).toContain("DELETE FROM auth.users");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;");
    expect(sql).toContain("GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;");
  });

  it("does not require a service-role credential in application code", () => {
    expect(sql).not.toContain("service_role");
    expect(sql).not.toContain("SUPABASE_SERVICE_ROLE");
  });
});

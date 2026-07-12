import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260712200713_fitness_grocery_foundation.sql"
);
const sql = readFileSync(migrationPath, "utf8");

const userOwnedTables = [
  "workout_sessions",
  "workout_exercises",
  "workout_sets",
  "activity_entries",
  "grocery_lists",
  "grocery_items",
] as const;

function policy(table: string, operation: "select" | "insert" | "update" | "delete") {
  const start = sql.indexOf(`CREATE POLICY "${table}_${operation}_own"`);
  expect(start, `${table} ${operation} policy`).toBeGreaterThanOrEqual(0);
  const end = sql.indexOf(";", start);
  return sql.slice(start, end + 1);
}

describe("fitness and grocery Supabase migration", () => {
  it("creates every requested table and enables RLS before exposing it", () => {
    for (const table of [...userOwnedTables, "recipe_quality_status"]) {
      expect(sql).toContain(`CREATE TABLE public.${table}`);
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      expect(sql).toContain(`REVOKE ALL ON TABLE public.${table} FROM anon, authenticated;`);
      expect(sql).toContain(
        `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.${table} TO authenticated;`
      );
    }
  });

  it("uses explicit authenticated CRUD policies with ownership checks", () => {
    for (const table of userOwnedTables) {
      const select = policy(table, "select");
      const insert = policy(table, "insert");
      const update = policy(table, "update");
      const remove = policy(table, "delete");

      expect(select).toMatch(/FOR SELECT TO authenticated/);
      expect(select).toContain("USING ((SELECT auth.uid()) = user_id)");
      expect(insert).toMatch(/FOR INSERT TO authenticated/);
      expect(insert).toContain("WITH CHECK ((SELECT auth.uid()) = user_id)");
      expect(update).toMatch(/FOR UPDATE TO authenticated/);
      expect(update).toContain("USING ((SELECT auth.uid()) = user_id)");
      expect(update).toContain("WITH CHECK ((SELECT auth.uid()) = user_id)");
      expect(remove).toMatch(/FOR DELETE TO authenticated/);
      expect(remove).toContain("USING ((SELECT auth.uid()) = user_id)");
    }

    expect(sql).not.toMatch(/CREATE POLICY[\s\S]*?FOR ALL/);
    expect(sql).not.toContain("auth.role()");
    expect(sql).not.toContain("service_role");
  });

  it("preserves ownership across child rows and supplies retry-safe uniqueness", () => {
    expect(sql).toContain("FOREIGN KEY (workout_session_id, user_id)");
    expect(sql).toContain("FOREIGN KEY (workout_exercise_id, workout_session_id, user_id)");
    expect(sql).toContain("FOREIGN KEY (grocery_list_id, user_id)");

    for (const table of userOwnedTables) {
      expect(sql).toContain(`${table}_user_idempotency_key UNIQUE (user_id, idempotency_key)`);
    }

    expect(sql).toContain("grocery_lists_user_date_name_key UNIQUE (user_id, list_date, name)");
    expect(sql).toContain("activity_entries_user_source_external_key");
    expect(sql).toContain("workout_sessions_user_date_idx");
    expect(sql).toContain("activity_entries_user_date_idx");
    expect(sql).toContain("grocery_lists_user_date_idx");
  });

  it("keeps recipe approval admin-controlled and fail-closed for recommendations", () => {
    expect(sql).toContain("recommendation_eligible BOOLEAN GENERATED ALWAYS AS");
    expect(sql).toContain("status = 'approved' AND quality_score >= 0.800");
    expect(sql).toContain("WHERE recommendation_eligible = TRUE");

    for (const operation of ["insert", "update", "delete"] as const) {
      const start = sql.indexOf(`CREATE POLICY "recipe_quality_status_${operation}_admin"`);
      expect(start).toBeGreaterThanOrEqual(0);
      const end = sql.indexOf(";", start);
      const block = sql.slice(start, end + 1);
      expect(block).toContain("TO authenticated");
      expect(block).toContain("auth.jwt() -> 'app_metadata' ->> 'role'");
      expect(block).not.toContain("user_metadata");
    }

    const updateStart = sql.indexOf('CREATE POLICY "recipe_quality_status_update_admin"');
    const updateEnd = sql.indexOf(";", updateStart);
    const update = sql.slice(updateStart, updateEnd + 1);
    expect(update).toContain("USING");
    expect(update).toContain("WITH CHECK");
  });

  it("documents rollback order without executing a down migration", () => {
    expect(sql).toContain("-- Down guidance (manual rollback");
    expect(sql).toContain("-- DROP TABLE IF EXISTS public.recipe_quality_status;");
    expect(sql).not.toMatch(/^DROP TABLE/m);
  });
});

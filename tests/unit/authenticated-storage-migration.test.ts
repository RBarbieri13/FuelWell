import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260810040034_server_authoritative_user_app_state.sql",
);
const sql = readFileSync(migrationPath, "utf8");

describe("authenticated storage migration", () => {
  it("creates a per-user state table with a constrained store namespace", () => {
    expect(sql).toMatch(/CREATE TABLE public\.user_app_state/i);
    expect(sql).toMatch(/PRIMARY KEY \(user_id, store_key\)/i);
    expect(sql).toMatch(/REFERENCES public\.profiles\(id\) ON DELETE CASCADE/i);
    expect(sql).toContain("'onboarding_draft'");
    expect(sql).toContain("'grocery_history'");
  });

  it("enforces own-row RLS for every CRUD operation", () => {
    expect(sql).toMatch(/ALTER TABLE public\.user_app_state ENABLE ROW LEVEL SECURITY/i);
    for (const operation of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
      expect(sql).toMatch(new RegExp(`FOR ${operation} TO authenticated`, "i"));
    }
    expect(sql.match(/\(SELECT auth\.uid\(\)\) = user_id/gi)?.length).toBeGreaterThanOrEqual(5);
    expect(sql).toMatch(/REVOKE ALL ON TABLE public\.user_app_state FROM anon, authenticated/i);
  });

  it("uses an authenticated, invoker-rights RPC for atomic preference merges", () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.merge_own_profile_preferences/i);
    expect(sql).toMatch(/SECURITY INVOKER/i);
    expect(sql).toMatch(/WHERE id = \(SELECT auth\.uid\(\)\)/i);
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.merge_own_profile_preferences\(JSONB\) FROM PUBLIC, anon/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.merge_own_profile_preferences\(JSONB\) TO authenticated/i);
  });
});

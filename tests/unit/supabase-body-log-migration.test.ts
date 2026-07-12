import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(
  process.cwd(),
  "supabase/migrations/20260712213000_body_log_entries.sql",
), "utf8");

describe("body log Supabase migration", () => {
  it("creates a UUID-idempotent daily body log with measurement checks", () => {
    expect(sql).toContain("CREATE TABLE public.body_log_entries");
    expect(sql).toContain("idempotency_key UUID NOT NULL");
    expect(sql).toContain("body_log_entries_user_date_key UNIQUE (user_id, entry_date)");
    expect(sql).toContain("body_log_entries_user_idempotency_key UNIQUE (user_id, idempotency_key)");
    expect(sql).toContain("body_log_entries_has_measurement");
    expect(sql).toContain("weight_kg IS NOT NULL OR mood IS NOT NULL OR water_ml IS NOT NULL");
  });

  it("uses explicit authenticated CRUD policies and no anonymous access", () => {
    expect(sql).toContain("ALTER TABLE public.body_log_entries ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("REVOKE ALL ON TABLE public.body_log_entries FROM anon, authenticated;");
    expect(sql).toContain("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.body_log_entries TO authenticated;");
    for (const operation of ["select", "insert", "update", "delete"]) {
      expect(sql).toContain(`CREATE POLICY "body_log_entries_${operation}_own"`);
    }
    expect(sql.match(/\(SELECT auth\.uid\(\)\) = user_id/g)).toHaveLength(5);
    expect(sql).not.toContain("FOR ALL");
    expect(sql).not.toContain("service_role");
  });
});

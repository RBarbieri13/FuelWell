import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const script = readFileSync(
  resolve(process.cwd(), "tools/supabase/apply-migrations.sh"),
  "utf8"
);

describe("Supabase migration runner", () => {
  it("uses the canonical web migration directory by default", () => {
    expect(script).toContain('${repo_root}/supabase/migrations');
    expect(script).not.toContain('${repo_root}/ios/supabase/migrations');
  });

  it("uses Supabase's canonical migration ledger and never creates a shadow ledger", () => {
    expect(script).toContain("supabase_migrations.schema_migrations");
    expect(script).not.toContain("public.schema_migrations");
    expect(script).not.toContain("create table if not exists");
  });

  it("applies each migration and its canonical ledger entry in one transaction", () => {
    expect(script).toContain("insert into supabase_migrations.schema_migrations (version, name, statements)");
    expect(script).toContain("on conflict (version) do nothing");
    expect(script).toContain("--single-transaction");
    expect(script).toContain('apply_migration_atomically "${migration}" "${canonical_version}" "${migration_name}"');
  });

  it("uses durable canonical names across environments and aliases the renamed migration", () => {
    expect(script).toContain("canonical_name_for");
    expect(script).toContain('20260612120000_profiles_preferences_jsonb.sql) echo "add_profiles_preferences_jsonb"');
    expect(script).toContain("applied_version_for_name");
    expect(script).toContain("canonical migration name '${canonical_name}' is duplicated");
  });

  it("fails closed when the canonical ledger is absent", () => {
    expect(script).toContain("canonical_ledger_exists");
    expect(script).toContain("Refusing to continue because supabase_migrations.schema_migrations is missing");
  });

  it("fails both plan and apply when files differ from the reviewed checksum manifest", () => {
    expect(script).toContain('manifest_mismatch=1');
    expect(script).toContain('if [[ "${manifest_mismatch}" == "1" ]]');
    expect(script).toContain("Refusing to continue because migration files differ from the reviewed manifest");
  });
});

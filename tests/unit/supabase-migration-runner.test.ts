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

  it("upserts an immutable version ledger after each successful apply", () => {
    expect(script).toContain("insert into public.schema_migrations (version, name, checksum)");
    expect(script).toContain("on conflict (version) do update");
    expect(script).toContain('record_checksum "${version}" "${filename}" "${expected_checksum}"');
  });

  it("backfills missing checksums without replaying an applied migration", () => {
    expect(script).toContain('if [[ -z "${current_checksum}" ]]');
    expect(script).toContain('if [[ "${command_name}" == "apply" ]]');
    expect(script).toContain('record_checksum "${version}" "${filename}" "${expected_checksum}"');
  });
});

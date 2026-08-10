#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const migrationsDir = path.join(root, "supabase/migrations");
const jsonOutputPath = path.join(root, "tools/supabase/data/migration-manifest.json");
const markdownOutputPath = path.join(root, "docs/SUPABASE-MIGRATION-MANIFEST.md");
const args = new Set(process.argv.slice(2));
const writeOutputs = args.has("--write");

function migrationName(filename) {
  return filename.replace(/^\d+_/, "").replace(/\.sql$/, "");
}

function checksum(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function classifyRisk(contents) {
  const risks = [];
  const lowered = contents.toLowerCase();

  if (lowered.includes("founders_100")) {
    risks.push("touches founders_100");
  }

  if (/\bdrop\s+(table|function|policy|index)\b/i.test(contents)) {
    risks.push("destructive statement present");
  }

  if (/\bdelete\s+from\b/i.test(contents)) {
    risks.push("delete statement present");
  }

  if (/\balter\s+table\b/i.test(contents)) {
    risks.push("alters table");
  }

  if (/\bsecurity\s+definer\b/i.test(contents)) {
    risks.push("security definer function");
  }

  return risks.length > 0 ? risks : ["standard schema migration"];
}

function hasTrackingInsert(contents, version) {
  return (
    contents.includes("insert into schema_migrations") &&
    contents.includes(`'${version}'`)
  );
}

function hasIdempotencySignals(contents) {
  return /\bif\s+not\s+exists\b/i.test(contents) || /\bon\s+conflict\b/i.test(contents);
}

function buildManifest() {
  if (!existsSync(migrationsDir)) {
    throw new Error(`Missing migrations directory: ${migrationsDir}`);
  }

  const migrations = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file, index) => {
      const fullPath = path.join(migrationsDir, file);
      const contents = readFileSync(fullPath, "utf8");
      const version = file.split("_")[0];
      const sha256 = checksum(contents);

      return {
        order: index + 1,
        file,
        version,
        name: migrationName(file),
        sha256,
        bytes: Buffer.byteLength(contents, "utf8"),
        hasTrackingInsert: hasTrackingInsert(contents, version),
        hasIdempotencySignals: hasIdempotencySignals(contents),
        riskNotes: classifyRisk(contents),
      };
    });

  const duplicateVersions = migrations
    .map((migration) => migration.version)
    .filter((version, index, versions) => versions.indexOf(version) !== index);

  return {
    generatedAt: new Date().toISOString(),
    source: "supabase/migrations",
    migrationCount: migrations.length,
    duplicateVersions: [...new Set(duplicateVersions)],
    migrations,
  };
}

function renderMarkdown(manifest) {
  const lines = [
    "# Supabase Migration Manifest",
    "",
    `Generated: ${manifest.generatedAt}`,
    `Source: \`${manifest.source}\``,
    `Migration count: ${manifest.migrationCount}`,
    "",
    "This manifest is the review artifact for the W2 schema apply path. It records migration order and SHA-256 checksums without containing credentials or live database data.",
    "",
  ];

  if (manifest.duplicateVersions.length > 0) {
    lines.push("## Problems", "");
    for (const version of manifest.duplicateVersions) {
      lines.push(`- Duplicate migration version: \`${version}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Migration Order",
    "",
    "| Order | Version | Name | SHA-256 | Safety notes |",
    "|---:|---|---|---|---|"
  );

  for (const migration of manifest.migrations) {
    const notes = [
      migration.hasTrackingInsert ? "tracks schema_migrations" : "missing tracking insert",
      migration.hasIdempotencySignals ? "idempotency signals" : "review idempotency",
      ...migration.riskNotes,
    ].join("; ");
    lines.push(`| ${migration.order} | \`${migration.version}\` | \`${migration.name}\` | \`${migration.sha256}\` | ${notes} |`);
  }

  lines.push(
    "",
    "## Apply Guardrails",
    "",
    "- Run `tools/supabase/generate-migration-manifest.mjs --write` before applying migrations.",
    "- Run `tools/supabase/apply-migrations.sh plan` before any apply.",
    "- For production, export `founders_100` first and require Robert approval before `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1`.",
    "- After apply, rerun the staging schema evidence probe and kill-switch drill."
  );

  return `${lines.join("\n")}\n`;
}

const manifest = buildManifest();

if (writeOutputs) {
  mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
  writeFileSync(jsonOutputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(markdownOutputPath, renderMarkdown(manifest));
}

console.log(renderMarkdown(manifest));

if (manifest.duplicateVersions.length > 0) {
  process.exit(1);
}

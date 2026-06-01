#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const defaultEnvPath = path.join(process.env.HOME ?? "", ".fuelwell/supabase-staging.env");
const jsonOutputPath = path.join(root, "tools/supabase/data/staging-schema-evidence.json");
const markdownOutputPath = path.join(root, "docs/STAGING-SCHEMA-EVIDENCE.md");

const args = process.argv.slice(2);
const writeOutputs = args.includes("--write");
const strict = args.includes("--strict");
const envPath = readArg("--env") ?? defaultEnvPath;

const expectedTables = [
  "schema_migrations",
  "profiles",
  "foods",
  "meals",
  "recipes",
  "grocery_items",
  "progress_entries",
  "coach_messages",
  "restaurants",
  "feedback",
  "feature_flags",
  "subscription_entitlements",
  "founding100_reservations",
  "marketing_signups",
  "founders_100",
  "subscription_validation_events",
  "coach_usage"
];

const expectedRpcs = [
  {
    name: "reserve_founding100",
    body: {
      target_user_id: "00000000-0000-0000-0000-000000000000",
      target_email: "schema-probe@example.com"
    },
    expectedWhenPresent: ["42501", "P0001", "23514"]
  },
  {
    name: "link_marketing_signup_to_user",
    body: {
      target_user_id: "00000000-0000-0000-0000-000000000000",
      target_email: "schema-probe@example.com"
    },
    expectedWhenPresent: ["42501", "23514"]
  },
  {
    name: "delete_current_user",
    body: {},
    expectedWhenPresent: ["42501"]
  }
];

function readArg(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

function parseEnv(filePath) {
  const values = {};
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }

  return values;
}

function add(results, area, status, name, detail, evidence = {}) {
  results.push({ area, status, name, detail, ...evidence });
}

function safeProjectHost(urlValue) {
  try {
    return new URL(urlValue).host;
  } catch {
    return "invalid-url";
  }
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text.slice(0, 240) };
    }
  }

  return { response, body };
}

function classifyPostgrestError(status, body) {
  if (!body || typeof body !== "object") {
    return { code: null, message: `HTTP ${status}` };
  }

  return {
    code: body.code ?? null,
    message: body.message ?? body.error_description ?? body.error ?? `HTTP ${status}`
  };
}

async function probeTable(baseUrl, headers, table, results) {
  const url = `${baseUrl}/rest/v1/${encodeURIComponent(table)}?select=*&limit=1`;
  const { response, body } = await requestJson(url, {
    method: "GET",
    headers: {
      ...headers,
      Prefer: "count=exact"
    }
  });

  if (response.ok) {
    add(results, "table", "pass", table, "Table is reachable through PostgREST.", {
      httpStatus: response.status,
      rowCountHeader: response.headers.get("content-range") ?? null
    });
    return;
  }

  const error = classifyPostgrestError(response.status, body);
  const missing = error.code === "PGRST205" || response.status === 404;
  add(results, "table", missing ? "blocker" : "fail", table, error.message, {
    httpStatus: response.status,
    code: error.code
  });
}

async function probeRpc(baseUrl, headers, rpc, results) {
  const url = `${baseUrl}/rest/v1/rpc/${encodeURIComponent(rpc.name)}`;
  const { response, body } = await requestJson(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rpc.body)
  });

  if (response.ok) {
    add(results, "rpc", "pass", rpc.name, "RPC exists and returned successfully for the safe probe.", {
      httpStatus: response.status
    });
    return;
  }

  const error = classifyPostgrestError(response.status, body);
  if (error.code === "PGRST202") {
    add(results, "rpc", "blocker", rpc.name, error.message, {
      httpStatus: response.status,
      code: error.code
    });
    return;
  }

  if (rpc.expectedWhenPresent.includes(error.code) || response.status === 401 || response.status === 403) {
    add(results, "rpc", "pass", rpc.name, `RPC exists; safe unauthenticated probe was rejected as expected (${error.code ?? response.status}).`, {
      httpStatus: response.status,
      code: error.code
    });
    return;
  }

  add(results, "rpc", "fail", rpc.name, error.message, {
    httpStatus: response.status,
    code: error.code
  });
}

function summarize(results) {
  const counts = { pass: 0, blocker: 0, fail: 0 };
  for (const result of results) {
    counts[result.status] += 1;
  }

  return {
    counts,
    status: counts.fail > 0 ? "failed" : counts.blocker > 0 ? "schema_blocked" : "ready"
  };
}

function renderMarkdown(report) {
  const statusLabel = {
    ready: "Ready",
    schema_blocked: "Schema Blocked",
    failed: "Failed"
  }[report.status];

  const lines = [
    "# FuelWell Staging Schema Evidence",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${statusLabel}`,
    `Project host: ${report.projectHost}`,
    "",
    "This report probes the configured Supabase staging project with the anon key. It does not apply migrations, use a service-role key, mutate production data, or call Apple/payment systems.",
    "",
    "## Summary",
    "",
    `- Passed: ${report.counts.pass}`,
    `- Schema blockers: ${report.counts.blocker}`,
    `- Failures: ${report.counts.fail}`,
    "",
    "## Probe Results",
    "",
    "| Area | Status | Name | Detail | HTTP | Code |",
    "|---|---:|---|---|---:|---|"
  ];

  for (const result of report.results) {
    lines.push(`| ${result.area} | ${result.status} | ${result.name} | ${String(result.detail).replace(/\|/g, "/")} | ${result.httpStatus ?? ""} | ${result.code ?? ""} |`);
  }

  lines.push(
    "",
    "## Interpretation",
    "",
    "- `pass` means the table is reachable or the RPC exists and rejects the safe unauthenticated probe as expected.",
    "- `blocker` means the schema object is missing from PostgREST and the matching migration still needs to be applied to staging.",
    "- `fail` means the probe hit an unexpected response and should be investigated before relying on the staging project.",
    "",
    "## Next Actions",
    "",
    "- Apply missing migrations only with Robert-approved credentials and backups.",
    "- Rerun `tools/supabase/check-staging-schema.sh --write` after any staging migration apply.",
    "- Keep this report attached to W2/W3/W5 readiness decisions so live app wiring uses observed database state."
  );

  return `${lines.join("\n")}\n`;
}

const results = [];

if (!existsSync(envPath)) {
  add(results, "env", "blocker", "supabase-staging.env", `Missing env file at ${envPath}.`);
} else {
  const env = parseEnv(envPath);
  const url = env.FUELWELL_SUPABASE_URL;
  const anonKey = env.FUELWELL_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    add(results, "env", "fail", "supabase-staging.env", "Expected FUELWELL_SUPABASE_URL and FUELWELL_SUPABASE_ANON_KEY.");
  } else {
    add(results, "env", "pass", "supabase-staging.env", "Required non-secret staging values are present.");
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: "application/json"
    };

    for (const table of expectedTables) {
      await probeTable(url.replace(/\/$/, ""), headers, table, results);
    }

    for (const rpc of expectedRpcs) {
      await probeRpc(url.replace(/\/$/, ""), headers, rpc, results);
    }
  }
}

const summary = summarize(results);
const envValues = existsSync(envPath) ? parseEnv(envPath) : {};
const report = {
  generatedAt: new Date().toISOString(),
  status: summary.status,
  counts: summary.counts,
  projectHost: envValues.FUELWELL_SUPABASE_URL ? safeProjectHost(envValues.FUELWELL_SUPABASE_URL) : null,
  envPath: envPath.replace(process.env.HOME ?? "", "~"),
  results
};

if (writeOutputs) {
  mkdirSync(path.dirname(jsonOutputPath), { recursive: true });
  writeFileSync(jsonOutputPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownOutputPath, renderMarkdown(report));
}

console.log(renderMarkdown(report));

if (report.status === "failed") {
  process.exit(1);
}

if (report.status === "schema_blocked") {
  process.exit(strict ? 1 : 3);
}

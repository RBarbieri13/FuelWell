#!/usr/bin/env node

const fs = require("fs");

function parseArgs(argv) {
  const args = {
    days: 7,
    env: process.env.FUELWELL_SUPABASE_ENV_FILE || `${process.env.HOME}/.fuelwell/supabase-staging.env`,
    limit: 50
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--days") args.days = Number(argv[++index]);
    else if (arg === "--env") args.env = argv[++index];
    else if (arg === "--limit") args.limit = Number(argv[++index]);
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: tools/operate/triage-feedback.js [--env PATH] [--days N] [--limit N]

Reads FuelWell pilot feedback from Supabase and prints a markdown triage summary.
Requires FUELWELL_SUPABASE_URL and either FUELWELL_SUPABASE_SERVICE_ROLE_KEY or
FUELWELL_SUPABASE_ANON_KEY. The key value is never printed.`);
}

function loadEnvFile(path) {
  if (!path || !fs.existsSync(path)) return {};

  const result = {};
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equals = trimmed.indexOf("=");
    if (equals === -1) continue;

    const key = trimmed.slice(0, equals).trim();
    const rawValue = trimmed.slice(equals + 1).trim();
    result[key] = rawValue.replace(/^["']|["']$/g, "");
  }

  return result;
}

function classifyFeedback(report) {
  const text = `${report.route || ""} ${report.message || ""}`.toLowerCase();

  if (/(crash|freeze|stuck|blank|cannot open|won't open)/.test(text)) return "Reliability";
  if (/(wrong|incorrect|bad advice|unsafe|allergy|medical)/.test(text)) return "Safety";
  if (/(confusing|unclear|hard to|where do i|don't understand)/.test(text)) return "Usability";
  if (/(macro|calorie|protein|meal|recipe|grocery|restaurant)/.test(text)) return "Nutrition";
  if (/(coach|chat|nudge|notification|reminder)/.test(text)) return "Coaching";
  if (/(slow|lag|performance|battery)/.test(text)) return "Performance";
  return "General";
}

function severityFor(report) {
  const text = `${report.route || ""} ${report.message || ""}`.toLowerCase();

  if (/(crash|unsafe|allergy|medical|cannot sign in|data loss)/.test(text)) return "P0/P1";
  if (/(wrong|stuck|freeze|blank|bad advice|cannot log)/.test(text)) return "P2";
  if (/(confusing|slow|unclear|missing)/.test(text)) return "P3";
  return "P4";
}

function summarize(reports, days) {
  const buckets = new Map();
  const severities = new Map();

  for (const report of reports) {
    const bucket = classifyFeedback(report);
    const severity = severityFor(report);
    buckets.set(bucket, [...(buckets.get(bucket) || []), report]);
    severities.set(severity, (severities.get(severity) || 0) + 1);
  }

  console.log(`# FuelWell Pilot Feedback Triage`);
  console.log("");
  console.log(`Window: last ${days} day(s)`);
  console.log(`Reports reviewed: ${reports.length}`);
  console.log("");

  console.log("## Severity Mix");
  for (const severity of ["P0/P1", "P2", "P3", "P4"]) {
    console.log(`- ${severity}: ${severities.get(severity) || 0}`);
  }
  console.log("");

  console.log("## Buckets");
  for (const [bucket, items] of [...buckets.entries()].sort((left, right) => right[1].length - left[1].length)) {
    console.log(`### ${bucket} (${items.length})`);
    for (const item of items.slice(0, 5)) {
      const date = item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : "unknown-date";
      const route = item.route || "unknown-route";
      const message = (item.message || "").replace(/\s+/g, " ").slice(0, 180);
      console.log(`- ${severityFor(item)} | ${date} | ${route} | ${message}`);
    }
    if (items.length > 5) console.log(`- ...${items.length - 5} more`);
    console.log("");
  }

  console.log("## Suggested Actions");
  const urgent = reports.filter((report) => severityFor(report) === "P0/P1");
  if (urgent.length > 0) {
    console.log("- Open an incident and assign an owner before any feature work continues.");
  }
  if ((buckets.get("Safety") || []).length > 0) {
    console.log("- Review safety feedback for possible kill-switch activation or prompt hardening.");
  }
  if ((buckets.get("Usability") || []).length >= 3) {
    console.log("- Bundle the top usability theme into the next design pass.");
  }
  if (reports.length === 0) {
    console.log("- No feedback found. Confirm pilots can reach Help -> Send Feedback.");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fileEnv = loadEnvFile(args.env);
  const url = process.env.FUELWELL_SUPABASE_URL || fileEnv.FUELWELL_SUPABASE_URL;
  const key =
    process.env.FUELWELL_SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.FUELWELL_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.FUELWELL_SUPABASE_ANON_KEY ||
    fileEnv.FUELWELL_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Missing Supabase URL or key. Provide an env file or exported environment variables.");
    process.exit(3);
  }

  const since = new Date(Date.now() - args.days * 24 * 60 * 60 * 1000).toISOString();
  const endpoint = new URL("/rest/v1/feedback", url);
  endpoint.searchParams.set("select", "id,route,message,app_version,metadata,created_at,user_id");
  endpoint.searchParams.set("created_at", `gte.${since}`);
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", String(args.limit));

  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Feedback query failed with HTTP ${response.status}.`);
    console.error(body.slice(0, 400));
    process.exit(2);
  }

  summarize(await response.json(), args.days);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

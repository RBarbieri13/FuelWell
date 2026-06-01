#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const dashboardRoot = resolve(scriptDir, "..");
const repoRoot = resolve(dashboardRoot, "../..");
const outputJson = resolve(dashboardRoot, "data/execution-status.json");
const outputMd = resolve(repoRoot, "docs/EXECUTION-STATUS.md");

const repo = process.env.FW_REPO_SLUG ?? "RBarbieri13/FuelWell";

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  }).trim();
}

function tryRun(command, args, fallback = "") {
  try {
    return run(command, args);
  } catch {
    return fallback;
  }
}

function ghJson(args, fallback) {
  const text = tryRun("gh", args, "");
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function checkState(check) {
  if (check.__typename === "StatusContext") {
    if (check.state === "SUCCESS") return "pass";
    if (check.state === "FAILURE" || check.state === "ERROR") return "fail";
    return "pending";
  }

  if (check.status !== "COMPLETED") return "pending";
  if (check.conclusion === "SUCCESS") return "pass";
  if (check.conclusion === "SKIPPED" && check.name === "Supabase Preview") return "skipped";
  if (check.conclusion === "NEUTRAL" || check.conclusion === "SKIPPED") return "skipped";
  return "fail";
}

function summarizeChecks(checks = []) {
  const rows = checks.map((check) => ({
    name: check.name ?? check.context ?? "Unnamed check",
    state: checkState(check),
  }));
  return {
    rows,
    pass: rows.filter((row) => row.state === "pass").length,
    pending: rows.filter((row) => row.state === "pending").length,
    fail: rows.filter((row) => row.state === "fail").length,
    skipped: rows.filter((row) => row.state === "skipped").length,
  };
}

function classifyPullRequest(pr) {
  const checks = summarizeChecks(pr.statusCheckRollup);
  const mergeable = pr.mergeable === "MERGEABLE";
  if (mergeable && checks.fail === 0 && checks.pending === 0) return "ready";
  if (checks.fail > 0 || pr.mergeable === "CONFLICTING") return "blocked";
  return "in_progress";
}

function prSummary(pr) {
  const checks = summarizeChecks(pr.statusCheckRollup);
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    branch: pr.headRefName,
    base: pr.baseRefName,
    mergeable: pr.mergeable,
    reviewDecision: pr.reviewDecision || "",
    state: classifyPullRequest(pr),
    checks,
  };
}

function listOpenPullRequests() {
  return ghJson(
    [
      "pr",
      "list",
      "--repo",
      repo,
      "--state",
      "open",
      "--json",
      "number,title,url,headRefName,baseRefName,mergeable,reviewDecision,statusCheckRollup",
      "--limit",
      "40",
    ],
    [],
  ).map(prSummary);
}

function listMergedPullRequests() {
  return ghJson(
    [
      "pr",
      "list",
      "--repo",
      repo,
      "--state",
      "merged",
      "--json",
      "number,title,url,mergedAt,headRefName",
      "--limit",
      "8",
    ],
    [],
  );
}

function shellEscapeMarkdown(value) {
  return String(value).replaceAll("|", "\\|");
}

function prLine(pr) {
  return `| #${pr.number} | ${shellEscapeMarkdown(pr.title)} | ${pr.mergeable} | ${pr.checks.pass} pass, ${pr.checks.pending} pending, ${pr.checks.fail} fail, ${pr.checks.skipped} skipped | [Open](${pr.url}) |`;
}

function buildMarkdown(status) {
  const readyRows = status.readyToMerge.length
    ? status.readyToMerge.map(prLine).join("\n")
    : "| - | None | - | - | - |";
  const inProgressRows = status.inProgress.length
    ? status.inProgress.map(prLine).join("\n")
    : "| - | None | - | - | - |";
  const blockedRows = status.blocked.length
    ? status.blocked.map(prLine).join("\n")
    : "| - | None | - | - | - |";

  return `# FuelWell Execution Status

Updated: ${status.generatedAt}

Generated from live GitHub PR/check state by \`tools/build-dashboard/scripts/generate-execution-status.mjs\`.

## Current Milestone

**${status.currentMilestone}**

${status.summary}

## Ready To Merge

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
${readyRows}

## In Progress

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
${inProgressRows}

## Blocked Or Needs Attention

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
${blockedRows}

## Recently Merged

${status.mergedRecent.map((pr) => `- #${pr.number}, ${pr.title} (${pr.mergedAt})`).join("\n") || "- None returned by GitHub."}

## Vital Blockers

${status.vitalBlockers.map((item) => `- ${item}`).join("\n")}

## Next Actions

${status.nextActions.map((item) => `- ${item}`).join("\n")}
`;
}

function main() {
  if (!existsSync(resolve(repoRoot, ".git"))) {
    throw new Error(`Expected repo root at ${repoRoot}`);
  }

  const open = listOpenPullRequests();
  const readyToMerge = open.filter((pr) => pr.state === "ready");
  const inProgress = open.filter((pr) => pr.state === "in_progress");
  const blocked = open.filter((pr) => pr.state === "blocked");
  const mergedRecent = listMergedPullRequests();

  const status = {
    generatedAt: new Date().toISOString(),
    source: "github-cli",
    currentMilestone: "W10 - Execution cockpit readiness",
    summary:
      readyToMerge.length > 0
        ? `${readyToMerge.length} PR(s) are mergeable with all required checks passing or expected skips.`
        : "No PR is currently ready to merge. Review in-progress and blocked queues before continuing.",
    readyToMerge,
    inProgress,
    blocked,
    mergedRecent,
    vitalBlockers: [
      "Anthropic API key for server-side proxy.",
      "FUELWELL_COACH_PROXY_SECRET for proxy authentication.",
      "Supabase service-role key and direct Postgres URL for the selected app project.",
      "Human confirmation before applying migrations to production data.",
      "Apple Developer, payment provider, and App Store Connect actions before TestFlight/App Store work.",
    ],
    nextActions: [
      "Merge green queued PRs in dependency order: data layer, coach hardening, navigation detail, CI readiness.",
      "Regenerate this status artifact after each merge so the cockpit reflects main.",
      "Continue plan-backed work from latest main once the review queue is clear enough to avoid hot-file conflicts.",
    ],
  };

  writeFileSync(outputJson, `${JSON.stringify(status, null, 2)}\n`);
  writeFileSync(outputMd, buildMarkdown(status));
  console.log(`Wrote ${outputJson}`);
  console.log(`Wrote ${outputMd}`);
}

main();

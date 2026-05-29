#!/usr/bin/env node
/**
 * Digest the most recent Claude Code session for this repo into
 * data/session-digest.json, which the dashboard renders as the
 * "what we last worked on" narrative.
 *
 * Runs locally on the MacBook (the transcripts never leave your machine).
 * After running, commit data/session-digest.json so Vercel picks it up.
 *
 * Usage:
 *   node scripts/digest-session.mjs                 # auto-locate newest session
 *   node scripts/digest-session.mjs <file.jsonl>    # digest a specific transcript
 *   node scripts/digest-session.mjs <sessions-dir>  # newest .jsonl in a dir
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const OUT = path.resolve(__dirname, "..", "data", "session-digest.json");

function encodeProjectDir(absPath) {
  // Claude Code encodes the project path by replacing "/" and "." with "-".
  return absPath.replace(/[/.]/g, "-");
}

function resolveSessionsDir() {
  const arg = process.argv[2];
  if (arg) {
    const stat = fs.existsSync(arg) ? fs.statSync(arg) : null;
    if (stat?.isFile()) return { file: arg };
    if (stat?.isDirectory()) return { dir: arg };
  }
  const encoded = encodeProjectDir(REPO_ROOT);
  return { dir: path.join(os.homedir(), ".claude", "projects", encoded) };
}

function jsonlByRecency(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime)
    .map((x) => x.full);
}

/** A digest is "substantive" if it captured a real request and some work. */
function score(d) {
  let s = 0;
  if (!d.intent.startsWith("(no clear")) s += 2;
  s += Math.min(d.filesTouched.length, 5);
  s += Math.min(d.workDone.length, 4);
  return s;
}

function textOf(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b) => b && b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("\n");
  }
  return "";
}

const FILE_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
const SKIP_USER = [
  "<command",
  "[GOAL",
  "Caveat:",
  "This session is being continued",
  "<local-command",
  "<system-reminder",
  // Meta / tooling sessions (gbrain observer, knowledge-base savers) — not real work.
  "Read the Claude Code session transcript",
  "Decide if this session contains anything worth saving",
  "You are a",
];
// Lines that signal a failed/empty turn — never surface these as "work done".
const NOISE = /Failed to authenticate|API Error:|authentication_error|Please run \/login/i;

function firstSentence(s) {
  const m = s.trim().match(/^.{0,200}?[.!?](\s|$)/s);
  return (m ? m[0] : s.slice(0, 200)).trim();
}

function digest(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  let intent = "";
  const filesTouched = new Set();
  const assistantOpeners = [];
  let lastAssistantText = "";
  let lastTimestamp = "";

  for (const line of lines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    if (obj.timestamp) lastTimestamp = obj.timestamp;
    const msg = obj.message;
    if (!msg) continue;

    if (obj.type === "user" && !intent) {
      const t = textOf(msg.content).trim();
      if (t && t.length > 20 && !SKIP_USER.some((p) => t.startsWith(p))) {
        intent = t.slice(0, 400);
      }
    }

    if (obj.type === "assistant") {
      const t = textOf(msg.content).trim();
      if (t && !NOISE.test(t)) {
        const opener = firstSentence(t);
        if (opener && opener.length > 12) assistantOpeners.push(opener);
        lastAssistantText = t;
      }
      if (Array.isArray(msg.content)) {
        for (const b of msg.content) {
          if (b?.type === "tool_use" && FILE_TOOLS.has(b.name)) {
            const fp = b.input?.file_path;
            if (fp) filesTouched.add(fp);
          }
        }
      }
    }
  }

  // De-dupe openers while preserving order; keep a readable handful.
  const seen = new Set();
  const workDone = [];
  for (const o of assistantOpeners) {
    const key = o.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    workDone.push(o);
    if (workDone.length >= 8) break;
  }

  const stat = fs.statSync(file);
  return {
    sessionId: path.basename(file, ".jsonl"),
    sessionFile: file,
    date: lastTimestamp || new Date(stat.mtimeMs).toISOString(),
    intent: intent || "(no clear opening request found in this transcript)",
    workDone,
    filesTouched: [...filesTouched].slice(0, 25),
    narrative: lastAssistantText.slice(0, 800),
    generatedAt: new Date().toISOString(),
  };
}

function main() {
  const loc = resolveSessionsDir();
  let out;
  if (loc.file) {
    out = digest(loc.file);
  } else {
    if (!loc.dir || !fs.existsSync(loc.dir)) {
      console.error(`No sessions directory found: ${loc.dir}`);
      process.exit(1);
    }
    const files = jsonlByRecency(loc.dir);
    if (files.length === 0) {
      console.error(`No .jsonl transcripts in ${loc.dir}`);
      process.exit(1);
    }
    // Walk newest→older; take the most recent session that actually has
    // substance, falling back to the newest if none qualify.
    let best = null;
    for (const f of files.slice(0, 10)) {
      const d = digest(f);
      const s = score(d);
      if (!best || s > best.s) best = { d, s };
      if (s >= 4) {
        best = { d, s };
        break;
      }
    }
    out = best.d;
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${OUT}`);
  console.log(`  session: ${out.sessionId}`);
  console.log(`  date:    ${out.date}`);
  console.log(`  files:   ${out.filesTouched.length}`);
  console.log(`  intent:  ${out.intent.slice(0, 80)}...`);
}

main();

#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { nodes } = JSON.parse(
  readFileSync(join(root, ".loop/coach-engine-graph/criteria.json"), "utf8"),
);

const ids = new Set(nodes.map((n) => n.id));
let failed = false;
const err = (m) => ((failed = true), console.error(`FAIL: ${m}`));

for (const n of nodes) {
  for (const d of n.deps) if (!ids.has(d)) err(`${n.id}: unknown dep "${d}"`);
  for (const f of n.files ?? [])
    if (!existsSync(join(root, f))) err(`${n.id}: missing file ${f}`);
  if (!["failing", "pass"].includes(n.status)) err(`${n.id}: bad status`);
}

// cycle check via Kahn's algorithm
const indeg = new Map(nodes.map((n) => [n.id, n.deps.length]));
const out = new Map(nodes.map((n) => [n.id, []]));
for (const n of nodes) for (const d of n.deps) out.get(d)?.push(n.id);
const queue = nodes.filter((n) => n.deps.length === 0).map((n) => n.id);
let seen = 0;
while (queue.length) {
  const id = queue.shift();
  seen++;
  for (const next of out.get(id)) {
    indeg.set(next, indeg.get(next) - 1);
    if (indeg.get(next) === 0) queue.push(next);
  }
}
if (seen !== nodes.length) err("cycle detected in dependency graph");

const frontier = nodes
  .filter((n) => n.status === "failing" && n.deps.every((d) => nodes.find((m) => m.id === d)?.status === "pass"))
  .map((n) => n.id);
if (!failed && frontier.length === 0 && nodes.some((n) => n.status === "failing"))
  err("deadlock: failing nodes exist but frontier is empty");

if (failed) process.exit(1);
console.log(`OK: ${nodes.length} nodes, DAG valid, frontier: [${frontier.join(", ")}]`);

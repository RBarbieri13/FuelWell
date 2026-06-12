#!/usr/bin/env node
/**
 * Merge tools/restaurant-data/batch-*.json into src/lib/restaurant-database.ts.
 *
 * Validates before writing (exits 1 on any failure):
 *  - >= 50 distinct restaurants, no duplicate restaurant or item ids
 *  - >= 5 items per restaurant
 *  - every item has name/serving/sourceUrl and numeric macros in sane ranges
 *  - 4*protein + 4*carbs + 9*fat within 25% of stated calories
 *
 * Re-run after editing batch files: node tools/build-restaurant-db.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "tools", "restaurant-data");
const outFile = join(root, "src", "lib", "restaurant-database.ts");

const errors = [];
const restaurants = [];
const seenRestaurantIds = new Set();

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['’.()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const batchFiles = readdirSync(dataDir).filter((f) => /^batch-\d+\.json$/.test(f)).sort();
for (const file of batchFiles) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: invalid JSON — ${e.message}`);
    continue;
  }
  for (const r of parsed) {
    if (!r.id || !r.name || !Array.isArray(r.items)) {
      errors.push(`${file}: malformed restaurant entry ${JSON.stringify(r).slice(0, 80)}`);
      continue;
    }
    if (seenRestaurantIds.has(r.id)) {
      errors.push(`duplicate restaurant id ${r.id} (${file})`);
      continue;
    }
    seenRestaurantIds.add(r.id);

    const items = [];
    const seenItemIds = new Set();
    for (const it of r.items) {
      const { name, serving, calories, protein, carbs, fat, sourceUrl } = it;
      const numeric = [calories, protein, carbs, fat].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);
      if (!name || !serving || !sourceUrl || !numeric) {
        errors.push(`${r.id}: malformed item ${JSON.stringify(it).slice(0, 80)}`);
        continue;
      }
      if (calories > 5000 || protein > 500 || carbs > 500 || fat > 500) {
        errors.push(`${r.id} / ${name}: macros out of range`);
        continue;
      }
      const computed = 4 * protein + 4 * carbs + 9 * fat;
      if (calories > 50 && Math.abs(computed - calories) / calories > 0.25) {
        errors.push(
          `${r.id} / ${name}: macro math off ${Math.round((Math.abs(computed - calories) / calories) * 100)}% (4P+4C+9F=${Math.round(computed)} vs ${calories} kcal)`
        );
        continue;
      }
      const id = `${r.id}:${slug(name)}`;
      if (seenItemIds.has(id)) {
        errors.push(`${r.id}: duplicate item id ${id}`);
        continue;
      }
      seenItemIds.add(id);
      items.push({ id, name, serving, calories, protein, carbs, fat, sourceUrl });
    }
    if (items.length < 5) {
      errors.push(`${r.id}: only ${items.length} valid items (need >= 5)`);
      continue;
    }
    restaurants.push({ id: r.id, name: r.name, items });
  }
}

if (restaurants.length < 50) errors.push(`only ${restaurants.length} restaurants (need >= 50)`);

if (errors.length) {
  console.error(`FAILED — ${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

restaurants.sort((a, b) => a.name.localeCompare(b.name));
const totalItems = restaurants.reduce((n, r) => n + r.items.length, 0);

const header = `/**
 * FuelWell Restaurant Nutrition Database — GENERATED FILE, do not hand-edit.
 *
 * Source of truth: tools/restaurant-data/batch-*.json, gathered 2026-06-12
 * from each chain's published nutrition pages/PDFs (fastfoodnutrition.org or
 * nutrition-charts.com used as fallback where official pages were
 * JS-rendered or bot-blocked; per-item sourceUrl records the exact origin).
 * Values are per listed serving, NOT per 100 g. Published values are
 * rounded by the chains and may lag current menus.
 *
 * Regenerate: node tools/build-restaurant-db.mjs
 * ${restaurants.length} restaurants, ${totalItems} items.
 */

export interface RestaurantMenuItem {
  /** "<restaurant-id>:<item-slug>" */
  id: string;
  name: string;
  /** Human serving label, e.g. "1 sandwich", "24 fl oz smoothie". */
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Page the values were taken from. */
  sourceUrl: string;
}

export interface Restaurant {
  id: string;
  name: string;
  items: RestaurantMenuItem[];
}

export const RESTAURANT_DATABASE: readonly Restaurant[] = `;

writeFileSync(outFile, header + JSON.stringify(restaurants, null, 2) + ";\n");
console.log(`OK — wrote ${outFile}`);
console.log(`${restaurants.length} restaurants, ${totalItems} items`);
for (const r of restaurants) console.log(`  ${r.name}: ${r.items.length}`);

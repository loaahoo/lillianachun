/**
 * Creates the editable party budget table and seeds common expense categories.
 * Idempotent: skips seeding if budget data already exists.
 * Run: node --env-file=.env.local scripts/migrate-budget.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

let url = process.env.DATABASE_URL;
if (!url) {
  try {
    const env = readFileSync(".env.local", "utf8");
    url = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
  } catch {}
}
if (!url) throw new Error("DATABASE_URL not found");
const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS budget_items (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  item VARCHAR(200) NOT NULL,
  category VARCHAR(120) NOT NULL,
  owner VARCHAR(200),
  estimated_cents INTEGER NOT NULL DEFAULT 0,
  actual_cents INTEGER NOT NULL DEFAULT 0,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'planned',
  notes TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
)`;

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM budget_items`;
if (count > 0) {
  console.log(`budget items already seeded (${count} rows) — skipping`);
  process.exit(0);
}

const ITEMS = [
  ["Venue rental", "Venue", "Ikaika & Jason"],
  ["Food provider", "Food", "Tanya"],
  ["Pūpūs", "Food", "Maui Chun"],
  ["Cake", "Cake", "Johnalle"],
  ["Decorations", "Decor", "Keala"],
  ["Paper goods & supplies", "Supplies", "Aunty Darling"],
  ["Musician (Ray)", "Entertainment", "Leighton"],
  ["Sound setup", "Entertainment", "Leighton"],
  ["Photo & video", "Logistics", "Leighton"],
  ["Miscellaneous / contingency", "Finance", "Tanya"],
];

for (let i = 0; i < ITEMS.length; i++) {
  const [item, category, owner] = ITEMS[i];
  await sql`INSERT INTO budget_items (sort_order, item, category, owner)
    VALUES (${i + 1}, ${item}, ${category}, ${owner})`;
}

console.log("budget tracker ready");

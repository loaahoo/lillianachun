/**
 * Creates the planning tracker tables in Neon and seeds them from the
 * family's master event plan. Idempotent: skips seeding if data exists.
 * Run: node --env-file=.env.local scripts/migrate-planning.mjs
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

await sql`DO $$ BEGIN
  CREATE TYPE workstream_status AS ENUM ('not_started','in_progress','done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$`;

await sql`CREATE TABLE IF NOT EXISTS workstreams (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name VARCHAR(200) NOT NULL,
  emoji VARCHAR(16),
  owner VARCHAR(200),
  budget VARCHAR(120),
  deadline VARCHAR(120),
  objective TEXT,
  status workstream_status NOT NULL DEFAULT 'not_started',
  is_critical_path INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
)`;

await sql`CREATE TABLE IF NOT EXISTS plan_tasks (
  id SERIAL PRIMARY KEY,
  workstream_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  completed_by VARCHAR(200),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
)`;

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM workstreams`;
if (count > 0) {
  console.log(`workstreams already seeded (${count} rows) — skipping`);
  process.exit(0);
}

const DATA = [
  {
    name: "Venue", emoji: "🏝️", owner: "Ikaika & Jason", budget: "~$1,000–$3,000",
    deadline: "ASAP — critical path", status: "in_progress", critical: 1,
    objective: "Secure a venue that supports 200 guests and full event flow (tables, food line, stage, cake, parking, restrooms).",
    tasks: [
      "Identify venue options",
      "Compare cost + availability",
      "Confirm final venue",
      "Lock contract",
      "Confirm setup/cleanup time access",
      "Confirm rules (music, decor, food)",
    ],
  },
  {
    name: "Food & Beverage", emoji: "🍽️", owner: "Tanya", budget: "~$2,000–$2,500",
    deadline: "3–4 weeks before", status: "in_progress", critical: 1,
    objective: "Deliver a simple, high-quality Hawaiian meal for 200+ guests: Kalua Pig, Chicken Long Rice, Lomi Salmon, Rice, Haupia. Pūpūs by Maui Chun + Soon family.",
    tasks: [
      "Final headcount (target 220)",
      "Confirm catering vs homemade",
      "Finalize pūpū menu (Maui Chun + Soon family)",
      "Assign cooking / purchasing",
      "Assign food pickup",
      "Secure warmers + serving equipment",
      "Assign food line lead",
      "Assign serving team (grandkids)",
    ],
  },
  {
    name: "Entertainment", emoji: "🎶", owner: "Leighton", budget: "~$300–$800",
    deadline: "2–3 weeks before", status: "in_progress", critical: 0,
    objective: "A meaningful, culturally aligned experience: live music by Ray and family hula (Tanya, Pualila, Darling + more).",
    tasks: [
      "Confirm Ray's availability",
      "Confirm cost",
      "Confirm sound setup",
      "Confirm hula performers",
      "Select songs",
      "Schedule rehearsal",
      "Confirm timing in run of show",
    ],
  },
  {
    name: "Decor & Experience", emoji: "🌺", owner: "Needs a lead!", budget: "~$300–$600",
    deadline: "2–3 weeks before", status: "not_started", critical: 1,
    objective: "A warm, emotional, visually meaningful environment: welcome sign, photo wall (critical), centerpieces, memory table.",
    tasks: [
      "Assign decor lead",
      "Define theme direction",
      "Create materials list",
      "Purchase / gather items",
      "Collect family photos",
      "Assign setup crew",
      "Create layout plan",
    ],
  },
  {
    name: "Cake", emoji: "🎂", owner: "Johnalle", budget: "~$150–$300",
    deadline: "2 weeks before", status: "not_started", critical: 0,
    objective: "A centennial-worthy cake with enough servings for everyone.",
    tasks: [
      "Confirm design",
      "Confirm size (200+ servings)",
      "Arrange pickup / delivery",
    ],
  },
  {
    name: "Paper Goods", emoji: "🍃", owner: "Aunty Darling", budget: "~$150–$300",
    deadline: "2 weeks before", status: "not_started", critical: 0,
    objective: "Plates, utensils, napkins and cups for 220 — aligned with the theme.",
    tasks: ["Purchase for 220 people", "Align with theme"],
  },
  {
    name: "Reception & Guest Management", emoji: "🤙", owner: "Aya / Cindy / Angela", budget: "Minimal",
    deadline: "1 week before", status: "not_started", critical: 0,
    objective: "Welcome every guest with aloha: reception table, card/gift station, guest book.",
    tasks: [
      "Reception table setup",
      "Card / gift station",
      "Guest welcome plan",
      "Optional guest book",
    ],
  },
  {
    name: "Logistics & Operations", emoji: "📋", owner: "Needs a lead!", budget: "Minimal",
    deadline: "1–2 weeks before", status: "not_started", critical: 1,
    objective: "Make the day run smoothly: staffing, run of show, and an MC (critical).",
    tasks: [
      "Assign setup crew",
      "Assign cleanup crew",
      "Assign food runners",
      "Assign MC (CRITICAL)",
      "Assign photographer",
      "Build final run of show",
      "Print / share run of show with team",
    ],
  },
  {
    name: "Budget & Collections", emoji: "💰", owner: "Tanya + Leighton", budget: "N/A",
    deadline: "ASAP after budget finalized", status: "not_started", critical: 1,
    objective: "Finalize the total cost and collect fairly from each family.",
    tasks: [
      "Finalize total event cost",
      "Determine per-family contribution",
      "Assign payment collector",
      "Set payment deadline",
    ],
  },
];

for (let i = 0; i < DATA.length; i++) {
  const w = DATA[i];
  const [row] = await sql`INSERT INTO workstreams
    (sort_order, name, emoji, owner, budget, deadline, objective, status, is_critical_path)
    VALUES (${i + 1}, ${w.name}, ${w.emoji}, ${w.owner}, ${w.budget}, ${w.deadline}, ${w.objective}, ${w.status}, ${w.critical})
    RETURNING id`;
  for (let j = 0; j < w.tasks.length; j++) {
    await sql`INSERT INTO plan_tasks (workstream_id, sort_order, label)
      VALUES (${row.id}, ${j + 1}, ${w.tasks[j]})`;
  }
  console.log(`seeded: ${w.name} (${w.tasks.length} tasks)`);
}
console.log("done");

/**
 * Adds admin access levels (owner / editor / viewer) to the admins table.
 *
 * - Safe to run more than once, and safe to run BEFORE deploying the new code
 *   (the old code simply ignores the new columns).
 * - Everyone who already has a login keeps full edit access ("editor"), so
 *   nobody loses access. Only OWNER_EMAIL becomes the "owner" (the one person
 *   who can invite other admins). If OWNER_EMAIL isn't found, the earliest
 *   admin is made owner instead so the site is never left without one.
 *
 * Run: OWNER_EMAIL=you@example.com node --env-file=.env.local scripts/migrate-roles.mjs
 */
const { neon } = await import("@neondatabase/serverless");

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith("postgres")) {
  console.error("DATABASE_URL (postgres) is required.");
  process.exit(1);
}
const ownerEmail = (process.env.OWNER_EMAIL || "leightonchun@gmail.com").toLowerCase().trim();

const sql = neon(url);

await sql`
  DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('owner', 'editor', 'viewer');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$
`;
// Existing rows are backfilled as 'editor' (what they can already do today)...
await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role admin_role NOT NULL DEFAULT 'editor'`;
await sql`ALTER TABLE admins ADD COLUMN IF NOT EXISTS must_change_password INTEGER NOT NULL DEFAULT 0`;
// ...but anyone added from now on defaults to the least-privileged level.
await sql`ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'viewer'`;

await sql`UPDATE admins SET role = 'owner' WHERE email = ${ownerEmail}`;

const owners = await sql`SELECT id, email FROM admins WHERE role = 'owner'`;
if (owners.length === 0) {
  const promoted = await sql`
    UPDATE admins SET role = 'owner'
    WHERE id = (SELECT id FROM admins ORDER BY id ASC LIMIT 1)
    RETURNING email
  `;
  if (promoted.length) {
    console.warn(`OWNER_EMAIL "${ownerEmail}" was not found; made the earliest admin the owner: ${promoted[0].email}`);
  } else {
    console.warn("There are no admins yet. Run seed:admin — the seeded account becomes the owner.");
  }
}

const rows = await sql`SELECT id, email, role FROM admins ORDER BY id`;
console.log("Admin access levels:");
for (const r of rows) console.log(`  #${r.id}  ${r.role.padEnd(6)}  ${r.email}`);
process.exit(0);

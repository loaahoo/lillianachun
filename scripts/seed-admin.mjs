/**
 * Seed (or update) the admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Usage: node scripts/seed-admin.mjs   (or: pnpm seed:admin)
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";

let { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

// In local dev, prefer .env.local values.
if (existsSync(".env.local")) {
  const env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
  );
  DATABASE_URL = env.DATABASE_URL ?? DATABASE_URL;
  ADMIN_EMAIL = ADMIN_EMAIL ?? env.ADMIN_EMAIL;
  ADMIN_PASSWORD = ADMIN_PASSWORD ?? env.ADMIN_PASSWORD;
}

if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing env vars: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD are required.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

// A newly seeded account is the site owner (the one who can invite other admins).
// If the account already exists only its password is updated — its role is left alone.
// Requires the role column: run `pnpm db:migrate-roles` first.
await sql`
  INSERT INTO admins (email, password_hash, name, role)
  VALUES (${ADMIN_EMAIL.toLowerCase()}, ${hash}, 'Admin', 'owner')
  ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}
`;

console.log(`Admin user ready: ${ADMIN_EMAIL}`);
process.exit(0);

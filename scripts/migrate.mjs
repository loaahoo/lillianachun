/**
 * Create/verify database tables on Neon Postgres.
 * Usage: node scripts/migrate.mjs  (reads DATABASE_URL from env or .env.local)
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";

let url = process.env.DATABASE_URL;
// In local dev, prefer .env.local (shell env may hold unrelated values).
if (existsSync(".env.local")) {
  const line = readFileSync(".env.local", "utf8")
    .split("\n")
    .find((l) => l.startsWith("DATABASE_URL="));
  if (line) url = line.slice("DATABASE_URL=".length).trim();
}
if (!url || !url.startsWith("postgres")) {
  console.error("DATABASE_URL (postgres) is required.");
  process.exit(1);
}

const sql = neon(url);

await sql`
  DO $$ BEGIN
    CREATE TYPE attending AS ENUM ('yes', 'no');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$
`;
await sql`
  DO $$ BEGIN
    CREATE TYPE photo_status AS ENUM ('pending', 'approved', 'rejected');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$
`;

await sql`
  CREATE TABLE IF NOT EXISTS rsvps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320),
    phone VARCHAR(50),
    attendees INTEGER NOT NULL DEFAULT 1,
    attending attending NOT NULL DEFAULT 'yes',
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    uploader_name VARCHAR(200) NOT NULL,
    caption TEXT,
    url TEXT NOT NULL,
    blob_pathname TEXT NOT NULL,
    mime_type VARCHAR(100),
    status photo_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("Tables ready:", tables.map((t) => t.table_name).join(", "));
process.exit(0);

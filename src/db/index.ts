import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon Postgres client (HTTP driver — ideal for Vercel serverless).
 * Requires DATABASE_URL env var (Neon connection string).
 *
 * Initialized lazily so that `next build` (which imports route modules to
 * collect page data) does not fail when DATABASE_URL is absent at build time.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

function getDb(): Db {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (dev) or Vercel Environment Variables (production)."
      );
    }
    _db = drizzle(neon(url), { schema });
  }
  return _db;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export * from "./schema";

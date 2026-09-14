import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

/** Read a raw string setting, returning null when it has not been set. */
export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

/** Read a boolean setting, defaulting to `fallback` when unset. */
export async function getBoolSetting(key: string, fallback: boolean): Promise<boolean> {
  try {
    const value = await getSetting(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

/** Upsert a setting value. */
export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

/** Read a boolean setting, defaulting to `fallback` when unset. */
export async function getBoolSetting(key: string, fallback: boolean): Promise<boolean> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (rows.length === 0) return fallback;
    return rows[0].value === "true";
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

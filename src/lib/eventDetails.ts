import { inArray } from "drizzle-orm";
import { db, settings } from "@/db";
import { EVENT } from "@/lib/event";

/** Editable event fields stored in the settings table (key prefix `event.`). */
export interface EventDetails {
  date: string;
  time: string;
  venue: string;
  address: string;
  location: string;
  guests: string;
}

export const EVENT_FIELDS: (keyof EventDetails)[] = [
  "date",
  "time",
  "venue",
  "address",
  "location",
  "guests",
];

const DEFAULTS: EventDetails = {
  date: EVENT.date,
  time: EVENT.time,
  venue: EVENT.venue,
  address: EVENT.address,
  location: EVENT.location,
  guests: EVENT.guests,
};

/** Read event details from the DB, falling back to the static defaults. */
export async function getEventDetails(): Promise<EventDetails> {
  try {
    const keys = EVENT_FIELDS.map(f => `event.${f}`);
    const rows = await db.select().from(settings).where(inArray(settings.key, keys));
    const out = { ...DEFAULTS };
    for (const row of rows) {
      const field = row.key.replace(/^event\./, "") as keyof EventDetails;
      if (EVENT_FIELDS.includes(field) && row.value.trim()) out[field] = row.value;
    }
    return out;
  } catch {
    return { ...DEFAULTS };
  }
}

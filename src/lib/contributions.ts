import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

export interface Contribution {
  name: string;
  amountCents: number;
  received: boolean;
}

export const DEFAULT_CONTRIBUTIONS: Contribution[] = [
  { name: "Ikaika", amountCents: 100000, received: false },
  { name: "Aunty Darling", amountCents: 60000, received: false },
  { name: "Aunty Tanya", amountCents: 60000, received: false },
  { name: "Johnelle", amountCents: 60000, received: false },
  { name: "Leighton", amountCents: 100000, received: false },
  { name: "Uncle Frank", amountCents: 60000, received: false },
  { name: "Kuilan", amountCents: 60000, received: false },
];

export const CONTRIBUTIONS_KEY = "budget.contributions";

export async function getContributions(): Promise<Contribution[]> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, CONTRIBUTIONS_KEY)).limit(1);
    if (!row) return DEFAULT_CONTRIBUTIONS;
    const parsed = JSON.parse(row.value) as Contribution[];
    return Array.isArray(parsed)
      ? parsed.map(item => ({ ...item, received: item.received === true }))
      : DEFAULT_CONTRIBUTIONS;
  } catch {
    return DEFAULT_CONTRIBUTIONS;
  }
}

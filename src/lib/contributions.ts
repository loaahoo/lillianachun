import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

export interface Contribution {
  name: string;
  amountCents: number;
}

export const DEFAULT_CONTRIBUTIONS: Contribution[] = [
  { name: "Ikaika", amountCents: 100000 },
  { name: "Aunty Darling", amountCents: 60000 },
  { name: "Aunty Tanya", amountCents: 60000 },
  { name: "Johnelle", amountCents: 60000 },
  { name: "Leighton", amountCents: 100000 },
  { name: "Uncle Frank", amountCents: 60000 },
  { name: "Kuilan", amountCents: 60000 },
];

export const CONTRIBUTIONS_KEY = "budget.contributions";

export async function getContributions(): Promise<Contribution[]> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, CONTRIBUTIONS_KEY)).limit(1);
    if (!row) return DEFAULT_CONTRIBUTIONS;
    const parsed = JSON.parse(row.value) as Contribution[];
    return Array.isArray(parsed) ? parsed : DEFAULT_CONTRIBUTIONS;
  } catch {
    return DEFAULT_CONTRIBUTIONS;
  }
}

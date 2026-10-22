import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

export interface Contribution {
  name: string;
  /** Total amount the person committed to donate (in cents). */
  amountCents: number;
  /** Amount of the commitment paid so far (in cents) — partial donations allowed. */
  paidCents: number;
  /** Legacy shape: true when the full amount was marked received. */
  received?: boolean;
}

export const DEFAULT_CONTRIBUTIONS: Contribution[] = [
  { name: "Ikaika", amountCents: 100000, paidCents: 0 },
  { name: "Aunty Darling", amountCents: 60000, paidCents: 0 },
  { name: "Aunty Tanya", amountCents: 60000, paidCents: 0 },
  { name: "Johnelle", amountCents: 60000, paidCents: 0 },
  { name: "Leighton", amountCents: 100000, paidCents: 0 },
  { name: "Uncle Frank", amountCents: 60000, paidCents: 0 },
  { name: "Kuilan", amountCents: 60000, paidCents: 0 },
];

export const CONTRIBUTIONS_KEY = "budget.contributions";

export async function getContributions(): Promise<Contribution[]> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, CONTRIBUTIONS_KEY)).limit(1);
    if (!row) return DEFAULT_CONTRIBUTIONS;
    const parsed = JSON.parse(row.value) as Contribution[];
    if (!Array.isArray(parsed)) return DEFAULT_CONTRIBUTIONS;
    // Normalize: migrate legacy `received` flags to paidCents, always
    // return the committed/paid shape so old saved rows keep working.
    return parsed
      .map(item => {
        const amountCents = Math.max(0, Math.round(Number(item.amountCents) || 0));
        const paidCents = item.paidCents != null
          ? Math.max(0, Math.round(Number(item.paidCents) || 0))
          : item.received === true ? amountCents : 0;
        return { name: String(item.name ?? ""), amountCents, paidCents };
      })
      .filter(item => item.name);
  } catch {
    return DEFAULT_CONTRIBUTIONS;
  }
}

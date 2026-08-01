import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { budgetItems, db } from "@/db";

export const dynamic = "force-dynamic";

/** Public read-only budget used by the family Planning page. */
export async function GET() {
  try {
    const items = await db.select().from(budgetItems).orderBy(asc(budgetItems.sortOrder));
    return NextResponse.json({ items });
  } catch (err) {
    console.error("budget GET failed", err);
    return NextResponse.json({ error: "Failed to load the budget" }, { status: 500 });
  }
}

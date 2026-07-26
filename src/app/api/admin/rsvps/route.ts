import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, rsvps } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));
  const totalGuests = rows
    .filter((r) => r.attending === "yes")
    .reduce((sum, r) => sum + r.attendees, 0);
  return NextResponse.json({ rsvps: rows, totalGuests });
}

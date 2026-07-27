import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
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

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: {
    id?: number;
    name?: string;
    email?: string | null;
    phone?: string | null;
    attendees?: number;
    attending?: "yes" | "no";
    message?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Valid RSVP id required" }, { status: 400 });
  }

  const updates: Partial<typeof rsvps.$inferInsert> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    updates.name = name.slice(0, 200);
  }
  if (body.email !== undefined) {
    updates.email = body.email ? String(body.email).trim().slice(0, 320) : null;
  }
  if (body.phone !== undefined) {
    updates.phone = body.phone ? String(body.phone).trim().slice(0, 50) : null;
  }
  if (body.attendees !== undefined) {
    const n = Number(body.attendees);
    if (!Number.isInteger(n) || n < 0 || n > 50) {
      return NextResponse.json({ error: "Guest count must be between 0 and 50" }, { status: 400 });
    }
    updates.attendees = n;
  }
  if (body.attending !== undefined) {
    if (body.attending !== "yes" && body.attending !== "no") {
      return NextResponse.json({ error: "attending must be yes or no" }, { status: 400 });
    }
    updates.attending = body.attending;
  }
  if (body.message !== undefined) {
    updates.message = body.message ? String(body.message).trim() : null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db.update(rsvps).set(updates).where(eq(rsvps.id, id)).returning();
  if (!updated) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }
  return NextResponse.json({ rsvp: updated });
}

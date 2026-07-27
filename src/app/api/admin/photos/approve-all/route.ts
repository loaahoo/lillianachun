import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, photos } from "@/db";
import { getSession } from "@/lib/auth";

/** POST: approve every photo currently in pending status (admin only). */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const updated = await db
      .update(photos)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(photos.status, "pending"))
      .returning({ id: photos.id });
    return NextResponse.json({ ok: true, approved: updated.length });
  } catch (err) {
    console.error("Approve-all error:", err);
    return NextResponse.json({ error: "Approve all failed." }, { status: 500 });
  }
}

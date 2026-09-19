import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, photos } from "@/db";
import { requireRole } from "@/lib/auth";

/** POST: approve every photo currently in pending status (editors and up). */
export async function POST() {
  const { denied } = await requireRole("editor");
  if (denied) return denied;
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

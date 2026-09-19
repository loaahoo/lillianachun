import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, photos } from "@/db";
import { requireRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { denied } = await requireRole("editor");
  if (denied) return denied;
  try {
    const { photoId, status } = await req.json();
    if (!photoId || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    await db
      .update(photos)
      .set({ status, reviewedAt: new Date() })
      .where(eq(photos.id, Number(photoId)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Review failed." }, { status: 500 });
  }
}

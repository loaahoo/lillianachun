import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, photos } from "@/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { denied } = await requireRole("viewer");
  if (denied) return denied;
  const rows = await db.select().from(photos).orderBy(desc(photos.createdAt));
  const withUrls = rows.map((r) => ({ ...r, url: `/api/photos/image/${r.id}` }));
  return NextResponse.json({ photos: withUrls });
}

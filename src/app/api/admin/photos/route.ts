import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, photos } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(photos).orderBy(desc(photos.createdAt));
  const withUrls = rows.map((r) => ({ ...r, url: `/api/photos/image/${r.id}` }));
  return NextResponse.json({ photos: withUrls });
}

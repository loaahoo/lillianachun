import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db, photos } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: photos.id,
        uploaderName: photos.uploaderName,
        caption: photos.caption,
        createdAt: photos.createdAt,
      })
      .from(photos)
      .where(eq(photos.status, "approved"))
      .orderBy(desc(photos.reviewedAt));
    // Serve every image through the signed-URL proxy for private-store support.
    const withUrls = rows.map((r) => ({ ...r, url: `/api/photos/image/${r.id}` }));
    return NextResponse.json({ photos: withUrls });
  } catch (err) {
    console.error("Approved photos error:", err);
    return NextResponse.json({ photos: [] });
  }
}

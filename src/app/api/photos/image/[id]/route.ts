import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, photos } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Serves a photo's bytes by proxying the Vercel Blob store with the
 * server-side token. Works with both private and public Blob stores.
 * Approved photos are public; pending/rejected photos require an admin session.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isFinite(photoId)) {
    return NextResponse.json({ error: "Invalid photo id." }, { status: 400 });
  }

  const [photo] = await db.select().from(photos).where(eq(photos.id, photoId)).limit(1);
  if (!photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  if (photo.status !== "approved") {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not available." }, { status: 403 });
    }
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  try {
    const upstream = await fetch(photo.url, {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Image unavailable." }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? photo.mimeType ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image unavailable." }, { status: 502 });
  }
}

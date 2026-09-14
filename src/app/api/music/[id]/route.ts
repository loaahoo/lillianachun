import { NextRequest, NextResponse } from "next/server";
import { getGalleryMusic } from "@/lib/music";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const track = (await getGalleryMusic()).find((item) => item.id === id);
  if (!track) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }

  const headers: Record<string, string> = {};
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const range = req.headers.get("range");
  if (token) headers.authorization = `Bearer ${token}`;
  if (range) headers.range = range;

  try {
    const upstream = await fetch(track.url, { headers });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Song unavailable." }, { status: 502 });
    }

    const responseHeaders = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? track.mimeType,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Accept-Ranges": "bytes",
    });
    for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Song unavailable." }, { status: 502 });
  }
}

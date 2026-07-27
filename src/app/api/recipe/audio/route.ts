import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUDIO_URL =
  "https://iyydf3pdxktjrfbv.private.blob.vercel-storage.com/audio/nannas-chicken-long-rice.mp3";

/**
 * Streams Nanna's recipe audio from the private Vercel Blob store,
 * with Range support so browsers can seek within the recording.
 */
export async function GET(req: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const range = req.headers.get("range");
  try {
    const upstream = await fetch(AUDIO_URL, {
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(range ? { range } : {}),
      },
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Audio unavailable." }, { status: 502 });
    }
    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set("Cache-Control", "public, max-age=86400");
    headers.set("Accept-Ranges", "bytes");
    for (const h of ["content-length", "content-range"]) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    return new NextResponse(upstream.body, {
      status: upstream.status === 206 ? 206 : 200,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Audio unavailable." }, { status: 502 });
  }
}

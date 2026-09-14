import { NextResponse } from "next/server";
import { getGalleryMusic } from "@/lib/music";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tracks = await getGalleryMusic();
    return NextResponse.json({
      tracks: tracks.map(({ id, title }) => ({
        id,
        title,
        src: `/api/music/${id}`,
      })),
    });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}

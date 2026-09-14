import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { GALLERY_MUSIC_KEY, getGalleryMusic, type MusicTrack } from "@/lib/music";
import { setSetting } from "@/lib/settings";

async function unauthorized() {
  return (await getSession())
    ? null
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function save(tracks: MusicTrack[]) {
  await setSetting(GALLERY_MUSIC_KEY, JSON.stringify(tracks));
}

export async function GET() {
  const denied = await unauthorized();
  if (denied) return denied;
  return NextResponse.json({ tracks: await getGalleryMusic() });
}

export async function POST(req: NextRequest) {
  const denied = await unauthorized();
  if (denied) return denied;
  try {
    const body = await req.json();
    const url = String(body.url ?? "");
    const blobPathname = String(body.pathname ?? "");
    const mimeType = String(body.mimeType ?? "audio/mpeg");
    const title = String(body.title ?? "Untitled song").trim().slice(0, 200);
    const parsedUrl = new URL(url);
    if (
      !parsedUrl.hostname.endsWith("blob.vercel-storage.com") ||
      !blobPathname.startsWith("nanna-music/") ||
      !blobPathname.toLowerCase().includes(".mp3") ||
      !["audio/mpeg", "audio/mp3"].includes(mimeType)
    ) {
      return NextResponse.json({ error: "Invalid music upload." }, { status: 400 });
    }

    const tracks = await getGalleryMusic();
    const track: MusicTrack = {
      id: crypto.randomUUID(),
      title: title || "Untitled song",
      url,
      blobPathname,
      mimeType,
    };
    tracks.push(track);
    await save(tracks);
    return NextResponse.json({ track });
  } catch (err) {
    console.error("Music registration failed:", err);
    return NextResponse.json({ error: "Could not add that song." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await unauthorized();
  if (denied) return denied;
  try {
    const body = await req.json();
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.map(String) : [];
    const tracks = await getGalleryMusic();
    if (orderedIds.length !== tracks.length || new Set(orderedIds).size !== tracks.length) {
      return NextResponse.json({ error: "Invalid playlist order." }, { status: 400 });
    }
    const byId = new Map(tracks.map((track) => [track.id, track]));
    const reordered = orderedIds.map((id: string) => byId.get(id)).filter(Boolean) as MusicTrack[];
    if (reordered.length !== tracks.length) {
      return NextResponse.json({ error: "Invalid playlist order." }, { status: 400 });
    }
    await save(reordered);
    return NextResponse.json({ tracks: reordered });
  } catch {
    return NextResponse.json({ error: "Could not reorder the playlist." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await unauthorized();
  if (denied) return denied;
  try {
    const { id } = await req.json();
    const tracks = await getGalleryMusic();
    const track = tracks.find((item) => item.id === String(id));
    if (!track) return NextResponse.json({ error: "Song not found." }, { status: 404 });
    const remaining = tracks.filter((item) => item.id !== track.id);
    await save(remaining);
    try {
      await del(track.url);
    } catch (err) {
      // Keep the song removed from the playlist even if Blob cleanup fails.
      console.error("Music blob cleanup failed:", err);
    }
    return NextResponse.json({ tracks: remaining });
  } catch (err) {
    console.error("Music deletion failed:", err);
    return NextResponse.json({ error: "Could not remove that song." }, { status: 500 });
  }
}

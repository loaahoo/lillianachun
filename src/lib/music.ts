import { getSetting } from "@/lib/settings";

export const GALLERY_MUSIC_KEY = "galleryMusic";

export interface MusicTrack {
  id: string;
  title: string;
  url: string;
  blobPathname: string;
  mimeType: string;
}

export async function getGalleryMusic(): Promise<MusicTrack[]> {
  const raw = await getSetting(GALLERY_MUSIC_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (track): track is MusicTrack =>
        typeof track?.id === "string" &&
        typeof track?.title === "string" &&
        typeof track?.url === "string" &&
        typeof track?.blobPathname === "string" &&
        typeof track?.mimeType === "string",
    );
  } catch {
    return [];
  }
}

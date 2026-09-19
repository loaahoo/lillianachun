import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getSession, hasRole } from "@/lib/auth";

const MAX_MP3_SIZE = 30 * 1024 * 1024;
const VIEW_ONLY_MESSAGE = "Your account is view-only, so you can't upload songs.";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HandleUploadBody;
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getSession();
        if (!session) throw new Error("Unauthorized");
        if (!hasRole(session, "editor")) throw new Error(VIEW_ONLY_MESSAGE);
        if (!pathname.startsWith("nanna-music/") || !pathname.toLowerCase().endsWith(".mp3")) {
          throw new Error("Only MP3 uploads are allowed.");
        }
        return {
          allowedContentTypes: ["audio/mpeg", "audio/mp3"],
          maximumSizeInBytes: MAX_MP3_SIZE,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload could not be authorized.";
    const status = message === "Unauthorized" ? 401 : message === VIEW_ONLY_MESSAGE ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

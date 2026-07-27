import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db, photos } from "@/db";
import { getBoolSetting } from "@/lib/settings";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const uploaderName = String(form.get("uploaderName") ?? "").trim();
    const caption = String(form.get("caption") ?? "").trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }
    if (!uploaderName) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Please upload an image file (JPG, PNG, WebP, GIF, or HEIC)." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image is too large (max 10 MB)." }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured.");
      return NextResponse.json(
        { error: "Photo storage is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Try public access first; fall back to private if the store is private.
    let blob: { url: string; pathname: string };
    try {
      blob = await put(`nanna-photos/${Date.now()}-${safeName}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("private")) {
        blob = (await put(`nanna-photos/${Date.now()}-${safeName}`, file, {
          access: "private" as never,
          addRandomSuffix: true,
        })) as { url: string; pathname: string };
      } else {
        throw err;
      }
    }

    const requireApproval = await getBoolSetting("requirePhotoApproval", true);

    const inserted = await db.insert(photos).values({
      uploaderName,
      caption,
      // For private stores the raw URL is not publicly readable; images are
      // always served through /api/photos/image/[id], which signs a URL.
      url: blob.url,
      blobPathname: blob.pathname,
      mimeType: file.type,
      status: requireApproval ? "pending" : "approved",
    }).returning({ id: photos.id });

    return NextResponse.json({ ok: true, id: inserted[0]?.id, autoApproved: !requireApproval });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

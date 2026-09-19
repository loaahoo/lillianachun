import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getBoolSetting, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** GET: current settings (any admin). */
export async function GET() {
  const { denied } = await requireRole("viewer");
  if (denied) return denied;
  const requirePhotoApproval = await getBoolSetting("requirePhotoApproval", true);
  return NextResponse.json({ requirePhotoApproval });
}

/** PATCH: update settings (editors and up). Body: { requirePhotoApproval: boolean } */
export async function PATCH(req: NextRequest) {
  const { denied } = await requireRole("editor");
  if (denied) return denied;
  try {
    const body = await req.json();
    if (typeof body.requirePhotoApproval === "boolean") {
      await setSetting("requirePhotoApproval", String(body.requirePhotoApproval));
    }
    const requirePhotoApproval = await getBoolSetting("requirePhotoApproval", true);
    return NextResponse.json({ ok: true, requirePhotoApproval });
  } catch (err) {
    console.error("Settings update error:", err);
    return NextResponse.json({ error: "Could not update settings." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBoolSetting, setSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** GET: current settings (admin only). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const requirePhotoApproval = await getBoolSetting("requirePhotoApproval", true);
  return NextResponse.json({ requirePhotoApproval });
}

/** PATCH: update settings (admin only). Body: { requirePhotoApproval: boolean } */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

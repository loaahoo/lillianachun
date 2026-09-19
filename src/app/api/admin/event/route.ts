import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { EVENT_FIELDS, getEventDetails } from "@/lib/eventDetails";

export const dynamic = "force-dynamic";

/** GET: current event details (any admin). */
export async function GET() {
  const { denied } = await requireRole("viewer");
  if (denied) return denied;
  return NextResponse.json(await getEventDetails());
}

/** PATCH: update any subset of event fields. Body: { date?, time?, venue?, address?, location?, guests? } */
export async function PATCH(req: NextRequest) {
  const { denied } = await requireRole("editor");
  if (denied) return denied;
  try {
    const body = await req.json();
    for (const field of EVENT_FIELDS) {
      if (typeof body[field] === "string") {
        await setSetting(`event.${field}`, body[field].trim());
      }
    }
    return NextResponse.json({ ok: true, details: await getEventDetails() });
  } catch (err) {
    console.error("Event details update error:", err);
    return NextResponse.json({ error: "Could not update event details." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { EVENT_FIELDS, getEventDetails } from "@/lib/eventDetails";

export const dynamic = "force-dynamic";

/** GET: current event details (admin). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getEventDetails());
}

/** PATCH: update any subset of event fields. Body: { date?, time?, venue?, address?, location?, guests? } */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

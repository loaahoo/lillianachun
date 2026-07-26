import { NextRequest, NextResponse } from "next/server";
import { db, rsvps } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim() || null;
    const phone = String(body.phone ?? "").trim() || null;
    const attendees = Math.min(Math.max(parseInt(body.attendees, 10) || 1, 1), 20);
    const attending = body.attending === "no" ? "no" : "yes";
    const message = String(body.message ?? "").trim() || null;

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Please provide an email or phone number." },
        { status: 400 }
      );
    }

    await db.insert(rsvps).values({ name, email, phone, attendees, attending, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("RSVP error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

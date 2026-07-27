import { NextResponse } from "next/server";
import { getEventDetails } from "@/lib/eventDetails";

export const dynamic = "force-dynamic";

/** GET: public event details for the site to render. */
export async function GET() {
  const details = await getEventDetails();
  return NextResponse.json(details);
}

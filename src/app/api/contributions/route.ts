import { NextResponse } from "next/server";
import { getContributions } from "@/lib/contributions";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ contributions: await getContributions() });
}

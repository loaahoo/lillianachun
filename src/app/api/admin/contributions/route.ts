import { NextRequest, NextResponse } from "next/server";
import { requireRole, type AdminRole } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import {
  CONTRIBUTIONS_KEY,
  getContributions,
  type Contribution,
} from "@/lib/contributions";

async function requireAdmin(min: AdminRole) {
  return (await requireRole(min)).denied;
}

export async function GET() {
  const unauthorized = await requireAdmin("viewer");
  if (unauthorized) return unauthorized;
  return NextResponse.json({ contributions: await getContributions() });
}

export async function PATCH(req: NextRequest) {
  const unauthorized = await requireAdmin("editor");
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const contributions = (body.contributions ?? [])
      .map((item: Contribution) => ({
        name: String(item.name ?? "").trim().slice(0, 200),
        amountCents: Math.max(0, Math.round(Number(item.amountCents) || 0)),
        received: item.received === true,
      }))
      .filter((item: Contribution) => item.name);
    await setSetting(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
    return NextResponse.json({ contributions });
  } catch {
    return NextResponse.json({ error: "Could not save contributions." }, { status: 500 });
  }
}

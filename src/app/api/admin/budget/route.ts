import { NextRequest, NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { budgetItems, db } from "@/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAYMENT_STATUSES = ["planned", "quoted", "deposit_paid", "paid"] as const;

function cleanMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
}

function cleanStatus(value: unknown) {
  return PAYMENT_STATUSES.includes(value as (typeof PAYMENT_STATUSES)[number])
    ? (value as (typeof PAYMENT_STATUSES)[number])
    : "planned";
}

async function requireAdmin() {
  const session = await getSession();
  return session ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const items = await db.select().from(budgetItems).orderBy(asc(budgetItems.sortOrder));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const item = String(body.item ?? "").trim().slice(0, 200);
    if (!item) return NextResponse.json({ error: "Item name is required." }, { status: 400 });
    const [{ value: highest = 0 } = { value: 0 }] = await db
      .select({ value: max(budgetItems.sortOrder) })
      .from(budgetItems);
    const [created] = await db
      .insert(budgetItems)
      .values({
        sortOrder: Number(highest ?? 0) + 1,
        item,
        category: String(body.category ?? "Other").trim().slice(0, 120) || "Other",
        owner: String(body.owner ?? "").trim().slice(0, 200) || null,
        estimatedCents: cleanMoney(body.estimatedCents),
        actualCents: cleanMoney(body.actualCents),
        paymentStatus: cleanStatus(body.paymentStatus),
        notes: String(body.notes ?? "").trim().slice(0, 2000) || null,
      })
      .returning();
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("admin budget POST failed", err);
    return NextResponse.json({ error: "Could not add the budget item." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const id = Number(body.id);
    const item = String(body.item ?? "").trim().slice(0, 200);
    if (!Number.isInteger(id) || !item) {
      return NextResponse.json({ error: "A valid item is required." }, { status: 400 });
    }
    const [updated] = await db
      .update(budgetItems)
      .set({
        item,
        category: String(body.category ?? "Other").trim().slice(0, 120) || "Other",
        owner: String(body.owner ?? "").trim().slice(0, 200) || null,
        estimatedCents: cleanMoney(body.estimatedCents),
        actualCents: cleanMoney(body.actualCents),
        paymentStatus: cleanStatus(body.paymentStatus),
        notes: String(body.notes ?? "").trim().slice(0, 2000) || null,
        updatedAt: new Date(),
      })
      .where(eq(budgetItems.id, id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Budget item not found." }, { status: 404 });
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("admin budget PATCH failed", err);
    return NextResponse.json({ error: "Could not update the budget item." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "A valid item is required." }, { status: 400 });
    }
    const [deleted] = await db.delete(budgetItems).where(eq(budgetItems.id, id)).returning();
    if (!deleted) return NextResponse.json({ error: "Budget item not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin budget DELETE failed", err);
    return NextResponse.json({ error: "Could not remove the budget item." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { asc, eq } from "drizzle-orm";
import { admins, db } from "@/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Team management — owner only.
 *
 * Owners can invite people as "editor" or "viewer", change between those two
 * levels, reset a password, and remove people. Owner accounts themselves are
 * never created, changed, or removed through this API (an owner is set directly
 * in the database), so the owner can't be locked out from here.
 */

const ASSIGNABLE_ROLES = ["editor", "viewer"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// bcrypt only uses the first 72 bytes, so don't accept passwords that are silently truncated.
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

function isAssignableRole(value: unknown): value is AssignableRole {
  return ASSIGNABLE_ROLES.includes(value as AssignableRole);
}

function passwordProblem(value: unknown): string | null {
  if (typeof value !== "string" || value.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  }
  if (value.length > MAX_PASSWORD) {
    return `Password must be ${MAX_PASSWORD} characters or fewer.`;
  }
  return null;
}

/** Never expose password hashes to the browser. */
const publicColumns = {
  id: admins.id,
  email: admins.email,
  name: admins.name,
  role: admins.role,
  mustChangePassword: admins.mustChangePassword,
  createdAt: admins.createdAt,
};

export async function GET() {
  const { denied } = await requireRole("owner");
  if (denied) return denied;
  const members = await db.select(publicColumns).from(admins).orderBy(asc(admins.id));
  return NextResponse.json({
    members: members.map((m) => ({ ...m, mustChangePassword: m.mustChangePassword === 1 })),
  });
}

/** POST: invite someone. Body: { name, email, role, password } (password is temporary). */
export async function POST(req: NextRequest) {
  const { denied } = await requireRole("owner");
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim().slice(0, 200);
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!name) return NextResponse.json({ error: "Please enter their name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email) || email.length > 320) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!isAssignableRole(body.role)) {
      return NextResponse.json({ error: "Choose Editor or View only." }, { status: 400 });
    }
    const problem = passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const [existing] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    if (existing) {
      return NextResponse.json({ error: "Someone with that email already has a login." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const [created] = await db
      .insert(admins)
      .values({ email, name, role: body.role, passwordHash, mustChangePassword: 1 })
      .returning(publicColumns);
    return NextResponse.json(
      { member: { ...created, mustChangePassword: created.mustChangePassword === 1 } },
      { status: 201 },
    );
  } catch (err) {
    console.error("Team invite failed:", err);
    return NextResponse.json({ error: "Could not add that person." }, { status: 500 });
  }
}

/** PATCH: change someone's level and/or reset their password. Body: { id, role?, password? } */
export async function PATCH(req: NextRequest) {
  const { denied } = await requireRole("owner");
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "A valid person is required." }, { status: 400 });
    }

    const [target] = await db
      .select({ id: admins.id, role: admins.role })
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    if (!target) return NextResponse.json({ error: "That person was not found." }, { status: 404 });
    if (target.role === "owner") {
      return NextResponse.json({ error: "The owner account can't be changed here." }, { status: 403 });
    }

    const updates: Partial<typeof admins.$inferInsert> = {};
    if (body.role !== undefined) {
      if (!isAssignableRole(body.role)) {
        return NextResponse.json({ error: "Choose Editor or View only." }, { status: 400 });
      }
      updates.role = body.role;
    }
    if (body.password !== undefined) {
      const problem = passwordProblem(body.password);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
      updates.passwordHash = await bcrypt.hash(body.password, 12);
      updates.mustChangePassword = 1;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const [updated] = await db
      .update(admins)
      .set(updates)
      .where(eq(admins.id, id))
      .returning(publicColumns);
    return NextResponse.json({
      member: { ...updated, mustChangePassword: updated.mustChangePassword === 1 },
    });
  } catch (err) {
    console.error("Team update failed:", err);
    return NextResponse.json({ error: "Could not update that person." }, { status: 500 });
  }
}

/** DELETE: remove someone's login. Body: { id }. Takes effect on their next request. */
export async function DELETE(req: NextRequest) {
  const { denied } = await requireRole("owner");
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "A valid person is required." }, { status: 400 });
    }

    const [target] = await db
      .select({ id: admins.id, role: admins.role })
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);
    if (!target) return NextResponse.json({ error: "That person was not found." }, { status: 404 });
    if (target.role === "owner") {
      return NextResponse.json({ error: "The owner account can't be removed." }, { status: 403 });
    }

    await db.delete(admins).where(eq(admins.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Team removal failed:", err);
    return NextResponse.json({ error: "Could not remove that person." }, { status: 500 });
  }
}

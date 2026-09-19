import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { admins, db } from "@/db";
import { requireRole } from "@/lib/auth";

/**
 * POST: change your own password (any signed-in admin, including view-only).
 * Body: { currentPassword, newPassword }. Also clears the "must change
 * password" flag that's set when an owner gives someone a temporary password.
 */
export async function POST(req: NextRequest) {
  const { session, denied } = await requireRole("viewer");
  if (denied) return denied;
  try {
    const { currentPassword, newPassword } = await req.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Both passwords are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (newPassword.length > 72) {
      return NextResponse.json({ error: "New password must be 72 characters or fewer." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: "Choose a password different from the current one." }, { status: 400 });
    }

    const [admin] = await db
      .select({ passwordHash: admins.passwordHash })
      .from(admins)
      .where(eq(admins.id, session.adminId))
      .limit(1);
    if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
      return NextResponse.json({ error: "Your current password is not correct." }, { status: 400 });
    }

    await db
      .update(admins)
      .set({ passwordHash: await bcrypt.hash(newPassword, 12), mustChangePassword: 0 })
      .where(eq(admins.id, session.adminId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Password change failed:", err);
    return NextResponse.json({ error: "Could not change your password." }, { status: 500 });
  }
}

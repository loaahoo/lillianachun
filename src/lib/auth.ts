import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { admins, db } from "@/db";

const COOKIE_NAME = "nanna_admin_session";
const SESSION_HOURS = 24 * 7; // one week

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required");
  return new TextEncoder().encode(secret);
}

export type AdminRole = "owner" | "editor" | "viewer";

const ROLE_RANK: Record<AdminRole, number> = { viewer: 1, editor: 2, owner: 3 };

export interface AdminSession {
  adminId: number;
  email: string;
  name: string | null;
  role: AdminRole;
  mustChangePassword: boolean;
}

/** Create a signed session token and set it as an httpOnly cookie. */
export async function createSession(session: { adminId: number; email: string }): Promise<void> {
  const token = await new SignJWT({ adminId: session.adminId, email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

/**
 * Read and verify the current admin session; returns null if absent/invalid.
 *
 * The cookie only proves *who* signed in. The admin's current role is always
 * read from the database, so promoting, demoting, or removing someone takes
 * effect on their very next request instead of when their cookie expires.
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let adminId: number;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.adminId !== "number") return null;
    adminId = payload.adminId;
  } catch {
    return null;
  }

  try {
    const [admin] = await db
      .select({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        mustChangePassword: admins.mustChangePassword,
      })
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);
    if (!admin) return null; // account was removed
    return {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword === 1,
    };
  } catch (err) {
    console.error("Session lookup failed:", err);
    return null; // fail closed
  }
}

/** True when the session's role is at least `min` (owner > editor > viewer). */
export function hasRole(session: AdminSession, min: AdminRole): boolean {
  return ROLE_RANK[session.role] >= ROLE_RANK[min];
}

/**
 * Guard for admin API routes. Usage:
 *
 *   const { session, denied } = await requireRole("editor");
 *   if (denied) return denied;
 *
 * - "viewer": any signed-in admin (read-only endpoints)
 * - "editor": anything that changes data
 * - "owner":  managing other admins
 */
export async function requireRole(
  min: AdminRole,
): Promise<
  | { session: AdminSession; denied: null }
  | { session: null; denied: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { session: null, denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!hasRole(session, min)) {
    const error =
      min === "owner"
        ? "Only the site owner can do that."
        : "Your account is view-only, so you can't make changes.";
    return { session: null, denied: NextResponse.json({ error }, { status: 403 }) };
  }
  return { session, denied: null };
}

/** Clear the admin session cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

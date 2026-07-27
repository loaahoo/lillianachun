import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, planTasks, workstreams } from "@/db";

export const dynamic = "force-dynamic";

/** GET /api/planning — full tracker: workstreams with their tasks. */
export async function GET() {
  try {
    const ws = await db.select().from(workstreams).orderBy(asc(workstreams.sortOrder));
    const tasks = await db.select().from(planTasks).orderBy(asc(planTasks.sortOrder));
    const result = ws.map(w => ({
      ...w,
      tasks: tasks.filter(t => t.workstreamId === w.id),
    }));
    return NextResponse.json({ workstreams: result });
  } catch (err) {
    console.error("planning GET failed", err);
    return NextResponse.json({ error: "Failed to load the plan" }, { status: 500 });
  }
}

/**
 * PATCH /api/planning — family updates.
 * Body: { action: "toggleTask", taskId, done, completedBy? }
 *     | { action: "setStatus", workstreamId, status }
 *     | { action: "setOwner", workstreamId, owner }
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "toggleTask") {
      const done = body.done ? 1 : 0;
      await db
        .update(planTasks)
        .set({
          done,
          completedBy: done ? (body.completedBy?.slice(0, 200) || null) : null,
          updatedAt: new Date(),
        })
        .where(eq(planTasks.id, Number(body.taskId)));
      return NextResponse.json({ ok: true });
    }
    if (body.action === "setStatus") {
      const allowed = ["not_started", "in_progress", "done"];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: "Bad status" }, { status: 400 });
      }
      await db
        .update(workstreams)
        .set({ status: body.status, updatedAt: new Date() })
        .where(eq(workstreams.id, Number(body.workstreamId)));
      return NextResponse.json({ ok: true });
    }
    if (body.action === "setOwner") {
      await db
        .update(workstreams)
        .set({ owner: String(body.owner ?? "").slice(0, 200) || null, updatedAt: new Date() })
        .where(eq(workstreams.id, Number(body.workstreamId)));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("planning PATCH failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

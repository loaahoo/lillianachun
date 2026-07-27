"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface PlanTask {
  id: number;
  workstreamId: number;
  label: string;
  done: number;
  completedBy: string | null;
}

interface Workstream {
  id: number;
  name: string;
  emoji: string | null;
  owner: string | null;
  budget: string | null;
  deadline: string | null;
  objective: string | null;
  status: "not_started" | "in_progress" | "done";
  isCriticalPath: number;
  tasks: PlanTask[];
}

const STATUS_META: Record<Workstream["status"], { label: string; cls: string }> = {
  not_started: { label: "Not started", cls: "bg-ink/10 text-ink/70" },
  in_progress: { label: "In progress", cls: "bg-plumeria/30 text-[#7a5c00]" },
  done: { label: "Done", cls: "bg-palm/15 text-palm" },
};

const CRITICAL_PATH = [
  "Venue confirmed",
  "Total budget defined",
  "Decor lead assigned",
  "Food plan locked",
  "MC assigned",
];

export default function PlanningBoard() {
  const [data, setData] = useState<Workstream[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [editingOwnerId, setEditingOwnerId] = useState<number | null>(null);
  const [ownerDraft, setOwnerDraft] = useState("");

  useEffect(() => {
    setMemberName(localStorage.getItem("ohana_name") ?? "");
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/planning");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.workstreams);
      setError(null);
    } catch {
      setError("Couldn't load the plan. Please refresh.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const progress = useMemo(() => {
    if (!data) return { done: 0, total: 0, pct: 0 };
    const all = data.flatMap(w => w.tasks);
    const done = all.filter(t => t.done).length;
    return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [data]);

  const rememberName = (value: string) => {
    setMemberName(value);
    localStorage.setItem("ohana_name", value);
  };

  const toggleTask = async (task: PlanTask) => {
    if (!data) return;
    const nextDone = task.done ? 0 : 1;
    // optimistic update
    setData(prev =>
      prev!.map(w =>
        w.id === task.workstreamId
          ? {
              ...w,
              tasks: w.tasks.map(t =>
                t.id === task.id
                  ? { ...t, done: nextDone, completedBy: nextDone ? memberName || "'Ohana" : null }
                  : t,
              ),
            }
          : w,
      ),
    );
    const res = await fetch("/api/planning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggleTask",
        taskId: task.id,
        done: !!nextDone,
        completedBy: memberName || "'Ohana",
      }),
    });
    if (!res.ok) load(); // rollback via reload
  };

  const setStatus = async (w: Workstream, status: Workstream["status"]) => {
    setData(prev => prev!.map(x => (x.id === w.id ? { ...x, status } : x)));
    const res = await fetch("/api/planning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setStatus", workstreamId: w.id, status }),
    });
    if (!res.ok) load();
  };

  const startEditOwner = (w: Workstream) => {
    setEditingOwnerId(w.id);
    setOwnerDraft(w.owner && !w.owner.includes("Needs") ? w.owner : "");
  };

  const saveOwner = async (w: Workstream) => {
    const owner = ownerDraft.trim() || "Needs a lead!";
    setEditingOwnerId(null);
    setData(prev => prev!.map(x => (x.id === w.id ? { ...x, owner } : x)));
    const res = await fetch("/api/planning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setOwner", workstreamId: w.id, owner }),
    });
    if (!res.ok) load();
  };

  if (error) {
    return <p className="rounded-2xl bg-hibiscus/10 p-6 text-center font-semibold text-hibiscus">{error}</p>;
  }
  if (!data) {
    return <p className="py-16 text-center font-display text-2xl text-lagoon/60">Loading the plan…</p>;
  }

  return (
    <div className="space-y-10">
      {/* Overall progress + name */}
      <div className="rounded-[1.5rem] border border-gold/25 bg-shell p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-lagoon-deep">
              Overall progress
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              {progress.done} of {progress.total} tasks pau ({progress.pct}%)
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
            Your name:
            <input
              value={memberName}
              onChange={e => rememberName(e.target.value)}
              placeholder="e.g. Leighton"
              className="rounded-full border border-gold/30 bg-white px-4 py-1.5 text-sm outline-none focus:border-lagoon"
            />
          </label>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-palm via-plumeria to-hibiscus transition-all duration-500"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Critical path */}
      <div className="rounded-[1.5rem] border-2 border-hibiscus/30 bg-hibiscus/5 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-hibiscus">
          🚨 Critical path — these unblock everything else
        </h2>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {CRITICAL_PATH.map((item, i) => (
            <li key={item} className="rounded-xl bg-white/80 px-4 py-3 text-sm font-bold text-ink/80 shadow-sm">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-hibiscus text-xs text-white">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Workstreams */}
      <div className="grid gap-6 lg:grid-cols-2">
        {data.map(w => {
          const doneCount = w.tasks.filter(t => t.done).length;
          const meta = STATUS_META[w.status];
          return (
            <div
              key={w.id}
              className={`rounded-[1.5rem] border bg-shell p-6 shadow-sm ${
                w.isCriticalPath ? "border-hibiscus/40" : "border-gold/25"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-lagoon-deep">
                    {w.emoji} {w.name}
                    {w.isCriticalPath ? (
                      <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wider text-hibiscus">
                        critical
                      </span>
                    ) : null}
                  </h3>
                  {editingOwnerId === w.id ? (
                    <form
                      className="mt-1 flex flex-wrap items-center gap-2"
                      onSubmit={e => {
                        e.preventDefault();
                        saveOwner(w);
                      }}
                    >
                      <input
                        autoFocus
                        value={ownerDraft}
                        onChange={e => setOwnerDraft(e.target.value)}
                        placeholder="Lead's name"
                        maxLength={200}
                        className="rounded-full border border-gold/40 bg-white px-3 py-1 text-sm outline-none focus:border-lagoon"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-palm px-3 py-1 text-xs font-bold text-white hover:bg-palm/90"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingOwnerId(null)}
                        className="rounded-full px-2 py-1 text-xs font-semibold text-ink/60 hover:bg-sand-deep"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <p className="mt-1 text-sm text-ink/60">
                      <button
                        type="button"
                        onClick={() => startEditOwner(w)}
                        title="Change lead"
                        className={`group inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 -mx-1.5 transition-colors hover:bg-sand-deep ${
                          w.owner?.includes("Needs") ? "font-bold text-hibiscus" : "font-semibold"
                        }`}
                      >
                        {w.owner || "Unassigned"}
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-ink/35 transition-colors group-hover:text-lagoon"
                        >
                          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.9 8.9a1 1 0 0 1-.45.26l-3.11.88a.5.5 0 0 1-.617-.618l.88-3.11a1 1 0 0 1 .26-.45l8.9-8.9z" />
                        </svg>
                        <span className="sr-only">Edit lead for {w.name}</span>
                      </button>
                      {" · "}{w.budget}{" · "}{w.deadline}
                    </p>
                  )}
                </div>
                <select
                  value={w.status}
                  onChange={e => setStatus(w, e.target.value as Workstream["status"])}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold outline-none ${meta.cls}`}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              {w.objective ? (
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{w.objective}</p>
              ) : null}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand-deep">
                <div
                  className="h-full rounded-full bg-palm transition-all duration-500"
                  style={{ width: `${w.tasks.length ? (doneCount / w.tasks.length) * 100 : 0}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2">
                {w.tasks.map(t => (
                  <li key={t.id}>
                    <button
                      onClick={() => toggleTask(t)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-sand-deep/50"
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                          t.done
                            ? "border-palm bg-palm text-white"
                            : "border-ink/25 bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={`text-sm ${t.done ? "text-ink/40 line-through" : "text-ink/85"}`}>
                        {t.label}
                        {t.done && t.completedBy ? (
                          <span className="ml-2 text-xs italic text-palm/80 no-underline">
                            — {t.completedBy}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

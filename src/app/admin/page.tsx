"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface AdminPhoto {
  id: number;
  uploaderName: string;
  caption: string | null;
  url: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface AdminRsvp {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  attendees: number;
  attending: "yes" | "no";
  message: string | null;
  createdAt: string;
}

type Tab = "pending" | "approved" | "rejected" | "rsvps" | "event";

interface EventDetailsForm {
  date: string;
  time: string;
  venue: string;
  address: string;
  location: string;
  guests: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [rsvps, setRsvps] = useState<AdminRsvp[]>([]);
  const [totalGuests, setTotalGuests] = useState(0);
  const [tab, setTab] = useState<Tab>("pending");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requireApproval, setRequireApproval] = useState<boolean | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [approveAllState, setApproveAllState] = useState<"idle" | "confirm" | "working">("idle");
  const [eventForm, setEventForm] = useState<EventDetailsForm | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventSavedAt, setEventSavedAt] = useState<number | null>(null);
  const [eventError, setEventError] = useState("");
  const [editingRsvpId, setEditingRsvpId] = useState<number | null>(null);
  const [rsvpForm, setRsvpForm] = useState<{
    name: string;
    email: string;
    phone: string;
    attendees: number;
    attending: "yes" | "no";
    message: string;
  } | null>(null);
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  const startEditRsvp = (r: AdminRsvp) => {
    setEditingRsvpId(r.id);
    setRsvpError("");
    setRsvpForm({
      name: r.name,
      email: r.email ?? "",
      phone: r.phone ?? "",
      attendees: r.attendees,
      attending: r.attending,
      message: r.message ?? "",
    });
  };

  const cancelEditRsvp = () => {
    setEditingRsvpId(null);
    setRsvpForm(null);
    setRsvpError("");
  };

  const saveRsvp = async () => {
    if (editingRsvpId == null || !rsvpForm) return;
    setRsvpSaving(true);
    setRsvpError("");
    try {
      const res = await fetch("/api/admin/rsvps", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingRsvpId,
          name: rsvpForm.name,
          email: rsvpForm.email || null,
          phone: rsvpForm.phone || null,
          attendees: rsvpForm.attendees,
          attending: rsvpForm.attending,
          message: rsvpForm.message || null,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRsvpError(d.error || "Could not save changes.");
        return;
      }
      const updated = d.rsvp as AdminRsvp;
      setRsvps((prev) => {
        const next = prev.map((r) => (r.id === updated.id ? updated : r));
        setTotalGuests(
          next.filter((r) => r.attending === "yes").reduce((s, r) => s + r.attendees, 0),
        );
        return next;
      });
      cancelEditRsvp();
    } catch {
      setRsvpError("Network error — please try again.");
    } finally {
      setRsvpSaving(false);
    }
  };

  const load = useCallback(async () => {
    try {
      setDataLoading(true);
      setLoadError("");
      const meRes = await fetch("/api/admin/me", { credentials: "include" });
      const me = await meRes.json().catch(() => ({ admin: null }));
      if (!me?.admin) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const [photosRes, rsvpsRes, settingsRes, eventRes] = await Promise.all([
        fetch("/api/admin/photos", { credentials: "include" }),
        fetch("/api/admin/rsvps", { credentials: "include" }),
        fetch("/api/admin/settings", { credentials: "include" }),
        fetch("/api/admin/event", { credentials: "include" }),
      ]);
      if (!photosRes.ok || !rsvpsRes.ok) {
        setLoadError("Some data failed to load. Please refresh the page.");
      }
      if (photosRes.ok) {
        const d = await photosRes.json().catch(() => ({ photos: [] }));
        setPhotos(d.photos ?? []);
      }
      if (rsvpsRes.ok) {
        const d = await rsvpsRes.json().catch(() => ({ rsvps: [], totalGuests: 0 }));
        setRsvps(d.rsvps ?? []);
        setTotalGuests(d.totalGuests ?? 0);
      }
      if (settingsRes.ok) {
        const d = await settingsRes.json().catch(() => ({}));
        if (typeof d.requirePhotoApproval === "boolean") {
          setRequireApproval(d.requirePhotoApproval);
        }
      }
      if (eventRes.ok) {
        const d = await eventRes.json().catch(() => null);
        if (d && typeof d.date === "string") {
          setEventForm({
            date: d.date ?? "",
            time: d.time ?? "",
            venue: d.venue ?? "",
            address: d.address ?? "",
            location: d.location ?? "",
            guests: d.guests ?? "",
          });
        }
      }
    } catch (err) {
      console.error("Admin load failed:", err);
      // On unexpected failure, send back to login rather than hanging.
      setAuthed(false);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (authed === false) router.push("/admin/login");
  }, [authed, router]);

  async function review(photoId: number, status: "approved" | "rejected" | "pending") {
    setBusyId(photoId);
    // Optimistic update
    const prevPhotos = photos;
    setPhotos((p) => p.map((ph) => (ph.id === photoId ? { ...ph, status } : ph)));
    try {
      const res = await fetch("/api/admin/photos/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPhotos(prevPhotos);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleApproval() {
    if (requireApproval === null || toggleBusy) return;
    const next = !requireApproval;
    setToggleBusy(true);
    setRequireApproval(next); // optimistic
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirePhotoApproval: next }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setRequireApproval(d.requirePhotoApproval);
    } catch {
      setRequireApproval(!next); // rollback
    } finally {
      setToggleBusy(false);
    }
  }

  async function approveAll() {
    if (approveAllState === "idle") {
      setApproveAllState("confirm");
      return;
    }
    if (approveAllState !== "confirm") return;
    setApproveAllState("working");
    const prevPhotos = photos;
    // Optimistic: mark all pending as approved
    setPhotos((p) => p.map((ph) => (ph.status === "pending" ? { ...ph, status: "approved" } : ph)));
    try {
      const res = await fetch("/api/admin/photos/approve-all", { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setPhotos(prevPhotos);
    } finally {
      setApproveAllState("idle");
    }
  }

  async function saveEventDetails() {
    if (!eventForm || eventSaving) return;
    setEventSaving(true);
    setEventError("");
    try {
      const res = await fetch("/api/admin/event", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      if (d.details) setEventForm(d.details);
      setEventSavedAt(Date.now());
    } catch {
      setEventError("Could not save. Please try again.");
    } finally {
      setEventSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
  }

  if (authed === null || (authed && dataLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="animate-pulse font-display text-2xl text-ocean-deep">Loading…</p>
      </div>
    );
  }
  if (authed === false) return null;

  const counts = {
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
  };
  const shown = tab === "rsvps" ? [] : photos.filter((p) => p.status === tab);

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-[color:var(--sand-deep)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="font-display text-2xl text-ocean-deep">Family Admin</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink hover:bg-sand-deep"
            >
              View site
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-ink/10 px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-ink/20"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loadError && (
          <p className="mb-4 rounded-2xl bg-hibiscus/10 px-4 py-3 text-sm font-semibold text-hibiscus">
            {loadError}
          </p>
        )}

        {/* Photo approval requirement toggle */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-ink">Require approval for new photos</p>
            <p className="text-sm text-ink/60">
              {requireApproval === false
                ? "OFF — new uploads go straight to the gallery without review."
                : "ON — new uploads wait in Pending until you approve them."}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={requireApproval === true}
            onClick={toggleApproval}
            disabled={requireApproval === null || toggleBusy}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              requireApproval ? "bg-palm" : "bg-ink/25"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                requireApproval ? "left-7" : "left-1"
              }`}
            />
            <span className="sr-only">Toggle photo approval requirement</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pending", `Pending (${counts.pending})`],
              ["approved", `Approved (${counts.approved})`],
              ["rejected", `Rejected (${counts.rejected})`],
              ["rsvps", `RSVPs (${rsvps.length})`],
              ["event", "🎉 Event Details"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                tab === t ? "bg-ocean text-white" : "bg-white text-ink hover:bg-sand-deep"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Photo review */}
        {tab !== "rsvps" && tab !== "event" && (
          <div className="mt-6">
            {tab === "pending" && counts.pending > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={approveAll}
                  disabled={approveAllState === "working"}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                    approveAllState === "confirm"
                      ? "bg-hibiscus hover:bg-hibiscus/90"
                      : "bg-palm hover:bg-palm/90"
                  }`}
                >
                  {approveAllState === "working"
                    ? "Approving…"
                    : approveAllState === "confirm"
                      ? `Yes, approve all ${counts.pending} photos ✓`
                      : `✓ Approve all ${counts.pending} pending`}
                </button>
                {approveAllState === "confirm" && (
                  <button
                    onClick={() => setApproveAllState("idle")}
                    className="rounded-full bg-ink/10 px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-ink/20"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
            {shown.length === 0 ? (
              <p className="rounded-2xl bg-white/70 p-10 text-center text-ink/60">
                {tab === "pending"
                  ? "No photos waiting for review. 🎉"
                  : `No ${tab} photos yet.`}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption ?? `Photo from ${p.uploaderName}`}
                      className="h-52 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <p className="font-bold">{p.uploaderName}</p>
                      {p.caption && <p className="mt-1 text-sm text-ink/70">{p.caption}</p>}
                      <p className="mt-1 text-xs text-ink/50">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-3 flex gap-2">
                        {p.status !== "approved" && (
                          <button
                            onClick={() => review(p.id, "approved")}
                            disabled={busyId === p.id}
                            className="flex-1 rounded-full bg-palm px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-palm/90 disabled:opacity-60"
                          >
                            ✓ Approve
                          </button>
                        )}
                        {p.status !== "rejected" && (
                          <button
                            onClick={() => review(p.id, "rejected")}
                            disabled={busyId === p.id}
                            className="flex-1 rounded-full bg-hibiscus px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-hibiscus/90 disabled:opacity-60"
                          >
                            ✕ Reject
                          </button>
                        )}
                        {p.status !== "pending" && (
                          <button
                            onClick={() => review(p.id, "pending")}
                            disabled={busyId === p.id}
                            className="rounded-full bg-ink/10 px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink/20 disabled:opacity-60"
                          >
                            ↺
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RSVP list */}
        {tab === "rsvps" && (
          <div className="mt-6">
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-black text-ocean-deep">{totalGuests}</p>
                <p className="text-sm text-ink/60">Total guests attending</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-black text-palm">
                  {rsvps.filter((r) => r.attending === "yes").length}
                </p>
                <p className="text-sm text-ink/60">Yes responses</p>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-black text-hibiscus">
                  {rsvps.filter((r) => r.attending === "no").length}
                </p>
                <p className="text-sm text-ink/60">Regrets</p>
              </div>
            </div>
            {rsvps.length === 0 ? (
              <p className="rounded-2xl bg-white/70 p-10 text-center text-ink/60">
                No RSVPs yet.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="border-b border-[color:var(--sand-deep)] text-xs uppercase text-ink/60">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Attending</th>
                      <th className="px-4 py-3">Guests</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((r) =>
                      editingRsvpId === r.id && rsvpForm ? (
                        <tr key={r.id} className="border-b border-[color:var(--sand-deep)]/60 bg-sand/40 last:border-0">
                          <td className="px-4 py-3">
                            <input
                              value={rsvpForm.name}
                              onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                              className="w-32 rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                              placeholder="Name"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <input
                                value={rsvpForm.email}
                                onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                                className="w-40 rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                                placeholder="Email"
                              />
                              <input
                                value={rsvpForm.phone}
                                onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                                className="w-40 rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                                placeholder="Phone"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={rsvpForm.attending}
                              onChange={(e) =>
                                setRsvpForm({ ...rsvpForm, attending: e.target.value as "yes" | "no" })
                              }
                              className="rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              max={50}
                              value={rsvpForm.attendees}
                              onChange={(e) =>
                                setRsvpForm({ ...rsvpForm, attendees: Number(e.target.value) })
                              }
                              className="w-16 rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              value={rsvpForm.message}
                              onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                              className="w-36 rounded-lg border border-[color:var(--sand-deep)] px-2 py-1.5 text-sm"
                              placeholder="Note"
                            />
                          </td>
                          <td className="px-4 py-3 text-ink/50">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={saveRsvp}
                                disabled={rsvpSaving}
                                className="rounded-full bg-palm px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-palm/85 disabled:opacity-50"
                              >
                                {rsvpSaving ? "Saving…" : "Save"}
                              </button>
                              <button
                                onClick={cancelEditRsvp}
                                disabled={rsvpSaving}
                                className="rounded-full border border-ink/20 px-4 py-1.5 text-xs font-bold text-ink/70 transition-colors hover:bg-ink/5"
                              >
                                Cancel
                              </button>
                              {rsvpError && (
                                <p className="max-w-[10rem] text-xs text-hibiscus">{rsvpError}</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={r.id} className="border-b border-[color:var(--sand-deep)]/60 last:border-0">
                          <td className="px-4 py-3 font-semibold">{r.name}</td>
                          <td className="px-4 py-3 text-ink/70">
                            {[r.email, r.phone].filter(Boolean).join(" · ") || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                r.attending === "yes"
                                  ? "bg-palm/10 text-palm"
                                  : "bg-hibiscus/10 text-hibiscus"
                              }`}
                            >
                              {r.attending === "yes" ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-4 py-3">{r.attending === "yes" ? r.attendees : "—"}</td>
                          <td className="max-w-xs px-4 py-3 text-ink/70">{r.message || "—"}</td>
                          <td className="px-4 py-3 text-ink/50">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => startEditRsvp(r)}
                              className="rounded-full border border-ocean/40 px-4 py-1.5 text-xs font-bold text-ocean transition-colors hover:bg-ocean hover:text-white"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Event details editor */}
        {tab === "event" && (
          <div className="mt-6 max-w-2xl">
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl text-ocean-deep">Party Details</h2>
              <p className="mt-1 text-sm text-ink/60">
                These appear on the homepage, RSVP page, schedule, and footer.
                Changes go live the moment you save.
              </p>
              {eventForm ? (
                <div className="mt-6 grid gap-4">
                  {(
                    [
                      ["date", "Date", "e.g. Sunday, December 27, 2026"],
                      ["time", "Time", "e.g. 4:00 PM – 8:30 PM"],
                      ["venue", "Venue name", "e.g. Harry & Jeanette Weinberg Memorial Hall"],
                      ["address", "Address", "e.g. 2685 N Nimitz Hwy, Honolulu, HI 96819"],
                      ["location", "Area / short location", "e.g. Honolulu, Hawaii"],
                      ["guests", "Who's invited", "e.g. About 200 family & friends"],
                    ] as [keyof EventDetailsForm, string, string][]
                  ).map(([field, label, placeholder]) => (
                    <div key={field}>
                      <label
                        htmlFor={`event-${field}`}
                        className="mb-1 block text-sm font-bold text-ink"
                      >
                        {label}
                      </label>
                      <input
                        id={`event-${field}`}
                        type="text"
                        value={eventForm[field]}
                        onChange={(e) =>
                          setEventForm((f) => (f ? { ...f, [field]: e.target.value } : f))
                        }
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
                      />
                    </div>
                  ))}
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={saveEventDetails}
                      disabled={eventSaving}
                      className="rounded-full bg-ocean px-8 py-3 font-bold text-white transition-colors hover:bg-ocean-deep disabled:opacity-60"
                    >
                      {eventSaving ? "Saving…" : "Save details"}
                    </button>
                    {eventSavedAt && !eventSaving && !eventError && (
                      <span className="text-sm font-semibold text-palm">✓ Saved — live on the site</span>
                    )}
                    {eventError && (
                      <span className="text-sm font-semibold text-hibiscus">{eventError}</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-ink/60">Loading current details…</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

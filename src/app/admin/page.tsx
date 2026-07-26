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

type Tab = "pending" | "approved" | "rejected" | "rsvps";

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
      const [photosRes, rsvpsRes] = await Promise.all([
        fetch("/api/admin/photos", { credentials: "include" }),
        fetch("/api/admin/rsvps", { credentials: "include" }),
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
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pending", `Pending (${counts.pending})`],
              ["approved", `Approved (${counts.approved})`],
              ["rejected", `Rejected (${counts.rejected})`],
              ["rsvps", `RSVPs (${rsvps.length})`],
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
        {tab !== "rsvps" && (
          <div className="mt-6">
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
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((r) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

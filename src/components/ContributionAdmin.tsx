"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contribution } from "@/lib/contributions";

function dollarsToCents(value: string) {
  if (value === "") return 0;
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

export default function ContributionAdmin() {
  const [items, setItems] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/admin/contributions", { credentials: "include" })
      .then(res => res.json())
      .then(data => setItems(data.contributions ?? []))
      .catch(() => setMessage("Could not load family contributions."))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.amountCents, 0), [items]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/contributions", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributions: items }),
      });
      if (!res.ok) throw new Error();
      setMessage("✓ Contributions saved and live.");
    } catch {
      setMessage("Could not save family contributions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="mt-8 text-ink/60">Loading contributions…</p>;

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-display text-2xl text-ocean-deep">Family contributions</h2>
      <p className="mt-1 text-sm text-ink/60">Edit the amounts pledged on the public Planning page.</p>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
            <input
              aria-label="Contributor name"
              value={item.name}
              onChange={e => setItems(current => current.map((value, i) => i === index ? { ...value, name: e.target.value } : value))}
              className="rounded-xl border border-sand-deep px-3 py-2"
            />
            <label className="text-xs font-bold text-ink/60">Pledged $
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.amountCents / 100 || ""}
                onChange={e => setItems(current => current.map((value, i) => i === index ? { ...value, amountCents: dollarsToCents(e.target.value) } : value))}
                className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink"
              />
            </label>
            <button
              type="button"
              onClick={() => setItems(current => current.filter((_, i) => i !== index))}
              className="self-end rounded-full px-4 py-2 text-sm font-bold text-hibiscus hover:bg-hibiscus/10"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setItems(current => [...current, { name: "", amountCents: 0 }])} className="rounded-full bg-ocean px-5 py-2 text-sm font-bold text-white">
          + Add person
        </button>
        <button type="button" onClick={save} disabled={saving} className="rounded-full bg-palm px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save contributions"}
        </button>
        <span className="font-semibold text-ink/65">Total pledged: ${(total / 100).toLocaleString()}</span>
      </div>
      {message && <p className={`mt-3 text-sm font-semibold ${message.startsWith("✓") ? "text-palm" : "text-hibiscus"}`}>{message}</p>}
    </section>
  );
}

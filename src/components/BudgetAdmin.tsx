"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PaymentStatus = "planned" | "quoted" | "deposit_paid" | "paid";

interface BudgetItem {
  id: number;
  item: string;
  category: string;
  owner: string | null;
  estimatedCents: number;
  actualCents: number;
  paymentStatus: PaymentStatus;
  notes: string | null;
}

type BudgetDraft = Omit<BudgetItem, "id">;

const EMPTY_DRAFT: BudgetDraft = {
  item: "",
  category: "Other",
  owner: "",
  estimatedCents: 0,
  actualCents: 0,
  paymentStatus: "planned",
  notes: "",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function BudgetAdmin() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [drafts, setDrafts] = useState<Record<number, BudgetDraft>>({});
  const [newItem, setNewItem] = useState<BudgetDraft>(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/budget", { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const loaded = (data.items ?? []) as BudgetItem[];
      setItems(loaded);
      setDrafts(Object.fromEntries(loaded.map(item => [item.id, { ...item }])));
      setMessage("");
    } catch {
      setMessage("Could not load the budget.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totals = useMemo(() => ({
    estimated: items.reduce((sum, item) => sum + item.estimatedCents, 0),
    actual: items.reduce((sum, item) => sum + item.actualCents, 0),
  }), [items]);

  const updateDraft = (id: number, changes: Partial<BudgetDraft>) => {
    setDrafts(current => ({ ...current, [id]: { ...current[id], ...changes } }));
  };

  const save = async (id: number) => {
    const draft = drafts[id];
    if (!draft?.item.trim()) {
      setMessage("Every budget item needs a name.");
      return;
    }
    setBusyId(id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/budget", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(current => current.map(item => item.id === id ? data.item : item));
      setDrafts(current => ({ ...current, [id]: { ...data.item } }));
      setMessage("✓ Budget item saved and live.");
    } catch {
      setMessage("Could not save that budget item.");
    } finally {
      setBusyId(null);
    }
  };

  const add = async () => {
    if (!newItem.item.trim()) {
      setMessage("Enter an expense name first.");
      return;
    }
    setBusyId("new");
    setMessage("");
    try {
      const res = await fetch("/api/admin/budget", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(current => [...current, data.item]);
      setDrafts(current => ({ ...current, [data.item.id]: { ...data.item } }));
      setNewItem(EMPTY_DRAFT);
      setMessage("✓ Expense added and live.");
    } catch {
      setMessage("Could not add the expense.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    const item = items.find(value => value.id === id);
    if (!item || !window.confirm(`Remove “${item.item}” from the budget?`)) return;
    setBusyId(id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/budget", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setItems(current => current.filter(value => value.id !== id));
      setDrafts(current => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setMessage("Expense removed.");
    } catch {
      setMessage("Could not remove that expense.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="mt-6 text-ink/60">Loading budget…</p>;

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Estimated total</p>
          <p className="mt-1 font-display text-3xl text-ocean-deep">{currency.format(totals.estimated / 100)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Actual total</p>
          <p className="mt-1 font-display text-3xl text-palm">{currency.format(totals.actual / 100)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-2xl text-ocean-deep">Add an expense</h2>
        <p className="mt-1 text-sm text-ink/60">Add any new cost that should appear on the family Planning page.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input value={newItem.item} onChange={e => setNewItem({ ...newItem, item: e.target.value })} placeholder="Expense name" className="rounded-xl border border-sand-deep px-3 py-2" />
          <input value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="Category" className="rounded-xl border border-sand-deep px-3 py-2" />
          <input value={newItem.owner ?? ""} onChange={e => setNewItem({ ...newItem, owner: e.target.value })} placeholder="Owner" className="rounded-xl border border-sand-deep px-3 py-2" />
          <select value={newItem.paymentStatus} onChange={e => setNewItem({ ...newItem, paymentStatus: e.target.value as PaymentStatus })} className="rounded-xl border border-sand-deep px-3 py-2">
            <option value="planned">Planned</option>
            <option value="quoted">Quoted</option>
            <option value="deposit_paid">Deposit paid</option>
            <option value="paid">Paid</option>
          </select>
          <label className="text-xs font-bold text-ink/60">Estimated $
            <input type="number" min="0" step="0.01" value={newItem.estimatedCents / 100} onChange={e => setNewItem({ ...newItem, estimatedCents: Math.round(Number(e.target.value) * 100) })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
          </label>
          <label className="text-xs font-bold text-ink/60">Actual $
            <input type="number" min="0" step="0.01" value={newItem.actualCents / 100} onChange={e => setNewItem({ ...newItem, actualCents: Math.round(Number(e.target.value) * 100) })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
          </label>
          <input value={newItem.notes ?? ""} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Notes (optional)" className="rounded-xl border border-sand-deep px-3 py-2 lg:col-span-2" />
        </div>
        <button onClick={add} disabled={busyId === "new"} className="mt-4 rounded-full bg-ocean px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:opacity-50">
          {busyId === "new" ? "Adding…" : "+ Add expense"}
        </button>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const draft = drafts[item.id];
          if (!draft) return null;
          return (
            <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs font-bold text-ink/60">Expense
                  <input value={draft.item} onChange={e => updateDraft(item.id, { item: e.target.value })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
                <label className="text-xs font-bold text-ink/60">Category
                  <input value={draft.category} onChange={e => updateDraft(item.id, { category: e.target.value })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
                <label className="text-xs font-bold text-ink/60">Owner
                  <input value={draft.owner ?? ""} onChange={e => updateDraft(item.id, { owner: e.target.value })} placeholder="Unassigned" className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
                <label className="text-xs font-bold text-ink/60">Payment status
                  <select value={draft.paymentStatus} onChange={e => updateDraft(item.id, { paymentStatus: e.target.value as PaymentStatus })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink">
                    <option value="planned">Planned</option>
                    <option value="quoted">Quoted</option>
                    <option value="deposit_paid">Deposit paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-ink/60">Estimated $
                  <input type="number" min="0" step="0.01" value={draft.estimatedCents / 100} onChange={e => updateDraft(item.id, { estimatedCents: Math.round(Number(e.target.value) * 100) })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
                <label className="text-xs font-bold text-ink/60">Actual $
                  <input type="number" min="0" step="0.01" value={draft.actualCents / 100} onChange={e => updateDraft(item.id, { actualCents: Math.round(Number(e.target.value) * 100) })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
                <label className="text-xs font-bold text-ink/60 md:col-span-2">Notes
                  <input value={draft.notes ?? ""} onChange={e => updateDraft(item.id, { notes: e.target.value })} className="mt-1 w-full rounded-xl border border-sand-deep px-3 py-2 text-sm text-ink" />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => save(item.id)} disabled={busyId === item.id} className="rounded-full bg-palm px-5 py-2 text-sm font-bold text-white hover:bg-palm/90 disabled:opacity-50">
                  {busyId === item.id ? "Saving…" : "Save"}
                </button>
                <button onClick={() => remove(item.id)} disabled={busyId === item.id} className="rounded-full px-5 py-2 text-sm font-bold text-hibiscus hover:bg-hibiscus/10 disabled:opacity-50">
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {message && <p className={`text-sm font-semibold ${message.startsWith("✓") ? "text-palm" : "text-hibiscus"}`}>{message}</p>}
    </div>
  );
}

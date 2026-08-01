"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface BudgetItem {
  id: number;
  item: string;
  category: string;
  owner: string | null;
  estimatedCents: number;
  actualCents: number;
  paymentStatus: "planned" | "quoted" | "deposit_paid" | "paid";
  notes: string | null;
}

const STATUS_LABELS: Record<BudgetItem["paymentStatus"], string> = {
  planned: "Planned",
  quoted: "Quoted",
  deposit_paid: "Deposit paid",
  paid: "Paid",
};

const STATUS_CLASSES: Record<BudgetItem["paymentStatus"], string> = {
  planned: "bg-ink/10 text-ink/65",
  quoted: "bg-plumeria/30 text-[#7a5c00]",
  deposit_paid: "bg-ocean/10 text-ocean-deep",
  paid: "bg-palm/15 text-palm",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function BudgetTracker() {
  const [items, setItems] = useState<BudgetItem[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/budget");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items ?? []);
      setError("");
    } catch {
      setError("Couldn't load the budget. Please refresh.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totals = useMemo(() => {
    const estimated = items?.reduce((sum, item) => sum + item.estimatedCents, 0) ?? 0;
    const actual = items?.reduce((sum, item) => sum + item.actualCents, 0) ?? 0;
    return { estimated, actual, remaining: estimated - actual };
  }, [items]);

  if (error) {
    return <p className="rounded-2xl bg-hibiscus/10 p-6 text-center font-semibold text-hibiscus">{error}</p>;
  }

  if (!items) {
    return <p className="py-10 text-center font-display text-2xl text-lagoon/60">Loading the budget…</p>;
  }

  return (
    <section className="mt-16" aria-labelledby="budget-heading">
      <div className="text-center">
        <p className="font-script text-3xl text-hibiscus">Keeping every dollar organized</p>
        <h2 id="budget-heading" className="mt-1 font-display text-4xl font-semibold text-lagoon-deep">
          Party Budget
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink/65">
          Estimated and actual costs for Nanna&apos;s celebration. Budget values are maintained by the family admin.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gold/25 bg-shell p-5 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Estimated budget</p>
          <p className="mt-1 font-display text-3xl font-semibold text-lagoon-deep">
            {currency.format(totals.estimated / 100)}
          </p>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-shell p-5 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Actual cost</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ocean-deep">
            {currency.format(totals.actual / 100)}
          </p>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-shell p-5 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">
            {totals.remaining >= 0 ? "Remaining" : "Over estimate"}
          </p>
          <p className={`mt-1 font-display text-3xl font-semibold ${totals.remaining >= 0 ? "text-palm" : "text-hibiscus"}`}>
            {currency.format(Math.abs(totals.remaining) / 100)}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-shell p-8 text-center text-ink/60">
          No budget items have been added yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-gold/25 bg-shell shadow-sm">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-gold/20 bg-sand-deep/35 text-xs uppercase tracking-wider text-ink/55">
              <tr>
                <th className="px-5 py-4">Expense</th>
                <th className="px-4 py-4">Owner</th>
                <th className="px-4 py-4 text-right">Estimated</th>
                <th className="px-4 py-4 text-right">Actual</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gold/15 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-bold text-ink">{item.item}</p>
                    <p className="text-xs text-ink/50">
                      {item.category}{item.notes ? ` · ${item.notes}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-ink/70">{item.owner || "Unassigned"}</td>
                  <td className="px-4 py-4 text-right font-semibold">
                    {currency.format(item.estimatedCents / 100)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold">
                    {currency.format(item.actualCents / 100)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASSES[item.paymentStatus]}`}>
                      {STATUS_LABELS[item.paymentStatus]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

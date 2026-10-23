"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contribution } from "@/lib/contributions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function paidStatus(item: Contribution): { label: string; full: boolean; partial: boolean } {
  const paid = item.paidCents || 0;
  if (item.amountCents > 0 && paid >= item.amountCents) {
    return { label: "✓ Paid in full", full: true, partial: false };
  }
  if (paid > 0) {
    return { label: `${currency.format(paid / 100)} paid of ${currency.format(item.amountCents / 100)}`, full: false, partial: true };
  }
  return { label: "Committed", full: false, partial: false };
}

export default function ContributionTracker() {
  const [items, setItems] = useState<Contribution[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/contributions", { signal: controller.signal })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setItems(data.contributions ?? []))
      .catch(() => {
        if (!controller.signal.aborted) setItems([]);
      });
    return () => controller.abort();
  }, []);

  const totalCommitted = useMemo(
    () => items?.reduce((sum, item) => sum + item.amountCents, 0) ?? 0,
    [items],
  );
  const totalPaid = useMemo(
    () => items?.reduce((sum, item) => sum + (item.paidCents || 0), 0) ?? 0,
    [items],
  );

  if (!items) return <p className="mt-8 text-center text-ink/55">Loading family contributions…</p>;

  return (
    <section className="mt-10" aria-labelledby="contributions-heading">
      <div className="text-center">
        <p className="font-script text-3xl text-hibiscus">Mahalo to our family</p>
        <h3 id="contributions-heading" className="mt-1 font-display text-3xl font-semibold text-lagoon-deep">
          Family Contributions
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-ink/65">
          Amounts each family member has committed toward Nanna&apos;s celebration, and what&apos;s been paid so far.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-gold/25 bg-shell shadow-sm">
        <div className="grid gap-px bg-gold/20 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const status = paidStatus(item);
            const progress = item.amountCents > 0 ? Math.min(100, ((item.paidCents || 0) / item.amountCents) * 100) : 0;
            return (
              <div key={item.name} className="bg-shell px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-ink/80">{item.name}</span>
                  <span className="font-display text-xl font-semibold text-ocean-deep">
                    {currency.format(item.amountCents / 100)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full ${status.full ? "bg-palm" : status.partial ? "bg-gold" : "bg-ink/20"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    status.full ? "bg-palm/15 text-palm" : status.partial ? "bg-gold/20 text-ink/70" : "bg-ink/10 text-ink/55"
                  }`}>
                    {status.label}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
        <div className="grid gap-4 bg-lagoon-deep px-6 py-5 text-white sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Total committed</p>
            <p className="font-display text-3xl font-semibold">{currency.format(totalCommitted / 100)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Paid so far</p>
            <p className="font-display text-3xl font-semibold text-plumeria">{currency.format(totalPaid / 100)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

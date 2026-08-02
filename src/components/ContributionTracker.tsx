"use client";

import { useEffect, useMemo, useState } from "react";
import type { Contribution } from "@/lib/contributions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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

  const total = useMemo(
    () => items?.reduce((sum, item) => sum + item.amountCents, 0) ?? 0,
    [items],
  );
  const receivedTotal = useMemo(
    () => items?.reduce((sum, item) => sum + (item.received ? item.amountCents : 0), 0) ?? 0,
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
          Amounts each family member has pledged toward Nanna&apos;s celebration.
        </p>
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-gold/25 bg-shell shadow-sm">
        <div className="grid gap-px bg-gold/20 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <div key={item.name} className="flex items-center justify-between gap-4 bg-shell px-5 py-4">
              <div>
                <span className="font-semibold text-ink/80">{item.name}</span>
                <p className="mt-1">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    item.received ? "bg-palm/15 text-palm" : "bg-ink/10 text-ink/55"
                  }`}>
                    {item.received ? "✓ Received" : "Pledged"}
                  </span>
                </p>
              </div>
              <span className="font-display text-xl font-semibold text-ocean-deep">
                {currency.format(item.amountCents / 100)}
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 bg-lagoon-deep px-6 py-5 text-white sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Total pledged</p>
            <p className="font-display text-3xl font-semibold">{currency.format(total / 100)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">Received so far</p>
            <p className="font-display text-3xl font-semibold text-plumeria">{currency.format(receivedTotal / 100)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

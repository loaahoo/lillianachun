import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getEventDetails } from "@/lib/eventDetails";
import { FULL_SCHEDULE } from "@/lib/schedule";
import { LauaeFrond, PikakeStrand } from "@/components/TropicalDecor";

export const metadata: Metadata = {
  title: "Party Schedule | Nanna's 100th Birthday",
  description: "The full celebration schedule for Nanna's 100th birthday.",
};

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const details = await getEventDetails();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 bg-lauhala">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#073844] to-[#0b5563] py-14 text-white">
          <LauaeFrond className="pointer-events-none absolute -bottom-3 -left-8 h-20 w-44 text-white/[0.1]" />
          <LauaeFrond flip className="pointer-events-none absolute -bottom-3 -right-8 h-20 w-44 text-white/[0.1]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <p className="font-script text-3xl text-plumeria">A joyful afternoon of aloha</p>
            <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">
              Party Schedule
            </h1>
            <PikakeStrand className="mt-3 text-plumeria" />
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              {details.date} · 11:00 AM–3:00 PM · {details.location}. Here&apos;s how the
              celebration flows, from the first aloha to the last mahalo.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <div className="space-y-8">
            {FULL_SCHEDULE.map(seg => (
              <div key={seg.segment} className="rounded-[1.5rem] border border-gold/25 bg-shell p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-2xl font-semibold text-lagoon-deep">
                  {seg.emoji} {seg.segment}
                </h2>
                <ul className="mt-5 space-y-4">
                  {seg.items.map(item => (
                    <li key={`${item.time}-${item.activity}`} className="flex gap-4 border-b border-sand-deep pb-4 last:border-0 last:pb-0">
                      <div className="w-24 shrink-0 text-right">
                        <p className="font-bold text-hibiscus">{item.time}</p>
                        <p className="text-xs text-ink/50">{item.duration}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{item.activity}</p>
                        {item.note ? (
                          <p className="mt-0.5 text-sm text-ink/60">{item.note}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm italic text-ink/55">
            Times are approximate — island time, with aloha. 🤙
          </p>
          <div className="mt-6 text-center">
            <Link
              href="/rsvp"
              className="inline-block rounded-full bg-hibiscus px-9 py-3.5 font-bold text-white shadow-lg shadow-hibiscus/25 transition-all hover:-translate-y-0.5 hover:bg-[#b52f52]"
            >
              RSVP for the celebration →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

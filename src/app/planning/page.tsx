import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import BudgetTracker from "@/components/BudgetTracker";
import ContributionTracker from "@/components/ContributionTracker";
import PlanningBoard from "@/components/PlanningBoard";

export const metadata: Metadata = {
  title: "Family Planning Tracker | Nanna's 100th Birthday",
  description: "Track the 'ohana's party planning progress for Nanna's 100th birthday lū'au.",
};

export default function PlanningPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1 bg-lauhala">
        <section className="bg-gradient-to-b from-[#073844] to-[#0b5563] py-14 text-white">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <p className="font-script text-3xl text-plumeria">&apos;Ohana planning hub</p>
            <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">
              The Master Plan
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Everything for Nanna&apos;s big day rolls up here. Check off tasks
              as you finish them — the whole family sees updates instantly.
            </p>
          </div>
        </section>
        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="mb-10 rounded-[1.5rem] border border-gold/25 bg-shell p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <p className="font-script text-3xl text-hibiscus">Hawaiian Legacy Celebration</p>
              <h2 className="font-display text-3xl font-semibold text-lagoon-deep">Event Overview</h2>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Date", "Saturday, December 26, 2026"],
                ["Celebration", "11:00 AM–3:00 PM"],
                ["Venue access", "8:00 AM–10:00 PM"],
                ["Setup", "9:00–11:00 AM"],
                ["Cleanup", "3:00–4:30 PM"],
                ["Venue", "Makakilo Stake Center"],
                ["Address", "92-900 Makakilo Drive, Kapolei, HI 96707"],
                ["Expected guests", "Approximately 250"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-sand-deep/35 px-4 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</dt>
                  <dd className="mt-1 font-semibold text-ink/85">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <BudgetTracker />
          <ContributionTracker />
          <PlanningBoard />
        </section>
      </main>
      <Footer />
    </div>
  );
}

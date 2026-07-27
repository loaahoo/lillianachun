import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
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
            <p className="font-script text-3xl text-plumeria">'Ohana planning hub</p>
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
          <PlanningBoard />
        </section>
      </main>
      <Footer />
    </div>
  );
}

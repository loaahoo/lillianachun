import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import RsvpForm from "@/components/RsvpForm";
import { EVENT } from "@/lib/event";
import { getEventDetails } from "@/lib/eventDetails";
import { LauaeFrond, PikakeStrand } from "@/components/TropicalDecor";

export const metadata: Metadata = {
  title: `RSVP | ${EVENT.title}`,
};

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const details = await getEventDetails();
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0e7490] to-[#0891b2] py-14 text-center text-white">
          <LauaeFrond className="pointer-events-none absolute -bottom-3 -left-8 h-20 w-44 text-white/[0.12]" />
          <LauaeFrond flip className="pointer-events-none absolute -bottom-3 -right-8 h-20 w-44 text-white/[0.12]" />
          <h1 className="relative font-display text-5xl">RSVP</h1>
          <PikakeStrand className="mt-3 text-white/90" />
          <p className="mx-auto mt-3 max-w-xl px-4 text-white/90">
            Please let us know if you can join us for {EVENT.honoree}&apos;s
            100th birthday lū&apos;au on {details.date} at {details.venue},{" "}
            {details.location}.
          </p>
        </section>
        <section className="mx-auto w-full max-w-2xl px-4 py-12">
          <RsvpForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}

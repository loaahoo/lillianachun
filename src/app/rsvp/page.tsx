import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import RsvpForm from "@/components/RsvpForm";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `RSVP | ${EVENT.title}`,
};

export default function RsvpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#0e7490] to-[#0891b2] py-14 text-center text-white">
          <h1 className="font-display text-5xl">RSVP</h1>
          <p className="mx-auto mt-3 max-w-xl px-4 text-white/90">
            Please let us know if you can join us for {EVENT.honoree}&apos;s
            100th birthday lū&apos;au on {EVENT.date} at {EVENT.venue},{" "}
            {EVENT.location}.
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

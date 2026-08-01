import Link from "next/link";
import { EVENT } from "@/lib/event";
import { getEventDetails } from "@/lib/eventDetails";
import { PikakeStrand } from "@/components/TropicalDecor";

export default async function Footer() {
  const details = await getEventDetails();
  return (
    <footer className="border-t border-[color:var(--sand-deep)] bg-sand-deep/50 py-8 text-center text-sm text-ink/70">
      <PikakeStrand className="mb-3 text-lagoon" />
      <p className="font-display text-lg text-ocean-deep">Me ke aloha pumehana</p>
      <p className="mt-1">
        {EVENT.title} · {details.date} · {details.location}
      </p>
      <Link
        href="/admin"
        className="mt-4 inline-block text-xs font-semibold text-ink/50 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-lagoon-deep"
      >
        Admin
      </Link>
    </footer>
  );
}

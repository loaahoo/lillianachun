import { EVENT } from "@/lib/event";
import { getEventDetails } from "@/lib/eventDetails";

export default async function Footer() {
  const details = await getEventDetails();
  return (
    <footer className="border-t border-[color:var(--sand-deep)] bg-sand-deep/50 py-8 text-center text-sm text-ink/70">
      <p className="font-display text-lg text-ocean-deep">Me ke aloha pumehana</p>
      <p className="mt-1">
        {EVENT.title} · {details.date} · {details.location}
      </p>
    </footer>
  );
}

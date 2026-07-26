import { EVENT } from "@/lib/event";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--sand-deep)] bg-sand-deep/50 py-8 text-center text-sm text-ink/70">
      <p className="font-display text-lg text-ocean-deep">Me ke aloha pumehana</p>
      <p className="mt-1">
        {EVENT.title} · {EVENT.date} · {EVENT.location}
      </p>
    </footer>
  );
}

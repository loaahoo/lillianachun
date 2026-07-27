"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/gallery", label: "Gallery" },
  { href: "/recipe", label: "Recipe" },
  { href: "/planning", label: "Planning" },
];

export default function Nav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Admin link is only shown to a logged-in admin.
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.admin)))
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const navLinks = isAdmin ? [...links, { href: "/admin", label: "Admin" }] : links;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--sand-deep)] bg-[color:var(--sand)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <Link href="/" className="shrink-0 font-display text-xl font-semibold tracking-wide text-lagoon-deep sm:text-2xl">
          Nanna&apos;s <span className="font-script text-2xl text-hibiscus">100th</span>
        </Link>
        <div className="scrollbar-none -mr-1 flex items-center gap-0.5 overflow-x-auto pr-1 sm:gap-2 sm:overflow-visible">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors sm:px-4 sm:text-sm ${
                  active
                    ? "bg-lagoon text-white"
                    : "text-ink hover:bg-sand-deep"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

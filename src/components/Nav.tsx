"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/gallery", label: "Gallery" },
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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-2xl text-ocean-deep">
          Nanna&apos;s <span className="text-hibiscus">100th</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors sm:px-4 ${
                  active
                    ? "bg-ocean text-white"
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0e7490] to-[#155e75] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
      >
        <h1 className="text-center font-display text-3xl text-ocean-deep">
          Family Admin
        </h1>
        <p className="mt-1 text-center text-sm text-ink/60">
          Sign in to review photos and RSVPs
        </p>
        <div className="mt-6 grid gap-4">
          <div>
            <label htmlFor="admin-email" className="mb-1 block text-sm font-bold">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--sand-deep)] px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1 block text-sm font-bold">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--sand-deep)] px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-ocean px-6 py-3 font-bold text-white transition-colors hover:bg-ocean-deep disabled:opacity-60"
          >
            {status === "sending" ? "Signing in..." : "Sign in"}
          </button>
          {status === "error" && error && (
            <p className="text-center text-sm font-semibold text-hibiscus">{error}</p>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ocean underline hover:text-ocean-deep">
            ← Back to the celebration
          </Link>
        </p>
      </form>
    </div>
  );
}

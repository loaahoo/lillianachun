"use client";

import { useState } from "react";

/**
 * Lets any signed-in admin (including view-only) change their own password.
 * `forced` is used right after an owner gives someone a temporary password.
 */
export default function AccountPanel({
  forced = false,
  onChanged,
}: {
  forced?: boolean;
  onChanged?: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (next !== confirm) {
      setMessage("The new passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not change your password.");
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage("✓ Password changed.");
      onChanged?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not change your password.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2";

  return (
    <section className="mt-6 max-w-md rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-2xl text-ocean-deep">
        {forced ? "Choose your own password" : "Change my password"}
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        {forced
          ? "You signed in with a temporary password. Please choose a new one to continue."
          : "Use at least 8 characters."}
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4">
        <div>
          <label htmlFor="pw-current" className="mb-1 block text-sm font-bold">
            {forced ? "Temporary password" : "Current password"}
          </label>
          <input
            id="pw-current"
            type="password"
            required
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pw-new" className="mb-1 block text-sm font-bold">
            New password
          </label>
          <input
            id="pw-new"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="mb-1 block text-sm font-bold">
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ocean px-6 py-3 font-bold text-white transition-colors hover:bg-ocean-deep disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save new password"}
        </button>
        {message && (
          <p className={`text-sm font-semibold ${message.startsWith("✓") ? "text-palm" : "text-hibiscus"}`}>
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

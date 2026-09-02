"use client";

import { useState } from "react";

export default function RsvpForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    attendees: "1",
    attending: "yes",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attendees: form.attending === "yes" ? Number(form.attendees) : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border-2 border-dashed border-palm/40 bg-white/80 p-10 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-3 font-display text-3xl text-palm">Mahalo, {form.name.split(" ")[0]}!</h2>
        <p className="mt-2 text-ink/80">
          {form.attending === "yes"
            ? `We can't wait to celebrate with you and your ${Number(form.attendees) > 1 ? `party of ${form.attendees}` : "good self"}. See you in Ewa Beach!`
            : "We're sorry you'll miss it — thank you for letting us know. Nanna sends her aloha!"}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-[color:var(--sand-deep)] bg-white/80 p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5">
        <div>
          <label htmlFor="rsvp-name" className="mb-1 block text-sm font-bold">
            Your name <span className="text-hibiscus">*</span>
          </label>
          <input
            id="rsvp-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rsvp-email" className="mb-1 block text-sm font-bold">
              Email
            </label>
            <input
              id="rsvp-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="rsvp-phone" className="mb-1 block text-sm font-bold">
              Phone
            </label>
            <input
              id="rsvp-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(808) 555-1234"
              className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-ink/60">
          Please provide at least one way to reach you (email or phone).
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-bold">Will you be attending?</span>
            <div className="flex gap-2">
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("attending", v)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 font-semibold transition-colors ${
                    form.attending === v
                      ? v === "yes"
                        ? "border-palm bg-palm text-white"
                        : "border-hibiscus bg-hibiscus text-white"
                      : "border-[color:var(--sand-deep)] bg-white hover:bg-sand"
                  }`}
                >
                  {v === "yes" ? "Yes, with aloha! 🌺" : "Sadly, no 😢"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="rsvp-attendees" className="mb-1 block text-sm font-bold">
              Number of guests (including you)
            </label>
            <input
              id="rsvp-attendees"
              type="number"
              min={1}
              max={20}
              required={form.attending === "yes"}
              value={form.attendees}
              onChange={(e) => set("attendees", e.target.value)}
              disabled={form.attending === "no"}
              className="w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2 disabled:opacity-50"
            />
          </div>
        </div>
        <div>
          <label htmlFor="rsvp-message" className="mb-1 block text-sm font-bold">
            A note for Nanna <span className="text-ink/50">(optional)</span>
          </label>
          <textarea
            id="rsvp-message"
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Share a birthday wish or favorite memory..."
            className="w-full resize-none rounded-xl border border-[color:var(--sand-deep)] bg-white px-4 py-2.5 outline-none ring-ocean/40 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-hibiscus px-8 py-3.5 font-bold text-white shadow-md transition-colors hover:bg-hibiscus/90 disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send my RSVP 🌺"}
        </button>
        {status === "error" && error && (
          <p className="text-sm font-semibold text-hibiscus">{error}</p>
        )}
      </div>
    </form>
  );
}

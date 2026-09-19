"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "owner" | "editor" | "viewer";
type AssignableRole = Exclude<Role, "owner">;

interface Member {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  mustChangePassword: boolean;
  createdAt: string;
}

/** Details an owner needs to hand to someone; shown once, right after creating/resetting. */
interface Reveal {
  name: string;
  email: string;
  password: string;
  kind: "invited" | "reset";
}

const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "View only",
};

const ROLE_HELP: Record<AssignableRole, string> = {
  editor:
    "Can change anything — photos, RSVPs, budget, music and event details — but can't invite or manage other people.",
  viewer: "Can look at everything (including RSVPs) but can't change anything.",
};

// No look-alike characters (0/O, 1/l/I) so a temporary password is easy to read out or type.
const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generatePassword(length = 12) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => PASSWORD_ALPHABET[v % PASSWORD_ALPHABET.length]).join("");
}

export default function TeamAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | "new" | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("viewer");
  const [password, setPassword] = useState(() => generatePassword());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members ?? []);
    } catch {
      setMessage("Could not load the team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function request(method: "POST" | "PATCH" | "DELETE", body: object) {
    const res = await fetch("/api/admin/team", {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusyId("new");
    setMessage("");
    try {
      const data = await request("POST", { name, email, role, password });
      setMembers((current) => [...current, data.member]);
      setReveal({ name: data.member.name ?? name, email: data.member.email, password, kind: "invited" });
      setCopied(false);
      setName("");
      setEmail("");
      setRole("viewer");
      setPassword(generatePassword());
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add that person.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(member: Member, next: AssignableRole) {
    if (next === member.role) return;
    setBusyId(member.id);
    setMessage("");
    try {
      const data = await request("PATCH", { id: member.id, role: next });
      setMembers((current) => current.map((m) => (m.id === member.id ? data.member : m)));
      setMessage(`✓ ${member.name ?? member.email} is now ${ROLE_LABEL[next]}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not change their level.");
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(member: Member) {
    const who = member.name ?? member.email;
    if (!window.confirm(`Give ${who} a new temporary password? Their current password will stop working.`)) {
      return;
    }
    const next = generatePassword();
    setBusyId(member.id);
    setMessage("");
    try {
      const data = await request("PATCH", { id: member.id, password: next });
      setMembers((current) => current.map((m) => (m.id === member.id ? data.member : m)));
      setReveal({ name: who, email: member.email, password: next, kind: "reset" });
      setCopied(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not reset that password.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(member: Member) {
    const who = member.name ?? member.email;
    if (!window.confirm(`Remove ${who}? They will lose access right away.`)) return;
    setBusyId(member.id);
    setMessage("");
    try {
      await request("DELETE", { id: member.id });
      setMembers((current) => current.filter((m) => m.id !== member.id));
      setMessage(`✓ ${who} no longer has access.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not remove that person.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyDetails() {
    if (!reveal) return;
    const text = `Family Admin sign-in\n${window.location.origin}/admin/login\nEmail: ${reveal.email}\nTemporary password: ${reveal.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setMessage("Couldn't copy automatically — please select and copy the details above.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[color:var(--sand-deep)] bg-white px-3 py-2 text-sm outline-none ring-ocean/40 focus:ring-2";

  return (
    <div className="mt-6 space-y-6">
      {reveal && (
        <section className="rounded-2xl border-2 border-palm/40 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl text-ocean-deep">
            {reveal.kind === "invited" ? `✓ ${reveal.name} can now sign in` : `New password for ${reveal.name}`}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            Send them these details. <strong>This is the only time the password is shown.</strong>{" "}
            They&rsquo;ll be asked to choose their own password the first time they sign in.
          </p>
          <dl className="mt-4 grid gap-1 rounded-xl bg-sand/60 p-4 text-sm sm:grid-cols-[9rem_1fr]">
            <dt className="font-bold text-ink/60">Sign in at</dt>
            <dd className="break-all">{typeof window !== "undefined" ? `${window.location.origin}/admin/login` : ""}</dd>
            <dt className="font-bold text-ink/60">Email</dt>
            <dd className="break-all">{reveal.email}</dd>
            <dt className="font-bold text-ink/60">Temporary password</dt>
            <dd className="font-mono text-base font-bold tracking-wide">{reveal.password}</dd>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDetails}
              className="rounded-full bg-ocean px-5 py-2 text-sm font-bold text-white hover:bg-ocean-deep"
            >
              {copied ? "✓ Copied" : "Copy details"}
            </button>
            <button
              type="button"
              onClick={() => setReveal(null)}
              className="rounded-full bg-ink/10 px-5 py-2 text-sm font-bold text-ink hover:bg-ink/20"
            >
              Done
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-display text-2xl text-ocean-deep">Invite someone</h2>
        <p className="mt-1 text-sm text-ink/60">
          Give a family member their own login. You choose what they&rsquo;re allowed to do.
        </p>
        <form onSubmit={invite} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="team-name" className="mb-1 block text-xs font-bold text-ink/60">
              Name
            </label>
            <input
              id="team-name"
              required
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Auntie Lei"
            />
          </div>
          <div>
            <label htmlFor="team-email" className="mb-1 block text-xs font-bold text-ink/60">
              Email
            </label>
            <input
              id="team-email"
              type="email"
              required
              maxLength={320}
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
            />
          </div>
          <fieldset className="min-w-0 md:col-span-2">
            <legend className="mb-1 text-xs font-bold text-ink/60">Access level</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["viewer", "editor"] as AssignableRole[]).map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 text-sm ${
                    role === value ? "border-ocean bg-ocean/5" : "border-[color:var(--sand-deep)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="team-role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value)}
                    className="mt-1 accent-ocean"
                  />
                  <span>
                    <span className="block font-bold">{ROLE_LABEL[value]}</span>
                    <span className="block text-xs text-ink/60">{ROLE_HELP[value]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="md:col-span-2">
            <label htmlFor="team-password" className="mb-1 block text-xs font-bold text-ink/60">
              Temporary password
            </label>
            <div className="flex gap-2">
              <input
                id="team-password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} font-mono`}
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="shrink-0 rounded-xl bg-ink/10 px-4 py-2 text-sm font-bold text-ink hover:bg-ink/20"
              >
                Generate
              </button>
            </div>
            <p className="mt-1 text-xs text-ink/50">They&rsquo;ll be asked to replace this the first time they sign in.</p>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={busyId === "new"}
              className="rounded-full bg-ocean px-6 py-2.5 text-sm font-bold text-white hover:bg-ocean-deep disabled:opacity-50"
            >
              {busyId === "new" ? "Adding…" : "+ Add person"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-display text-2xl text-ocean-deep">People with access</h2>
        {loading ? (
          <p className="mt-4 text-sm text-ink/60">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-[color:var(--sand-deep)]">
            {members.map((member) => {
              const isOwner = member.role === "owner";
              const busy = busyId === member.id;
              return (
                <li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <p className="truncate font-bold text-ink">{member.name || member.email}</p>
                    <p className="truncate text-xs text-ink/60">
                      {member.name ? `${member.email} · ` : ""}
                      {member.mustChangePassword ? "hasn’t chosen their own password yet" : "password set"}
                    </p>
                  </div>
                  {isOwner ? (
                    <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-bold text-ocean-deep">
                      {ROLE_LABEL.owner}
                    </span>
                  ) : (
                    <>
                      <select
                        aria-label={`Access level for ${member.name || member.email}`}
                        value={member.role}
                        disabled={busy}
                        onChange={(e) => void changeRole(member, e.target.value as AssignableRole)}
                        className="rounded-xl border border-[color:var(--sand-deep)] bg-white px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                      >
                        <option value="viewer">{ROLE_LABEL.viewer}</option>
                        <option value="editor">{ROLE_LABEL.editor}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => void resetPassword(member)}
                        disabled={busy}
                        className="rounded-full border border-ocean/40 px-4 py-1.5 text-xs font-bold text-ocean hover:bg-ocean hover:text-white disabled:opacity-50"
                      >
                        Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(member)}
                        disabled={busy}
                        className="rounded-full px-4 py-1.5 text-xs font-bold text-hibiscus hover:bg-hibiscus/10 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {message && (
        <p className={`text-sm font-semibold ${message.startsWith("✓") ? "text-palm" : "text-hibiscus"}`}>{message}</p>
      )}
    </div>
  );
}

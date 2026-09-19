# Nanna's 100th Birthday Lū'au 🌺

A Hawaiian-themed celebration website for Nanna's 100th birthday in Ewa Beach,
Hawaii. Guests can view party details, RSVP, and share their favorite photos of
Nanna. The family reviews every photo in a private admin portal before it
appears in the public full-screen slideshow gallery.

## Stack (no proprietary dependencies)

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router, TypeScript, Tailwind CSS) |
| Hosting | Vercel |
| Database | Neon Postgres (`@neondatabase/serverless` + Drizzle ORM) |
| Image storage | Vercel Blob (`@vercel/blob`) |
| Auth | Email/password admin login (bcryptjs + JWT httpOnly cookie) with three access levels (owner / editor / view only) |

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero, party date/time/location, photo upload, approved-photo strip |
| `/rsvp` | RSVP form (name, contact, attendee count, note) |
| `/gallery` | Full-screen auto-advancing slideshow of approved photos |
| `/admin/login` | Admin sign-in |
| `/admin` | Review pending photos (approve/reject), RSVPs, budget, gallery music, event details. Owners also get a **Team** tab; everyone gets **My Account** (change password) |

## Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same values in
Vercel → Project → Settings → Environment Variables for production.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read-write token (auto-injected when the Blob store is connected to the Vercel project) |
| `JWT_SECRET` | Long random string used to sign admin session cookies |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by the seed script to create the admin account |

## Setup

```bash
pnpm install          # install dependencies
pnpm db:migrate       # create tables in Neon (reads DATABASE_URL)
pnpm db:migrate-roles # add admin access levels (see "Admin access levels")
pnpm seed:admin       # create/update the owner account
pnpm dev              # run locally at http://localhost:3000
```

## Deploying on Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: Next.js).
2. In the Vercel project, go to **Storage → Connect** and attach your Blob
   store — this injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Add `DATABASE_URL` (Neon) and `JWT_SECRET` under Settings → Environment
   Variables.
4. Deploy. Run `pnpm db:migrate`, `pnpm db:migrate-roles` and `pnpm seed:admin`
   once from your machine (with the production env vars) if you haven't already.

> **Upgrading an existing site to access levels:** run `pnpm db:migrate-roles`
> against the production database **before** deploying this version. It's safe
> to run early (the old code ignores the new columns) and safe to re-run.

## Admin access levels

| Level | Can do |
| --- | --- |
| **Owner** | Everything, plus invite/remove other admins and reset their passwords (the **Team** tab) |
| **Editor** | Change anything: approve/reject photos, edit RSVPs, budget, contributions, gallery music, event details. Cannot manage other admins |
| **View only** | Look at everything (photos, RSVPs, budget, music, event details). Cannot change anything |

- Owners invite people from **Admin → Team** as *Editor* or *View only*, and give
  them a temporary password (there's a Generate button) to pass along. The new
  person is asked to choose their own password the first time they sign in.
- An owner can change someone between Editor and View only, reset their
  password, or remove them at any time; it takes effect on their next request
  (their role is always read from the database, not from the login cookie).
- **Owner accounts are never created, changed, or removed from the website**, so
  the owner can't be locked out from the UI. `pnpm db:migrate-roles` makes
  `OWNER_EMAIL` (default `leightonchun@gmail.com`) the owner and gives every
  other existing admin *Editor* so nobody loses access; `pnpm seed:admin` creates
  a new account as owner. To change the owner directly:
  `UPDATE admins SET role = 'owner' WHERE email = '...';`
- Every admin API route enforces its level on the server (see `requireRole` in
  `src/lib/auth.ts`); hiding buttons in the UI is only a convenience.

## How photo approval works

Uploads are stored in Vercel Blob and recorded as `pending` in Postgres. The
admin portal lists pending photos with Approve / Reject buttons. Only
`approved` photos are served publicly; images are streamed through
`/api/photos/image/[id]`, which authorizes access and proxies the Blob store
(this supports private Blob stores too). Pending and rejected photos are only
visible to a signed-in admin.

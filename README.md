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
| Auth | Email/password admin login (bcryptjs + JWT httpOnly cookie) |

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero, party date/time/location, photo upload, approved-photo strip |
| `/rsvp` | RSVP form (name, contact, attendee count, note) |
| `/gallery` | Full-screen auto-advancing slideshow of approved photos |
| `/admin/login` | Admin sign-in |
| `/admin` | Review pending photos (approve/reject) and view RSVPs |

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
pnpm seed:admin       # create/update the admin account
pnpm dev              # run locally at http://localhost:3000
```

## Deploying on Vercel

1. Push this repo to GitHub and import it in Vercel (framework preset: Next.js).
2. In the Vercel project, go to **Storage → Connect** and attach your Blob
   store — this injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Add `DATABASE_URL` (Neon) and `JWT_SECRET` under Settings → Environment
   Variables.
4. Deploy. Run `pnpm db:migrate` and `pnpm seed:admin` once from your machine
   (with the production env vars) if you haven't already.

## How photo approval works

Uploads are stored in Vercel Blob and recorded as `pending` in Postgres. The
admin portal lists pending photos with Approve / Reject buttons. Only
`approved` photos are served publicly; images are streamed through
`/api/photos/image/[id]`, which authorizes access and proxies the Blob store
(this supports private Blob stores too). Pending and rejected photos are only
visible to a signed-in admin.

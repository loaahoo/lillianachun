# Internal verification notes (not user-facing docs)

## State as of 2026-07-26
- Standalone Next.js 16 project at /home/ubuntu/nannas100 (NOT the Manus webdev project at /home/ubuntu/nannas-100th-birthday, which is only used for todo.md tracking).
- Pushed to GitHub: loaahoo/lillianachun (main branch, commit author loaahoo).
- Dev server: port 4100 (`env -u DATABASE_URL -u NODE_ENV pnpm dev -p 4100`), exposed at https://4100-ir1a47mfd3hm62fn9tzch-4ba3cb87.us2.manus.computer
  - IMPORTANT: shell env has stale DATABASE_URL (mysql/TiDB) and NODE_ENV=development that MUST be unset for build/dev; .env.local holds real values.
- Neon DB: connected, tables rsvps/photos/admins created via scripts/migrate.mjs. Connection string in .env.local (user shared via screenshot — remind to reset password later).
- Vercel Blob: PRIVATE store (store_IYYdf3pDXktJRfbV). Token in .env.local. Uploads fall back to access:"private"; images served via streaming proxy /api/photos/image/[id] with Bearer token; approved=public, pending/rejected=admin-only (verified 403/200).
- Admin login: admin@nannas100.com / Aloha100Nanna! (seeded; user should change).
- JWT_SECRET includes 'dealbin' per user preference.
- Current DB data: 1 approved photo (id 1, Nanna in yellow, uploaded by "The Family"); 0 RSVPs (test data cleaned).

## Verified end-to-end
- Homepage: hero, party details (Oct 10 2026, 11AM-4PM HST, Ewa Beach Community Park, 91-955 North Rd), upload form, photo strip, Admin nav link only for admin session.
- RSVP: submit ok, validation (missing contact -> 400).
- Admin: login (bad pw -> 401), portal tabs, approve/reject flow (optimistic UI), RSVP table + totals, loading state fixed (no premature zeros).
- Gallery: full-screen slideshow with blurred backdrop, caption, pause/fullscreen/arrows, keyboard controls.
- Production build passes (`env -u DATABASE_URL -u NODE_ENV pnpm build`).

## Remaining/notes
- Party date/time/venue are PLACEHOLDERS in src/lib/event.ts — user must confirm real details.
- User must set env vars in Vercel: DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN (auto if store connected).
- next.config.ts has allowedDevOrigins for *.manus.computer (dev only, harmless in prod).

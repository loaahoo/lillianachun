/**
 * Creates the settings table, seeds requirePhotoApproval=true,
 * and adds Leighton's admin account.
 * Run: node --env-file=.env.local scripts/migrate-settings.mjs
 */
const { neon } = await import("@neondatabase/serverless");
const bcrypt = (await import("bcryptjs")).default;

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
await sql`
  INSERT INTO settings (key, value) VALUES ('requirePhotoApproval', 'true')
  ON CONFLICT (key) DO NOTHING
`;
console.log("settings table ready, requirePhotoApproval seeded");

const email = process.env.NEW_ADMIN_EMAIL;
const password = process.env.NEW_ADMIN_PASSWORD;
if (email && password) {
  const hash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO admins (email, password_hash, name)
    VALUES (${email.toLowerCase()}, ${hash}, 'Leighton')
    ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}
  `;
  console.log(`admin account upserted: ${email}`);
}
const admins = await sql`SELECT id, email FROM admins ORDER BY id`;
console.log("admins:", admins.map(a => a.email).join(", "));

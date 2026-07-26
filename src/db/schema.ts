import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const attendingEnum = pgEnum("attending", ["yes", "no"]);
export const photoStatusEnum = pgEnum("photo_status", [
  "pending",
  "approved",
  "rejected",
]);

/** RSVP submissions from party guests. */
export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  attendees: integer("attendees").notNull().default(1),
  attending: attendingEnum("attending").notNull().default("yes"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Guest-uploaded photos of Nanna. Stored in Vercel Blob; must be approved
 * by an admin before appearing publicly.
 */
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  uploaderName: varchar("uploader_name", { length: 200 }).notNull(),
  caption: text("caption"),
  url: text("url").notNull(),
  blobPathname: text("blob_pathname").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  status: photoStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

/** Admin users for the review portal (email/password auth). */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Rsvp = typeof rsvps.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Admin = typeof admins.$inferSelect;

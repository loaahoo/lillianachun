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
export const workstreamStatusEnum = pgEnum("workstream_status", [
  "not_started",
  "in_progress",
  "done",
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

/** Simple key/value site settings (e.g. requirePhotoApproval). */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Party-planning workstreams from the family's master event plan. */
export const workstreams = pgTable("workstreams", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  name: varchar("name", { length: 200 }).notNull(),
  emoji: varchar("emoji", { length: 16 }),
  owner: varchar("owner", { length: 200 }),
  budget: varchar("budget", { length: 120 }),
  deadline: varchar("deadline", { length: 120 }),
  objective: text("objective"),
  status: workstreamStatusEnum("status").notNull().default("not_started"),
  isCriticalPath: integer("is_critical_path").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Individual tasks within a workstream. */
export const planTasks = pgTable("plan_tasks", {
  id: serial("id").primaryKey(),
  workstreamId: integer("workstream_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  label: text("label").notNull(),
  done: integer("done").notNull().default(0),
  completedBy: varchar("completed_by", { length: 200 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Rsvp = typeof rsvps.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type Workstream = typeof workstreams.$inferSelect;
export type PlanTask = typeof planTasks.$inferSelect;

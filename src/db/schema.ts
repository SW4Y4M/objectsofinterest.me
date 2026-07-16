import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const editorialTagEnum = pgEnum("editorial_tag", ["Wear", "Work", "Home", "Read", "Make", "Move", "Care", "Collect"]);
export const objectStatusEnum = pgEnum("object_status", ["Draft", "Visible", "Archived"]);
export const displaySizeEnum = pgEnum("display_size", ["standard", "wide", "tall", "feature"]);

export const wishlistObjects = pgTable("wishlist_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageOriginalUrl: text("image_original_url"),
  imageProcessedUrl: text("image_processed_url"),
  sourceUrl: text("source_url"),
  editorialTag: editorialTagEnum("editorial_tag").notNull(),
  price: text("price"),
  currency: text("currency"),
  note: text("note"),
  status: objectStatusEnum("status").notNull().default("Draft"),
  displaySize: displaySizeEnum("display_size").notNull().default("standard"),
  sourceImageProvider: text("source_image_provider"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type WishlistObjectRow = typeof wishlistObjects.$inferSelect;
export type NewWishlistObjectRow = typeof wishlistObjects.$inferInsert;

export const waitlistSignups = pgTable("waitlist_signups", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type WaitlistSignupRow = typeof waitlistSignups.$inferSelect;
export type NewWaitlistSignupRow = typeof waitlistSignups.$inferInsert;

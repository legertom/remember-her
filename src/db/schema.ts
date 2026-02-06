import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const entries = pgTable("entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  notes: text("notes").notNull().default(""),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

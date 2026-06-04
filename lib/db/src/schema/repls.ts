import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const replsTable = pgTable("repls", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language").notNull(),
  code: text("code").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReplSchema = createInsertSchema(replsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const updateReplSchema = insertReplSchema.partial();

export type InsertRepl = z.infer<typeof insertReplSchema>;
export type UpdateRepl = z.infer<typeof updateReplSchema>;
export type Repl = typeof replsTable.$inferSelect;

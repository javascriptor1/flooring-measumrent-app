import { pgTable, text, serial, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Room schema for the flooring calculator
export const roomSchema = z.object({
  id: z.string(),
  type: z.string(),
  length: z.number().min(0).default(0),
  width: z.number().min(0).default(0),
  doorArea: z.number().min(0).default(0),
  area: z.number().default(0),
  skirting: z.number().default(0),
});

export type Room = z.infer<typeof roomSchema>;

// Customer schema
export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema>;

// Quote schema
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  customerMobile: text("customer_mobile").notNull(),
  customerAddress: text("customer_address"),
  customerNotes: text("customer_notes"),
  rooms: jsonb("rooms").notNull(),
  wastagePercentage: real("wastage_percentage").notNull(),
  totalRoomArea: real("total_room_area").notNull(),
  totalSkirtingLength: real("total_skirting_length").notNull(),
  totalFlooringRequired: real("total_flooring_required").notNull(),
  totalSkirtingRequired: real("total_skirting_required").notNull(),
  createdAt: text("created_at").notNull(), // storing as ISO string
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, totalRoomArea: true, totalSkirtingLength: true, totalFlooringRequired: true, totalSkirtingRequired: true });

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

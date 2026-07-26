import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const bom = pgTable("bom", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  productId: text("product_id").notNull(),
  outputQty: integer("output_qty").default(1).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bomComponents = pgTable("bom_components", {
  id: text("id").primaryKey(),
  bomId: text("bom_id").notNull(),
  componentProductId: text("component_product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const bomOperations = pgTable("bom_operations", {
  id: text("id").primaryKey(),
  bomId: text("bom_id").notNull(),
  name: text("name").notNull(),
  workCenter: text("work_center").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  stepOrder: integer("step_order").notNull(),
});

import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const manufacturingOrders = pgTable("manufacturing_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  productId: text("product_id").notNull(),
  bomId: text("bom_id").notNull(),
  targetQty: integer("target_qty").notNull(),
  producedQty: integer("produced_qty").default(0).notNull(),
  status: text("status").default("draft").notNull(), // 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  assignee: text("assignee"),
  triggeredFromSoId: text("triggered_from_so_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: text("id").primaryKey(),
  manufacturingOrderId: text("manufacturing_order_id").notNull(),
  name: text("name").notNull(),
  workCenter: text("work_center").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'in_progress' | 'completed'
  completedAt: timestamp("completed_at"),
});

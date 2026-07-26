import { pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const salesOrders = pgTable("sales_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  status: text("status").default("draft").notNull(), // 'draft' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled'
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesOrderItems = pgTable("sales_order_items", {
  id: text("id").primaryKey(),
  salesOrderId: text("sales_order_id").notNull(),
  productId: text("product_id").notNull(),
  orderedQty: integer("ordered_qty").notNull(),
  deliveredQty: integer("delivered_qty").default(0).notNull(),
  unitPrice: numeric("unit_price").notNull(),
});

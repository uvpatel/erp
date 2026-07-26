import { pgTable, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  vendorName: text("vendor_name").notNull(),
  vendorId: text("vendor_id"),
  status: text("status").default("draft").notNull(), // 'draft' | 'confirmed' | 'partially_received' | 'received' | 'cancelled'
  totalAmount: numeric("total_amount").notNull(),
  triggeredFromSoId: text("triggered_from_so_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id").primaryKey(),
  purchaseOrderId: text("purchase_order_id").notNull(),
  productId: text("product_id").notNull(),
  orderedQty: integer("ordered_qty").notNull(),
  receivedQty: integer("received_qty").default(0).notNull(),
  unitCost: numeric("unit_cost").notNull(),
});

import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const stockLedger = pgTable("stock_ledger", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  referenceType: text("reference_type").notNull(), // 'SO' | 'PO' | 'MO_CONSUMPTION' | 'MO_PRODUCTION' | 'ADJUSTMENT'
  referenceId: text("reference_id").notNull(),
  changeQty: integer("change_qty").notNull(),
  resultingOnHand: integer("resulting_on_hand").notNull(),
  resultingReserved: integer("resulting_reserved").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").default("System").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'Product' | 'SalesOrder' | 'PurchaseOrder' | 'ManufacturingOrder' | 'Inventory' | 'BoM'
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // 'CREATE' | 'STATUS_CHANGE' | 'DELIVERY' | 'RECEIPT' | 'PROCUREMENT_TRIGGER' | 'PRODUCED'
  details: text("details").notNull(),
  userName: text("user_name").default("System").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

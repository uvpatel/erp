import { pgTable, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";

export const vendors = pgTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(), // 'Finished Good' | 'Component' | 'Raw Material'
  salesPrice: numeric("sales_price").notNull(),
  costPrice: numeric("cost_price").notNull(),
  onHandQty: integer("on_hand_qty").default(0).notNull(),
  reservedQty: integer("reserved_qty").default(0).notNull(),
  procurementStrategy: text("procurement_strategy").default("MTS").notNull(), // 'MTS' | 'MTO'
  procurementType: text("procurement_type").default("Manufacturing").notNull(), // 'Manufacturing' | 'Purchase'
  procureOnDemand: boolean("procure_on_demand").default(false).notNull(),
  vendorId: text("vendor_id"),
  bomId: text("bom_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

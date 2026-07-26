import { relations } from "drizzle-orm/_relations";
import { pgTable, text, timestamp, boolean, integer, numeric, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ERP Tables
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

export const userRelations = relations(user, ({ many }: any) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }: any) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }: any) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

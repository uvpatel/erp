import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "../auth/user.schema";
import { warehouses } from "../inventory/warehouses.schema";
import { salesOrders } from "./sales-orders.schema";

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "DRAFT",
  "READY",
  "DONE",
  "CANCELLED",
]);

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryNumber: text("delivery_number").notNull(),
    salesOrderId: uuid("sales_order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    status: deliveryStatusEnum("status").default("DRAFT").notNull(),
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    notes: text("notes"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    completedBy: text("completed_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("deliveries_delivery_number_uidx").on(table.deliveryNumber),
    index("deliveries_sales_order_status_idx").on(
      table.salesOrderId,
      table.status,
    ),
    index("deliveries_warehouse_status_idx").on(
      table.warehouseId,
      table.status,
    ),
    index("deliveries_status_scheduled_date_idx").on(
      table.status,
      table.scheduledDate,
    ),
    index("deliveries_created_by_idx").on(table.createdBy),
    index("deliveries_completed_by_idx").on(table.completedBy),
    check(
      "deliveries_number_not_blank",
      sql`btrim(${table.deliveryNumber}) <> ''`,
    ),
    check(
      "deliveries_completion_metadata",
      sql`(${table.status} = 'DONE' and ${table.deliveredAt} is not null and ${table.completedBy} is not null)
        or (${table.status} <> 'DONE' and ${table.deliveredAt} is null and ${table.completedBy} is null)`,
    ),
    check(
      "deliveries_delivered_after_creation",
      sql`${table.deliveredAt} is null or ${table.deliveredAt} >= ${table.createdAt}`,
    ),
  ],
);

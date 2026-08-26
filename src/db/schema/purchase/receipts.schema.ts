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
import { purchaseOrders } from "./purchase-orders.schema";

export const receiptStatusEnum = pgEnum("receipt_status", [
  "DRAFT",
  "DONE",
  "CANCELLED",
]);

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    receiptNumber: text("receipt_number").notNull(),
    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "restrict" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    status: receiptStatusEnum("status").default("DRAFT").notNull(),
    receivedAt: timestamp("received_at", {
      withTimezone: true,
      mode: "date",
    }),
    notes: text("notes"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    completedBy: text("completed_by").references(() => user.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("receipts_receipt_number_uidx").on(table.receiptNumber),
    index("receipts_purchase_order_status_idx").on(
      table.purchaseOrderId,
      table.status,
    ),
    index("receipts_warehouse_id_idx").on(table.warehouseId),
    index("receipts_status_idx").on(table.status),
    index("receipts_received_at_idx").on(table.receivedAt),
    index("receipts_created_by_idx").on(table.createdBy),
    index("receipts_completed_by_idx").on(table.completedBy),
    check(
      "receipts_receipt_number_not_blank",
      sql`char_length(btrim(${table.receiptNumber})) > 0`,
    ),
    check(
      "receipts_status_received_at_chk",
      sql`(
        (${table.status} = 'DONE' and ${table.receivedAt} is not null and ${table.completedBy} is not null)
        or (${table.status} in ('DRAFT', 'CANCELLED') and ${table.receivedAt} is null and ${table.completedBy} is null)
      )`,
    ),
    check(
      "receipts_received_at_chk",
      sql`${table.receivedAt} is null or ${table.receivedAt} >= ${table.createdAt}`,
    ),
    check("receipts_updated_at_chk", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

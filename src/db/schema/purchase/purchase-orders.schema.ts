import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "../auth/user.schema";
import { vendors } from "../partners/vendors.schema";
import { procurementRequests } from "../procurement/procurement-requests.schema";

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    status: purchaseOrderStatusEnum("status").default("DRAFT").notNull(),
    orderDate: timestamp("order_date", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    expectedReceiptDate: timestamp("expected_receipt_date", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    currencyCode: varchar("currency_code", { length: 3 }).notNull(),
    subtotal: numeric("subtotal", { precision: 18, scale: 2 })
      .default("0.00")
      .notNull(),
    taxTotal: numeric("tax_total", { precision: 18, scale: 2 })
      .default("0.00")
      .notNull(),
    grandTotal: numeric("grand_total", { precision: 18, scale: 2 })
      .default("0.00")
      .notNull(),
    procurementRequestId: uuid("procurement_request_id").references(
      () => procurementRequests.id,
      { onDelete: "restrict" },
    ),
    notes: text("notes"),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),
    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    confirmedBy: text("confirmed_by").references(() => user.id, {
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
    uniqueIndex("purchase_orders_order_number_uidx").on(table.orderNumber),
    uniqueIndex("purchase_orders_procurement_request_id_uidx").on(
      table.procurementRequestId,
    ),
    index("purchase_orders_vendor_id_idx").on(table.vendorId),
    index("purchase_orders_status_order_date_idx").on(
      table.status,
      table.orderDate,
    ),
    index("purchase_orders_created_by_idx").on(table.createdBy),
    index("purchase_orders_confirmed_by_idx").on(table.confirmedBy),
    check(
      "purchase_orders_currency_code_chk",
      sql`${table.currencyCode} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "purchase_orders_order_number_not_blank",
      sql`char_length(btrim(${table.orderNumber})) > 0`,
    ),
    check("purchase_orders_subtotal_non_negative_chk", sql`${table.subtotal} >= 0`),
    check("purchase_orders_tax_total_non_negative_chk", sql`${table.taxTotal} >= 0`),
    check(
      "purchase_orders_grand_total_chk",
      sql`${table.grandTotal} = ${table.subtotal} + ${table.taxTotal}`,
    ),
    check(
      "purchase_orders_expected_receipt_date_chk",
      sql`${table.expectedReceiptDate} >= ${table.orderDate}`,
    ),
    check(
      "purchase_orders_confirmed_at_chk",
      sql`${table.confirmedAt} is null or ${table.confirmedAt} >= ${table.orderDate}`,
    ),
    check(
      "purchase_orders_cancelled_at_chk",
      sql`${table.cancelledAt} is null or ${table.cancelledAt} >= ${table.orderDate}`,
    ),
    check(
      "purchase_orders_event_order_chk",
      sql`${table.cancelledAt} is null or ${table.confirmedAt} is null or ${table.cancelledAt} >= ${table.confirmedAt}`,
    ),
    check(
      "purchase_orders_confirmation_metadata_chk",
      sql`(
        (${table.status} in ('CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED') and ${table.confirmedAt} is not null and ${table.confirmedBy} is not null)
        or (${table.status} = 'DRAFT' and ${table.confirmedAt} is null and ${table.confirmedBy} is null)
        or (${table.status} = 'CANCELLED' and ((${table.confirmedAt} is null and ${table.confirmedBy} is null) or (${table.confirmedAt} is not null and ${table.confirmedBy} is not null)))
      )`,
    ),
    check(
      "purchase_orders_status_timestamps_chk",
      sql`(
        (${table.status} = 'DRAFT' and ${table.confirmedAt} is null and ${table.cancelledAt} is null)
        or (${table.status} in ('CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED') and ${table.confirmedAt} is not null and ${table.cancelledAt} is null)
        or (${table.status} = 'CANCELLED' and ${table.cancelledAt} is not null)
      )`,
    ),
    check(
      "purchase_orders_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

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
import { customers } from "../partners/customers.schema";

export const salesOrderStatusEnum = pgEnum("sales_order_status", [
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "CANCELLED",
]);

export const salesOrders = pgTable(
  "sales_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    status: salesOrderStatusEnum("status").default("DRAFT").notNull(),
    orderDate: timestamp("order_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expectedDeliveryDate: timestamp("expected_delivery_date", {
      withTimezone: true,
    }),
    currencyCode: varchar("currency_code", { length: 3 })
      .default("INR")
      .notNull(),
    subtotal: numeric("subtotal", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    discountTotal: numeric("discount_total", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    taxTotal: numeric("tax_total", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    grandTotal: numeric("grand_total", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    notes: text("notes"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    confirmedBy: text("confirmed_by").references(() => user.id, {
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
    uniqueIndex("sales_orders_order_number_uidx").on(table.orderNumber),
    index("sales_orders_customer_order_date_idx").on(
      table.customerId,
      table.orderDate,
    ),
    index("sales_orders_status_order_date_idx").on(
      table.status,
      table.orderDate,
    ),
    index("sales_orders_expected_delivery_date_idx").on(
      table.expectedDeliveryDate,
    ),
    index("sales_orders_created_by_idx").on(table.createdBy),
    index("sales_orders_confirmed_by_idx").on(table.confirmedBy),
    check(
      "sales_orders_number_not_blank",
      sql`btrim(${table.orderNumber}) <> ''`,
    ),
    check(
      "sales_orders_currency_code_format",
      sql`${table.currencyCode} ~ '^[A-Z]{3}$'`,
    ),
    check("sales_orders_subtotal_non_negative", sql`${table.subtotal} >= 0`),
    check(
      "sales_orders_discount_non_negative",
      sql`${table.discountTotal} >= 0`,
    ),
    check("sales_orders_tax_non_negative", sql`${table.taxTotal} >= 0`),
    check(
      "sales_orders_grand_total_non_negative",
      sql`${table.grandTotal} >= 0`,
    ),
    check(
      "sales_orders_discount_lte_subtotal",
      sql`${table.discountTotal} <= ${table.subtotal}`,
    ),
    check(
      "sales_orders_total_accounting",
      sql`${table.grandTotal} = ${table.subtotal} - ${table.discountTotal} + ${table.taxTotal}`,
    ),
    check(
      "sales_orders_expected_delivery_after_order",
      sql`${table.expectedDeliveryDate} is null or ${table.expectedDeliveryDate} >= ${table.orderDate}`,
    ),
    check(
      "sales_orders_confirmation_metadata",
      sql`(
        (${table.status} in ('CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED') and ${table.confirmedAt} is not null and ${table.confirmedBy} is not null)
        or (${table.status} = 'DRAFT' and ${table.confirmedAt} is null and ${table.confirmedBy} is null)
        or (${table.status} = 'CANCELLED' and ((${table.confirmedAt} is null and ${table.confirmedBy} is null) or (${table.confirmedAt} is not null and ${table.confirmedBy} is not null)))
      )`,
    ),
    check(
      "sales_orders_confirmed_after_order",
      sql`${table.confirmedAt} is null or ${table.confirmedAt} >= ${table.orderDate}`,
    ),
    check(
      "sales_orders_cancellation_metadata",
      sql`(${table.status} = 'CANCELLED' and ${table.cancelledAt} is not null)
        or (${table.status} <> 'CANCELLED' and ${table.cancelledAt} is null)`,
    ),
    check(
      "sales_orders_cancelled_after_order",
      sql`${table.cancelledAt} is null or ${table.cancelledAt} >= ${table.orderDate}`,
    ),
  ],
);

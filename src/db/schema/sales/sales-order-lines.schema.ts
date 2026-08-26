import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "../products/products.schema";
import { salesOrders } from "./sales-orders.schema";

export const salesOrderLines = pgTable(
  "sales_order_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    salesOrderId: uuid("sales_order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    orderedQuantity: numeric("ordered_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    reservedQuantity: numeric("reserved_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    deliveredQuantity: numeric("delivered_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 })
      .default("0")
      .notNull(),
    lineTotal: numeric("line_total", { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sales_order_lines_order_product_idx").on(
      table.salesOrderId,
      table.productId,
    ),
    index("sales_order_lines_product_id_idx").on(table.productId),
    check(
      "sales_order_lines_description_not_blank",
      sql`btrim(${table.description}) <> ''`,
    ),
    check(
      "sales_order_lines_ordered_quantity_positive",
      sql`${table.orderedQuantity} > 0`,
    ),
    check(
      "sales_order_lines_reserved_quantity_non_negative",
      sql`${table.reservedQuantity} >= 0`,
    ),
    check(
      "sales_order_lines_delivered_quantity_non_negative",
      sql`${table.deliveredQuantity} >= 0`,
    ),
    check(
      "sales_order_lines_fulfilled_lte_ordered",
      sql`${table.reservedQuantity} + ${table.deliveredQuantity} <= ${table.orderedQuantity}`,
    ),
    check(
      "sales_order_lines_unit_price_non_negative",
      sql`${table.unitPrice} >= 0`,
    ),
    check(
      "sales_order_lines_discount_non_negative",
      sql`${table.discountAmount} >= 0`,
    ),
    check("sales_order_lines_tax_non_negative", sql`${table.taxAmount} >= 0`),
    check("sales_order_lines_total_non_negative", sql`${table.lineTotal} >= 0`),
    check(
      "sales_order_lines_discount_lte_gross",
      sql`${table.discountAmount} <= round(${table.orderedQuantity} * ${table.unitPrice}, 2)`,
    ),
    check(
      "sales_order_lines_total_accounting",
      sql`${table.lineTotal} = round(${table.orderedQuantity} * ${table.unitPrice} - ${table.discountAmount} + ${table.taxAmount}, 2)`,
    ),
  ],
);

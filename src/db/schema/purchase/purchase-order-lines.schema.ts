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
import { purchaseOrders } from "./purchase-orders.schema";

export const purchaseOrderLines = pgTable(
  "purchase_order_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    description: text("description").notNull(),
    orderedQuantity: numeric("ordered_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    receivedQuantity: numeric("received_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0.0000")
      .notNull(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 })
      .default("0.00")
      .notNull(),
    lineTotal: numeric("line_total", { precision: 18, scale: 2 }).notNull(),
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
    index("purchase_order_lines_purchase_order_id_idx").on(
      table.purchaseOrderId,
    ),
    index("purchase_order_lines_product_id_idx").on(table.productId),
    check(
      "purchase_order_lines_description_not_blank",
      sql`char_length(btrim(${table.description})) > 0`,
    ),
    check(
      "purchase_order_lines_ordered_quantity_chk",
      sql`${table.orderedQuantity} > 0`,
    ),
    check(
      "purchase_order_lines_received_quantity_chk",
      sql`${table.receivedQuantity} >= 0 and ${table.receivedQuantity} <= ${table.orderedQuantity}`,
    ),
    check("purchase_order_lines_unit_cost_chk", sql`${table.unitCost} >= 0`),
    check("purchase_order_lines_tax_amount_chk", sql`${table.taxAmount} >= 0`),
    check(
      "purchase_order_lines_line_total_chk",
      sql`${table.lineTotal} = round((${table.orderedQuantity} * ${table.unitCost}) + ${table.taxAmount}, 2)`,
    ),
    check(
      "purchase_order_lines_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

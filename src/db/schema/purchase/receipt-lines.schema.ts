import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { stockLocations } from "../inventory/stock-locations.schema";
import { products } from "../products/products.schema";
import { purchaseOrderLines } from "./purchase-order-lines.schema";
import { receipts } from "./receipts.schema";

export const receiptLines = pgTable(
  "receipt_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    receiptId: uuid("receipt_id")
      .notNull()
      .references(() => receipts.id, { onDelete: "cascade" }),
    purchaseOrderLineId: uuid("purchase_order_line_id")
      .notNull()
      .references(() => purchaseOrderLines.id, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    toLocationId: uuid("to_location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "restrict" }),
    unitCost: numeric("unit_cost", { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("receipt_lines_receipt_order_line_uidx").on(
      table.receiptId,
      table.purchaseOrderLineId,
    ),
    index("receipt_lines_purchase_order_line_id_idx").on(
      table.purchaseOrderLineId,
    ),
    index("receipt_lines_product_id_idx").on(table.productId),
    index("receipt_lines_to_location_id_idx").on(table.toLocationId),
    check("receipt_lines_quantity_chk", sql`${table.quantity} > 0`),
    check("receipt_lines_unit_cost_chk", sql`${table.unitCost} >= 0`),
  ],
);

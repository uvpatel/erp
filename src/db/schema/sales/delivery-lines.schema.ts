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
import { deliveries } from "./deliveries.schema";
import { salesOrderLines } from "./sales-order-lines.schema";

export const deliveryLines = pgTable(
  "delivery_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => deliveries.id, { onDelete: "cascade" }),
    salesOrderLineId: uuid("sales_order_line_id")
      .notNull()
      .references(() => salesOrderLines.id, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    fromLocationId: uuid("from_location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("delivery_lines_delivery_order_line_uidx").on(
      table.deliveryId,
      table.salesOrderLineId,
    ),
    index("delivery_lines_sales_order_line_id_idx").on(
      table.salesOrderLineId,
    ),
    index("delivery_lines_product_id_idx").on(table.productId),
    index("delivery_lines_from_location_id_idx").on(table.fromLocationId),
    check("delivery_lines_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

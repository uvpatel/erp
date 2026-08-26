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

import { products } from "../products/products.schema";
import { stockLocations } from "./stock-locations.schema";

export const stockBalances = pgTable(
  "stock_balances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "restrict" }),
    onHandQuantity: numeric("on_hand_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    reservedQuantity: numeric("reserved_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("stock_balances_product_location_uidx").on(
      table.productId,
      table.locationId,
    ),
    index("stock_balances_location_product_idx").on(
      table.locationId,
      table.productId,
    ),
    check(
      "stock_balances_on_hand_non_negative",
      sql`${table.onHandQuantity} >= 0`,
    ),
    check(
      "stock_balances_reserved_non_negative",
      sql`${table.reservedQuantity} >= 0`,
    ),
    check(
      "stock_balances_reserved_lte_on_hand",
      sql`${table.reservedQuantity} <= ${table.onHandQuantity}`,
    ),
  ],
);

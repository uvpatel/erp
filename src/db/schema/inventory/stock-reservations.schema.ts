import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "../auth/user.schema";
import { products } from "../products/products.schema";
import { stockLocations } from "./stock-locations.schema";

export const stockReservationSourceTypeEnum = pgEnum(
  "stock_reservation_source_type",
  ["SALES_ORDER", "MANUFACTURING_ORDER"],
);

export const stockReservationStatusEnum = pgEnum(
  "stock_reservation_status",
  ["ACTIVE", "PARTIALLY_CONSUMED", "CONSUMED", "RELEASED", "CANCELLED"],
);

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => stockLocations.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    consumedQuantity: numeric("consumed_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    sourceType: stockReservationSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),
    sourceLineId: uuid("source_line_id"),
    status: stockReservationStatusEnum("status").default("ACTIVE").notNull(),
    reservedAt: timestamp("reserved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("stock_reservations_product_location_status_idx").on(
      table.productId,
      table.locationId,
      table.status,
    ),
    index("stock_reservations_location_status_idx").on(
      table.locationId,
      table.status,
    ),
    index("stock_reservations_source_status_idx").on(
      table.sourceType,
      table.sourceId,
      table.status,
    ),
    index("stock_reservations_source_line_id_idx").on(table.sourceLineId),
    index("stock_reservations_created_by_idx").on(table.createdBy),
    check("stock_reservations_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "stock_reservations_consumed_non_negative",
      sql`${table.consumedQuantity} >= 0`,
    ),
    check(
      "stock_reservations_consumed_lte_quantity",
      sql`${table.consumedQuantity} <= ${table.quantity}`,
    ),
    check(
      "stock_reservations_release_after_reserve",
      sql`${table.releasedAt} is null or ${table.releasedAt} >= ${table.reservedAt}`,
    ),
    check(
      "stock_reservations_status_accounting",
      sql`(
        (${table.status} = 'ACTIVE' and ${table.consumedQuantity} = 0 and ${table.releasedAt} is null)
        or (${table.status} = 'PARTIALLY_CONSUMED' and ${table.consumedQuantity} > 0 and ${table.consumedQuantity} < ${table.quantity} and ${table.releasedAt} is null)
        or (${table.status} = 'CONSUMED' and ${table.consumedQuantity} = ${table.quantity} and ${table.releasedAt} is null)
        or (${table.status} in ('RELEASED', 'CANCELLED') and ${table.consumedQuantity} < ${table.quantity} and ${table.releasedAt} is not null)
      )`,
    ),
  ],
);

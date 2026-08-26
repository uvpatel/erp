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
} from "drizzle-orm/pg-core";

import { user } from "../auth/user.schema";
import { products } from "../products/products.schema";
import { stockLocations } from "./stock-locations.schema";

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "PURCHASE_RECEIPT",
  "SALE_DELIVERY",
  "MANUFACTURING_CONSUMPTION",
  "MANUFACTURING_PRODUCTION",
  "TRANSFER",
  "ADJUSTMENT_IN",
  "ADJUSTMENT_OUT",
  "RETURN_IN",
  "RETURN_OUT",
  "SCRAP",
]);

export const stockMovementReferenceTypeEnum = pgEnum(
  "stock_movement_reference_type",
  [
    "PURCHASE_RECEIPT",
    "SALES_DELIVERY",
    "MANUFACTURING_ORDER",
    "TRANSFER",
    "ADJUSTMENT",
    "RETURN",
    "SCRAP",
  ],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    movementNumber: text("movement_number").notNull(),
    idempotencyKey: text("idempotency_key"),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    fromLocationId: uuid("from_location_id").references(
      () => stockLocations.id,
      { onDelete: "restrict" },
    ),
    toLocationId: uuid("to_location_id").references(() => stockLocations.id, {
      onDelete: "restrict",
    }),
    movementType: stockMovementTypeEnum("movement_type").notNull(),
    referenceType:
      stockMovementReferenceTypeEnum("reference_type").notNull(),
    referenceId: uuid("reference_id").notNull(),
    referenceLineId: uuid("reference_line_id"),
    unitCost: numeric("unit_cost", { precision: 18, scale: 2 }),
    performedBy: text("performed_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("stock_movements_movement_number_uidx").on(
      table.movementNumber,
    ),
    uniqueIndex("stock_movements_idempotency_key_uidx").on(
      table.idempotencyKey,
    ),
    index("stock_movements_product_occurred_at_idx").on(
      table.productId,
      table.occurredAt,
    ),
    index("stock_movements_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    index("stock_movements_from_location_occurred_at_idx").on(
      table.fromLocationId,
      table.occurredAt,
    ),
    index("stock_movements_to_location_occurred_at_idx").on(
      table.toLocationId,
      table.occurredAt,
    ),
    index("stock_movements_performed_by_idx").on(table.performedBy),
    check(
      "stock_movements_number_not_blank",
      sql`btrim(${table.movementNumber}) <> ''`,
    ),
    check(
      "stock_movements_idempotency_key_not_blank",
      sql`${table.idempotencyKey} is null or btrim(${table.idempotencyKey}) <> ''`,
    ),
    check("stock_movements_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "stock_movements_unit_cost_non_negative",
      sql`${table.unitCost} is null or ${table.unitCost} >= 0`,
    ),
    check(
      "stock_movements_endpoints_present_and_distinct",
      sql`(${table.fromLocationId} is not null or ${table.toLocationId} is not null)
        and (${table.fromLocationId} is null or ${table.toLocationId} is null or ${table.fromLocationId} <> ${table.toLocationId})`,
    ),
    check(
      "stock_movements_type_has_valid_endpoint",
      sql`(
        (${table.movementType} in ('PURCHASE_RECEIPT', 'MANUFACTURING_PRODUCTION', 'ADJUSTMENT_IN', 'RETURN_IN') and ${table.toLocationId} is not null)
        or (${table.movementType} in ('SALE_DELIVERY', 'MANUFACTURING_CONSUMPTION', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'SCRAP') and ${table.fromLocationId} is not null)
        or (${table.movementType} = 'TRANSFER' and ${table.fromLocationId} is not null and ${table.toLocationId} is not null)
      )`,
    ),
  ],
);

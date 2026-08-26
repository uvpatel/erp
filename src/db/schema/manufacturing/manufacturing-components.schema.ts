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
import { unitsOfMeasure } from "../products/units-of-measure.schema";
import { bomComponents } from "./bom-components.schema";
import { manufacturingOrders } from "./manufacturing-orders.schema";

export const manufacturingComponents = pgTable(
  "manufacturing_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    manufacturingOrderId: uuid("manufacturing_order_id")
      .notNull()
      .references(() => manufacturingOrders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    requiredQuantity: numeric("required_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    reservedQuantity: numeric("reserved_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0.0000")
      .notNull(),
    consumedQuantity: numeric("consumed_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0.0000")
      .notNull(),
    uomId: uuid("uom_id")
      .notNull()
      .references(() => unitsOfMeasure.id, { onDelete: "restrict" }),
    sourceBomComponentId: uuid("source_bom_component_id").references(
      () => bomComponents.id,
      { onDelete: "set null" },
    ),
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
    uniqueIndex("manufacturing_components_order_source_uidx").on(
      table.manufacturingOrderId,
      table.sourceBomComponentId,
    ),
    index("manufacturing_components_order_id_idx").on(
      table.manufacturingOrderId,
    ),
    index("manufacturing_components_product_id_idx").on(table.productId),
    index("manufacturing_components_uom_id_idx").on(table.uomId),
    index("manufacturing_components_source_bom_component_id_idx").on(
      table.sourceBomComponentId,
    ),
    check(
      "manufacturing_components_required_quantity_chk",
      sql`${table.requiredQuantity} > 0`,
    ),
    check(
      "manufacturing_components_reserved_quantity_chk",
      sql`${table.reservedQuantity} >= 0 and ${table.reservedQuantity} <= ${table.requiredQuantity}`,
    ),
    check(
      "manufacturing_components_consumed_quantity_chk",
      sql`${table.consumedQuantity} >= 0 and ${table.consumedQuantity} <= ${table.requiredQuantity}`,
    ),
    check(
      "manufacturing_components_accounted_quantity_chk",
      sql`${table.reservedQuantity} + ${table.consumedQuantity} <= ${table.requiredQuantity}`,
    ),
    check(
      "manufacturing_components_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

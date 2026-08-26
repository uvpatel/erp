import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "../products/products.schema";
import { unitsOfMeasure } from "../products/units-of-measure.schema";
import { boms } from "./boms.schema";

export const bomComponents = pgTable(
  "bom_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bomId: uuid("bom_id")
      .notNull()
      .references(() => boms.id, { onDelete: "cascade" }),
    componentProductId: uuid("component_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    uomId: uuid("uom_id")
      .notNull()
      .references(() => unitsOfMeasure.id, { onDelete: "restrict" }),
    sequence: integer("sequence").notNull(),
    notes: text("notes"),
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
    uniqueIndex("bom_components_bom_sequence_uidx").on(
      table.bomId,
      table.sequence,
    ),
    index("bom_components_bom_id_idx").on(table.bomId),
    index("bom_components_component_product_id_idx").on(
      table.componentProductId,
    ),
    index("bom_components_uom_id_idx").on(table.uomId),
    check("bom_components_quantity_chk", sql`${table.quantity} > 0`),
    check("bom_components_sequence_chk", sql`${table.sequence} > 0`),
    check(
      "bom_components_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

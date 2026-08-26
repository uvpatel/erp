import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { boms } from "../manufacturing/boms.schema";
import { vendors } from "../partners/vendors.schema";
import { procurementStrategyEnum, procurementTypeEnum } from "./procurement.enums";
import { products } from "./products.schema";

export { procurementStrategyEnum, procurementTypeEnum } from "./procurement.enums";

export const productProcurement = pgTable(
  "product_procurement",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    strategy: procurementStrategyEnum("strategy").default("MTS").notNull(),
    procurementType: procurementTypeEnum("procurement_type")
      .default("PURCHASE")
      .notNull(),
    procureOnDemand: boolean("procure_on_demand").default(false).notNull(),
    preferredVendorId: uuid("preferred_vendor_id").references(() => vendors.id, {
      onDelete: "restrict",
    }),
    defaultBomId: uuid("default_bom_id").references(() => boms.id, {
      onDelete: "restrict",
    }),
    reorderPoint: numeric("reorder_point", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    reorderQuantity: numeric("reorder_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    safetyStock: numeric("safety_stock", {
      precision: 18,
      scale: 4,
    })
      .default("0")
      .notNull(),
    leadTimeDays: integer("lead_time_days"),
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
    uniqueIndex("product_procurement_product_id_uidx").on(table.productId),
    index("product_procurement_vendor_id_idx").on(table.preferredVendorId),
    index("product_procurement_bom_id_idx").on(table.defaultBomId),
    check(
      "product_procurement_reorder_point_non_negative",
      sql`${table.reorderPoint} >= 0`,
    ),
    check(
      "product_procurement_reorder_quantity_non_negative",
      sql`${table.reorderQuantity} >= 0`,
    ),
    check(
      "product_procurement_safety_stock_non_negative",
      sql`${table.safetyStock} >= 0`,
    ),
    check(
      "product_procurement_lead_time_non_negative",
      sql`${table.leadTimeDays} is null OR ${table.leadTimeDays} >= 0`,
    ),
    check(
      "product_procurement_purchase_requires_vendor",
      sql`${table.procurementType} <> 'PURCHASE' OR ${table.preferredVendorId} is not null`,
    ),
    check(
      "product_procurement_manufacture_requires_bom",
      sql`${table.procurementType} <> 'MANUFACTURE' OR ${table.defaultBomId} is not null`,
    ),
  ],
);

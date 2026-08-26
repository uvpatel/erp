import { sql } from "drizzle-orm";
import {
  boolean,
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
import { unitsOfMeasure } from "./units-of-measure.schema";

export const productTypeEnum = pgEnum("product_type", [
  "STORABLE",
  "CONSUMABLE",
  "SERVICE",
]);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    productType: productTypeEnum("product_type").notNull(),
    uomId: uuid("uom_id")
      .notNull()
      .references(() => unitsOfMeasure.id, { onDelete: "restrict" }),
    salesPrice: numeric("sales_price", {
      precision: 18,
      scale: 2,
    })
      .default("0")
      .notNull(),
    costPrice: numeric("cost_price", {
      precision: 18,
      scale: 2,
    })
      .default("0")
      .notNull(),
    trackInventory: boolean("track_inventory").default(true).notNull(),
    active: boolean("active").default(true).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
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
    uniqueIndex("products_sku_uidx").on(table.sku),
    index("products_name_idx").on(table.name),
    index("products_uom_id_idx").on(table.uomId),
    index("products_created_by_idx").on(table.createdBy),
    check("products_sku_not_blank", sql`char_length(btrim(${table.sku})) > 0`),
    check(
      "products_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
    check("products_sales_price_non_negative", sql`${table.salesPrice} >= 0`),
    check("products_cost_price_non_negative", sql`${table.costPrice} >= 0`),
    check(
      "products_service_not_inventory_tracked",
      sql`${table.productType} <> 'SERVICE' OR NOT ${table.trackInventory}`,
    ),
  ],
);

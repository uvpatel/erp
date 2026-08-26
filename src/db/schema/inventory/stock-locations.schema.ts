import { sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { warehouses } from "./warehouses.schema";

export const stockLocationTypeEnum = pgEnum("stock_location_type", [
  "INTERNAL",
  "VENDOR",
  "CUSTOMER",
  "PRODUCTION",
  "INPUT",
  "OUTPUT",
  "SCRAP",
]);

export const stockLocations = pgTable(
  "stock_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    type: stockLocationTypeEnum("type").notNull(),
    parentLocationId: uuid("parent_location_id").references(
      (): AnyPgColumn => stockLocations.id,
      { onDelete: "restrict" },
    ),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("stock_locations_warehouse_code_uidx").on(
      table.warehouseId,
      table.code,
    ),
    index("stock_locations_parent_location_id_idx").on(
      table.parentLocationId,
    ),
    index("stock_locations_warehouse_type_active_idx").on(
      table.warehouseId,
      table.type,
      table.isActive,
    ),
    check("stock_locations_code_not_blank", sql`btrim(${table.code}) <> ''`),
    check("stock_locations_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check(
      "stock_locations_parent_not_self",
      sql`${table.parentLocationId} is null or ${table.parentLocationId} <> ${table.id}`,
    ),
  ],
);

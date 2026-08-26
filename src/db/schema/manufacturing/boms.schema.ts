import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
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
import { unitsOfMeasure } from "../products/units-of-measure.schema";

export const bomStatusEnum = pgEnum("bom_status", [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const boms = pgTable(
  "boms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bomNumber: text("bom_number").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    outputQuantity: numeric("output_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("1.0000")
      .notNull(),
    uomId: uuid("uom_id")
      .notNull()
      .references(() => unitsOfMeasure.id, { onDelete: "restrict" }),
    version: integer("version").default(1).notNull(),
    status: bomStatusEnum("status").default("DRAFT").notNull(),
    notes: text("notes"),
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
    uniqueIndex("boms_bom_number_uidx").on(table.bomNumber),
    uniqueIndex("boms_product_version_uidx").on(
      table.productId,
      table.version,
    ),
    index("boms_product_id_idx").on(table.productId),
    index("boms_uom_id_idx").on(table.uomId),
    index("boms_status_idx").on(table.status),
    index("boms_created_by_idx").on(table.createdBy),
    check(
      "boms_bom_number_not_blank",
      sql`char_length(btrim(${table.bomNumber})) > 0`,
    ),
    check("boms_name_not_blank", sql`char_length(btrim(${table.name})) > 0`),
    check("boms_output_quantity_chk", sql`${table.outputQuantity} > 0`),
    check("boms_version_chk", sql`${table.version} > 0`),
    check("boms_updated_at_chk", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

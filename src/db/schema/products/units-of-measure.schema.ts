import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const unitOfMeasureCategoryEnum = pgEnum("unit_of_measure_category", [
  "QUANTITY",
  "WEIGHT",
  "LENGTH",
  "AREA",
  "VOLUME",
  "TIME",
]);

export const unitsOfMeasure = pgTable(
  "units_of_measure",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    category: unitOfMeasureCategoryEnum("category").notNull(),
    symbol: text("symbol").notNull(),
    precision: smallint("precision").default(4).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
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
    uniqueIndex("units_of_measure_code_uidx").on(table.code),
    index("units_of_measure_name_idx").on(table.name),
    check(
      "units_of_measure_code_not_blank",
      sql`char_length(btrim(${table.code})) > 0`,
    ),
    check(
      "units_of_measure_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
    check(
      "units_of_measure_symbol_not_blank",
      sql`char_length(btrim(${table.symbol})) > 0`,
    ),
    check(
      "units_of_measure_precision_range",
      sql`${table.precision} between 0 and 4`,
    ),
  ],
);

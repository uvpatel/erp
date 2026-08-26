import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const workCenters = pgTable(
  "work_centers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    capacity: numeric("capacity", { precision: 18, scale: 4 })
      .default("1.0000")
      .notNull(),
    costPerHour: numeric("cost_per_hour", { precision: 18, scale: 2 }),
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
    uniqueIndex("work_centers_code_uidx").on(table.code),
    index("work_centers_name_idx").on(table.name),
    check(
      "work_centers_code_not_blank",
      sql`char_length(btrim(${table.code})) > 0`,
    ),
    check(
      "work_centers_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
    check("work_centers_capacity_chk", sql`${table.capacity} > 0`),
    check(
      "work_centers_cost_per_hour_chk",
      sql`${table.costPerHour} is null or ${table.costPerHour} >= 0`,
    ),
    check(
      "work_centers_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { boms } from "./boms.schema";
import { workCenters } from "./work-centers.schema";

export const bomOperations = pgTable(
  "bom_operations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bomId: uuid("bom_id")
      .notNull()
      .references(() => boms.id, { onDelete: "cascade" }),
    workCenterId: uuid("work_center_id")
      .notNull()
      .references(() => workCenters.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    sequence: integer("sequence").notNull(),
    expectedDurationMinutes: integer("expected_duration_minutes").notNull(),
    instructions: text("instructions"),
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
    uniqueIndex("bom_operations_bom_sequence_uidx").on(
      table.bomId,
      table.sequence,
    ),
    index("bom_operations_bom_id_idx").on(table.bomId),
    index("bom_operations_work_center_id_idx").on(table.workCenterId),
    check(
      "bom_operations_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
    check("bom_operations_sequence_chk", sql`${table.sequence} > 0`),
    check(
      "bom_operations_expected_duration_chk",
      sql`${table.expectedDurationMinutes} > 0`,
    ),
    check(
      "bom_operations_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

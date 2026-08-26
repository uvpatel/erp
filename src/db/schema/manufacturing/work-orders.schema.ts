import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth/user.schema";
import { manufacturingOrders } from "./manufacturing-orders.schema";
import { workCenters } from "./work-centers.schema";

export const workOrderStatusEnum = pgEnum("work_order_status", [
  "PENDING",
  "READY",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

export const workOrders = pgTable(
  "work_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workOrderNumber: text("work_order_number").notNull(),
    manufacturingOrderId: uuid("manufacturing_order_id")
      .notNull()
      .references(() => manufacturingOrders.id, { onDelete: "cascade" }),
    workCenterId: uuid("work_center_id")
      .notNull()
      .references(() => workCenters.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    sequence: integer("sequence").notNull(),
    status: workOrderStatusEnum("status").default("PENDING").notNull(),
    plannedDurationMinutes: integer("planned_duration_minutes").notNull(),
    actualDurationMinutes: integer("actual_duration_minutes"),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "restrict",
    }),
    startedAt: timestamp("started_at", {
      withTimezone: true,
      mode: "date",
    }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    instructions: text("instructions"),
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
    uniqueIndex("work_orders_work_order_number_uidx").on(
      table.workOrderNumber,
    ),
    uniqueIndex("work_orders_order_sequence_uidx").on(
      table.manufacturingOrderId,
      table.sequence,
    ),
    index("work_orders_manufacturing_order_id_idx").on(
      table.manufacturingOrderId,
    ),
    index("work_orders_work_center_id_idx").on(table.workCenterId),
    index("work_orders_status_idx").on(table.status),
    index("work_orders_assignee_id_idx").on(table.assigneeId),
    check(
      "work_orders_work_order_number_not_blank",
      sql`char_length(btrim(${table.workOrderNumber})) > 0`,
    ),
    check(
      "work_orders_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
    check("work_orders_sequence_chk", sql`${table.sequence} > 0`),
    check(
      "work_orders_planned_duration_chk",
      sql`${table.plannedDurationMinutes} > 0`,
    ),
    check(
      "work_orders_actual_duration_chk",
      sql`${table.actualDurationMinutes} is null or ${table.actualDurationMinutes} >= 0`,
    ),
    check(
      "work_orders_dates_chk",
      sql`(${table.completedAt} is null or ${table.startedAt} is not null) and (${table.completedAt} is null or ${table.completedAt} >= ${table.startedAt})`,
    ),
    check(
      "work_orders_status_timestamps_chk",
      sql`(
        (${table.status} in ('PENDING', 'READY') and ${table.startedAt} is null and ${table.completedAt} is null and ${table.actualDurationMinutes} is null)
        or (${table.status} in ('IN_PROGRESS', 'PAUSED') and ${table.startedAt} is not null and ${table.completedAt} is null)
        or (${table.status} = 'COMPLETED' and ${table.startedAt} is not null and ${table.completedAt} is not null and ${table.actualDurationMinutes} is not null)
        or (${table.status} = 'CANCELLED' and ${table.completedAt} is null)
      )`,
    ),
    check(
      "work_orders_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

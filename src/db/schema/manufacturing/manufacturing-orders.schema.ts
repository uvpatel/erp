import { sql } from "drizzle-orm";
import {
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
import { warehouses } from "../inventory/warehouses.schema";
import { procurementRequests } from "../procurement/procurement-requests.schema";
import { products } from "../products/products.schema";
import { boms } from "./boms.schema";

export const manufacturingOrderStatusEnum = pgEnum(
  "manufacturing_order_status",
  [
    "DRAFT",
    "CONFIRMED",
    "WAITING_MATERIALS",
    "READY",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ],
);

export const manufacturingOrderSourceTypeEnum = pgEnum(
  "manufacturing_order_source_type",
  ["SALES_ORDER", "PROCUREMENT_REQUEST", "MANUAL"],
);

export const manufacturingOrders = pgTable(
  "manufacturing_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    bomId: uuid("bom_id")
      .notNull()
      .references(() => boms.id, { onDelete: "restrict" }),
    plannedQuantity: numeric("planned_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    producedQuantity: numeric("produced_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0.0000")
      .notNull(),
    status: manufacturingOrderStatusEnum("status").default("DRAFT").notNull(),
    sourceType: manufacturingOrderSourceTypeEnum("source_type"),
    sourceId: uuid("source_id"),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    plannedStartAt: timestamp("planned_start_at", {
      withTimezone: true,
      mode: "date",
    }),
    plannedEndAt: timestamp("planned_end_at", {
      withTimezone: true,
      mode: "date",
    }),
    actualStartAt: timestamp("actual_start_at", {
      withTimezone: true,
      mode: "date",
    }),
    actualEndAt: timestamp("actual_end_at", {
      withTimezone: true,
      mode: "date",
    }),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "restrict",
    }),
    procurementRequestId: uuid("procurement_request_id").references(
      () => procurementRequests.id,
      { onDelete: "restrict" },
    ),
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
    uniqueIndex("manufacturing_orders_order_number_uidx").on(
      table.orderNumber,
    ),
    uniqueIndex("manufacturing_orders_procurement_request_id_uidx").on(
      table.procurementRequestId,
    ),
    index("manufacturing_orders_product_id_idx").on(table.productId),
    index("manufacturing_orders_bom_id_idx").on(table.bomId),
    index("manufacturing_orders_warehouse_id_idx").on(table.warehouseId),
    index("manufacturing_orders_status_planned_start_at_idx").on(
      table.status,
      table.plannedStartAt,
    ),
    index("manufacturing_orders_source_idx").on(
      table.sourceType,
      table.sourceId,
    ),
    index("manufacturing_orders_planned_start_at_idx").on(
      table.plannedStartAt,
    ),
    index("manufacturing_orders_assignee_id_idx").on(table.assigneeId),
    index("manufacturing_orders_created_by_idx").on(table.createdBy),
    check(
      "manufacturing_orders_order_number_not_blank",
      sql`char_length(btrim(${table.orderNumber})) > 0`,
    ),
    check(
      "manufacturing_orders_planned_quantity_chk",
      sql`${table.plannedQuantity} > 0`,
    ),
    check(
      "manufacturing_orders_produced_quantity_chk",
      sql`${table.producedQuantity} >= 0 and ${table.producedQuantity} <= ${table.plannedQuantity}`,
    ),
    check(
      "manufacturing_orders_source_reference_chk",
      sql`(${table.sourceType} is null and ${table.sourceId} is null) or (${table.sourceType} is not null and ${table.sourceId} is not null)`,
    ),
    check(
      "manufacturing_orders_planned_dates_chk",
      sql`${table.plannedStartAt} is null or ${table.plannedEndAt} is null or ${table.plannedEndAt} >= ${table.plannedStartAt}`,
    ),
    check(
      "manufacturing_orders_actual_dates_chk",
      sql`(${table.actualEndAt} is null or ${table.actualStartAt} is not null) and (${table.actualEndAt} is null or ${table.actualEndAt} >= ${table.actualStartAt})`,
    ),
    check(
      "manufacturing_orders_status_timestamps_chk",
      sql`(
        (${table.status} in ('DRAFT', 'CONFIRMED', 'WAITING_MATERIALS', 'READY') and ${table.actualStartAt} is null and ${table.actualEndAt} is null)
        or (${table.status} = 'IN_PROGRESS' and ${table.actualStartAt} is not null and ${table.actualEndAt} is null)
        or (${table.status} = 'COMPLETED' and ${table.actualStartAt} is not null and ${table.actualEndAt} is not null and ${table.producedQuantity} > 0)
        or (${table.status} = 'CANCELLED')
      )`,
    ),
    check(
      "manufacturing_orders_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

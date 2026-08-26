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
import {
  procurementStrategyEnum,
  procurementTypeEnum,
} from "../products/product-procurement.schema";
import { products } from "../products/products.schema";

export const procurementSourceTypeEnum = pgEnum("procurement_source_type", [
  "SALES_ORDER",
  "MANUFACTURING_ORDER",
  "REORDER_RULE",
  "MANUAL",
]);

export const procurementRequestStatusEnum = pgEnum(
  "procurement_request_status",
  [
    "PENDING",
    "PROCESSING",
    "PROCURED",
    "PARTIALLY_FULFILLED",
    "FULFILLED",
    "FAILED",
    "CANCELLED",
  ],
);

export const procurementRequests = pgTable(
  "procurement_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestNumber: text("request_number").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    requestedQuantity: numeric("requested_quantity", {
      precision: 18,
      scale: 4,
    }).notNull(),
    fulfilledQuantity: numeric("fulfilled_quantity", {
      precision: 18,
      scale: 4,
    })
      .default("0.0000")
      .notNull(),
    strategy: procurementStrategyEnum("strategy").notNull(),
    procurementType: procurementTypeEnum("procurement_type").notNull(),
    sourceType: procurementSourceTypeEnum("source_type").notNull(),
    sourceId: uuid("source_id").notNull(),
    sourceLineId: uuid("source_line_id"),
    status: procurementRequestStatusEnum("status").default("PENDING").notNull(),
    requiredByDate: timestamp("required_by_date", {
      withTimezone: true,
      mode: "date",
    }),
    failureReason: text("failure_reason"),
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
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("procurement_requests_request_number_uidx").on(
      table.requestNumber,
    ),
    index("procurement_requests_product_id_idx").on(table.productId),
    index("procurement_requests_status_required_by_date_idx").on(
      table.status,
      table.requiredByDate,
    ),
    index("procurement_requests_source_idx").on(
      table.sourceType,
      table.sourceId,
    ),
    index("procurement_requests_type_status_idx").on(
      table.procurementType,
      table.status,
    ),
    index("procurement_requests_required_by_date_idx").on(
      table.requiredByDate,
    ),
    index("procurement_requests_created_by_idx").on(table.createdBy),
    check(
      "procurement_requests_request_number_not_blank",
      sql`char_length(btrim(${table.requestNumber})) > 0`,
    ),
    check(
      "procurement_requests_requested_quantity_chk",
      sql`${table.requestedQuantity} > 0`,
    ),
    check(
      "procurement_requests_fulfilled_quantity_chk",
      sql`${table.fulfilledQuantity} >= 0 and ${table.fulfilledQuantity} <= ${table.requestedQuantity}`,
    ),
    check(
      "procurement_requests_fulfillment_status_chk",
      sql`(
        (${table.status} = 'PARTIALLY_FULFILLED' and ${table.fulfilledQuantity} > 0 and ${table.fulfilledQuantity} < ${table.requestedQuantity})
        or (${table.status} = 'FULFILLED' and ${table.fulfilledQuantity} = ${table.requestedQuantity})
        or (${table.status} not in ('PARTIALLY_FULFILLED', 'FULFILLED'))
      )`,
    ),
    check(
      "procurement_requests_failure_reason_chk",
      sql`(${table.status} = 'FAILED' and nullif(btrim(${table.failureReason}), '') is not null) or (${table.status} <> 'FAILED' and ${table.failureReason} is null)`,
    ),
    check(
      "procurement_requests_completed_at_status_chk",
      sql`(
        (${table.status} in ('FULFILLED', 'FAILED', 'CANCELLED') and ${table.completedAt} is not null)
        or (${table.status} not in ('FULFILLED', 'FAILED', 'CANCELLED') and ${table.completedAt} is null)
      )`,
    ),
    check(
      "procurement_requests_completed_at_chk",
      sql`${table.completedAt} is null or ${table.completedAt} >= ${table.createdAt}`,
    ),
    check(
      "procurement_requests_updated_at_chk",
      sql`${table.updatedAt} >= ${table.createdAt}`,
    ),
  ],
);

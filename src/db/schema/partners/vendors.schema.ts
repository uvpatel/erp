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

export const vendorStatusEnum = pgEnum("vendor_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const vendors = pgTable(
  "vendors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vendorCode: text("vendor_code").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    taxId: text("tax_id"),
    leadTimeDays: integer("lead_time_days").default(0).notNull(),
    paymentTerms: text("payment_terms"),
    status: vendorStatusEnum("status").default("ACTIVE").notNull(),
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
    uniqueIndex("vendors_vendor_code_uidx").on(table.vendorCode),
    index("vendors_name_idx").on(table.name),
    index("vendors_status_name_idx").on(table.status, table.name),
    index("vendors_created_by_idx").on(table.createdBy),
    check(
      "vendors_vendor_code_not_blank",
      sql`char_length(btrim(${table.vendorCode})) > 0`,
    ),
    check("vendors_name_not_blank", sql`char_length(btrim(${table.name})) > 0`),
    check("vendors_lead_time_non_negative", sql`${table.leadTimeDays} >= 0`),
  ],
);

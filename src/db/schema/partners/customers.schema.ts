import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "../auth/user.schema";

export const customerStatusEnum = pgEnum("customer_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerCode: text("customer_code").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    billingAddressLine1: text("billing_address_line_1"),
    billingAddressLine2: text("billing_address_line_2"),
    billingCity: text("billing_city"),
    billingState: text("billing_state"),
    billingPostalCode: text("billing_postal_code"),
    billingCountry: text("billing_country"),
    shippingAddressLine1: text("shipping_address_line_1"),
    shippingAddressLine2: text("shipping_address_line_2"),
    shippingCity: text("shipping_city"),
    shippingState: text("shipping_state"),
    shippingPostalCode: text("shipping_postal_code"),
    shippingCountry: text("shipping_country"),
    taxId: text("tax_id"),
    status: customerStatusEnum("status").default("ACTIVE").notNull(),
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
    uniqueIndex("customers_customer_code_uidx").on(table.customerCode),
    index("customers_name_idx").on(table.name),
    index("customers_status_name_idx").on(table.status, table.name),
    index("customers_created_by_idx").on(table.createdBy),
    check(
      "customers_customer_code_not_blank",
      sql`char_length(btrim(${table.customerCode})) > 0`,
    ),
    check(
      "customers_name_not_blank",
      sql`char_length(btrim(${table.name})) > 0`,
    ),
  ],
);

import { sql } from "drizzle-orm";
import {
  check,
  index,
  inet,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../auth/user.schema";

type AuditPayload = Record<string, unknown>;

// Audit logs are append-only: create a compensating entry instead of updating
// or deleting an existing record.
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "restrict",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    beforeData: jsonb("before_data").$type<AuditPayload>(),
    afterData: jsonb("after_data").$type<AuditPayload>(),
    metadata: jsonb("metadata").$type<AuditPayload>(),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_id_idx").on(table.actorId),
    index("audit_logs_created_at_idx").on(table.createdAt),
    check(
      "audit_logs_entity_type_chk",
      sql`nullif(btrim(${table.entityType}), '') is not null`,
    ),
    check(
      "audit_logs_entity_id_chk",
      sql`nullif(btrim(${table.entityId}), '') is not null`,
    ),
    check(
      "audit_logs_action_chk",
      sql`nullif(btrim(${table.action}), '') is not null`,
    ),
    check(
      "audit_logs_before_data_chk",
      sql`${table.beforeData} is null or jsonb_typeof(${table.beforeData}) = 'object'`,
    ),
    check(
      "audit_logs_after_data_chk",
      sql`${table.afterData} is null or jsonb_typeof(${table.afterData}) = 'object'`,
    ),
    check(
      "audit_logs_metadata_chk",
      sql`${table.metadata} is null or jsonb_typeof(${table.metadata}) = 'object'`,
    ),
  ],
);

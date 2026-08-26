import { pgEnum } from "drizzle-orm/pg-core";

export const procurementStrategyEnum = pgEnum("procurement_strategy", [
  "MTS",
  "MTO",
]);

export const procurementTypeEnum = pgEnum("procurement_type", [
  "PURCHASE",
  "MANUFACTURE",
]);

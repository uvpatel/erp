CREATE TYPE "customer_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "vendor_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "unit_of_measure_category" AS ENUM('QUANTITY', 'WEIGHT', 'LENGTH', 'AREA', 'VOLUME', 'TIME');--> statement-breakpoint
CREATE TYPE "product_type" AS ENUM('STORABLE', 'CONSUMABLE', 'SERVICE');--> statement-breakpoint
CREATE TYPE "procurement_strategy" AS ENUM('MTS', 'MTO');--> statement-breakpoint
CREATE TYPE "procurement_type" AS ENUM('PURCHASE', 'MANUFACTURE');--> statement-breakpoint
CREATE TYPE "stock_location_type" AS ENUM('INTERNAL', 'VENDOR', 'CUSTOMER', 'PRODUCTION', 'INPUT', 'OUTPUT', 'SCRAP');--> statement-breakpoint
CREATE TYPE "stock_reservation_source_type" AS ENUM('SALES_ORDER', 'MANUFACTURING_ORDER');--> statement-breakpoint
CREATE TYPE "stock_reservation_status" AS ENUM('ACTIVE', 'PARTIALLY_CONSUMED', 'CONSUMED', 'RELEASED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "stock_movement_reference_type" AS ENUM('PURCHASE_RECEIPT', 'SALES_DELIVERY', 'MANUFACTURING_ORDER', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'SCRAP');--> statement-breakpoint
CREATE TYPE "stock_movement_type" AS ENUM('PURCHASE_RECEIPT', 'SALE_DELIVERY', 'MANUFACTURING_CONSUMPTION', 'MANUFACTURING_PRODUCTION', 'TRANSFER', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN_IN', 'RETURN_OUT', 'SCRAP');--> statement-breakpoint
CREATE TYPE "sales_order_status" AS ENUM('DRAFT', 'CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "delivery_status" AS ENUM('DRAFT', 'READY', 'DONE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "procurement_request_status" AS ENUM('PENDING', 'PROCESSING', 'PROCURED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "procurement_source_type" AS ENUM('SALES_ORDER', 'MANUFACTURING_ORDER', 'REORDER_RULE', 'MANUAL');--> statement-breakpoint
CREATE TYPE "purchase_order_status" AS ENUM('DRAFT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "receipt_status" AS ENUM('DRAFT', 'DONE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "bom_status" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "manufacturing_order_source_type" AS ENUM('SALES_ORDER', 'PROCUREMENT_REQUEST', 'MANUAL');--> statement-breakpoint
CREATE TYPE "manufacturing_order_status" AS ENUM('DRAFT', 'CONFIRMED', 'WAITING_MATERIALS', 'READY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "work_order_status" AS ENUM('PENDING', 'READY', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"customer_code" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"billing_address_line_1" text,
	"billing_address_line_2" text,
	"billing_city" text,
	"billing_state" text,
	"billing_postal_code" text,
	"billing_country" text,
	"shipping_address_line_1" text,
	"shipping_address_line_2" text,
	"shipping_city" text,
	"shipping_state" text,
	"shipping_postal_code" text,
	"shipping_country" text,
	"tax_id" text,
	"status" "customer_status" DEFAULT 'ACTIVE'::"customer_status" NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_customer_code_not_blank" CHECK (char_length(btrim("customer_code")) > 0),
	CONSTRAINT "customers_name_not_blank" CHECK (char_length(btrim("name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "units_of_measure" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" "unit_of_measure_category" NOT NULL,
	"symbol" text NOT NULL,
	"precision" smallint DEFAULT 4 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "units_of_measure_code_not_blank" CHECK (char_length(btrim("code")) > 0),
	CONSTRAINT "units_of_measure_name_not_blank" CHECK (char_length(btrim("name")) > 0),
	CONSTRAINT "units_of_measure_symbol_not_blank" CHECK (char_length(btrim("symbol")) > 0),
	CONSTRAINT "units_of_measure_precision_range" CHECK ("precision" between 0 and 4)
);
--> statement-breakpoint
CREATE TABLE "product_procurement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"strategy" "procurement_strategy" DEFAULT 'MTS'::"procurement_strategy" NOT NULL,
	"procurement_type" "procurement_type" DEFAULT 'PURCHASE'::"procurement_type" NOT NULL,
	"procure_on_demand" boolean DEFAULT false NOT NULL,
	"preferred_vendor_id" uuid,
	"default_bom_id" uuid,
	"reorder_point" numeric(18,4) DEFAULT '0' NOT NULL,
	"reorder_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"safety_stock" numeric(18,4) DEFAULT '0' NOT NULL,
	"lead_time_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_procurement_reorder_point_non_negative" CHECK ("reorder_point" >= 0),
	CONSTRAINT "product_procurement_reorder_quantity_non_negative" CHECK ("reorder_quantity" >= 0),
	CONSTRAINT "product_procurement_safety_stock_non_negative" CHECK ("safety_stock" >= 0),
	CONSTRAINT "product_procurement_lead_time_non_negative" CHECK ("lead_time_days" is null OR "lead_time_days" >= 0),
	CONSTRAINT "product_procurement_purchase_requires_vendor" CHECK ("procurement_type" <> 'PURCHASE' OR "preferred_vendor_id" is not null),
	CONSTRAINT "product_procurement_manufacture_requires_bom" CHECK ("procurement_type" <> 'MANUFACTURE' OR "default_bom_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warehouses_code_not_blank" CHECK (btrim("code") <> ''),
	CONSTRAINT "warehouses_name_not_blank" CHECK (btrim("name") <> '')
);
--> statement-breakpoint
CREATE TABLE "stock_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"warehouse_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" "stock_location_type" NOT NULL,
	"parent_location_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_locations_code_not_blank" CHECK (btrim("code") <> ''),
	CONSTRAINT "stock_locations_name_not_blank" CHECK (btrim("name") <> ''),
	CONSTRAINT "stock_locations_parent_not_self" CHECK ("parent_location_id" is null or "parent_location_id" <> "id")
);
--> statement-breakpoint
CREATE TABLE "stock_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"on_hand_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"reserved_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_balances_on_hand_non_negative" CHECK ("on_hand_quantity" >= 0),
	CONSTRAINT "stock_balances_reserved_non_negative" CHECK ("reserved_quantity" >= 0),
	CONSTRAINT "stock_balances_reserved_lte_on_hand" CHECK ("reserved_quantity" <= "on_hand_quantity")
);
--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"quantity" numeric(18,4) NOT NULL,
	"consumed_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"source_type" "stock_reservation_source_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"source_line_id" uuid,
	"status" "stock_reservation_status" DEFAULT 'ACTIVE'::"stock_reservation_status" NOT NULL,
	"reserved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"released_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_reservations_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "stock_reservations_consumed_non_negative" CHECK ("consumed_quantity" >= 0),
	CONSTRAINT "stock_reservations_consumed_lte_quantity" CHECK ("consumed_quantity" <= "quantity"),
	CONSTRAINT "stock_reservations_release_after_reserve" CHECK ("released_at" is null or "released_at" >= "reserved_at"),
	CONSTRAINT "stock_reservations_status_accounting" CHECK ((
        ("status" = 'ACTIVE' and "consumed_quantity" = 0 and "released_at" is null)
        or ("status" = 'PARTIALLY_CONSUMED' and "consumed_quantity" > 0 and "consumed_quantity" < "quantity" and "released_at" is null)
        or ("status" = 'CONSUMED' and "consumed_quantity" = "quantity" and "released_at" is null)
        or ("status" in ('RELEASED', 'CANCELLED') and "consumed_quantity" < "quantity" and "released_at" is not null)
      ))
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"movement_number" text NOT NULL,
	"idempotency_key" text,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18,4) NOT NULL,
	"from_location_id" uuid,
	"to_location_id" uuid,
	"movement_type" "stock_movement_type" NOT NULL,
	"reference_type" "stock_movement_reference_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"reference_line_id" uuid,
	"unit_cost" numeric(18,2),
	"performed_by" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_number_not_blank" CHECK (btrim("movement_number") <> ''),
	CONSTRAINT "stock_movements_idempotency_key_not_blank" CHECK ("idempotency_key" is null or btrim("idempotency_key") <> ''),
	CONSTRAINT "stock_movements_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "stock_movements_unit_cost_non_negative" CHECK ("unit_cost" is null or "unit_cost" >= 0),
	CONSTRAINT "stock_movements_endpoints_present_and_distinct" CHECK (("from_location_id" is not null or "to_location_id" is not null)
        and ("from_location_id" is null or "to_location_id" is null or "from_location_id" <> "to_location_id")),
	CONSTRAINT "stock_movements_type_has_valid_endpoint" CHECK ((
        ("movement_type" in ('PURCHASE_RECEIPT', 'MANUFACTURING_PRODUCTION', 'ADJUSTMENT_IN', 'RETURN_IN') and "to_location_id" is not null)
        or ("movement_type" in ('SALE_DELIVERY', 'MANUFACTURING_CONSUMPTION', 'ADJUSTMENT_OUT', 'RETURN_OUT', 'SCRAP') and "from_location_id" is not null)
        or ("movement_type" = 'TRANSFER' and "from_location_id" is not null and "to_location_id" is not null)
      ))
);
--> statement-breakpoint
CREATE TABLE "sales_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sales_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"ordered_quantity" numeric(18,4) NOT NULL,
	"reserved_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"delivered_quantity" numeric(18,4) DEFAULT '0' NOT NULL,
	"unit_price" numeric(18,2) NOT NULL,
	"discount_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(18,2) DEFAULT '0' NOT NULL,
	"line_total" numeric(18,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_order_lines_description_not_blank" CHECK (btrim("description") <> ''),
	CONSTRAINT "sales_order_lines_ordered_quantity_positive" CHECK ("ordered_quantity" > 0),
	CONSTRAINT "sales_order_lines_reserved_quantity_non_negative" CHECK ("reserved_quantity" >= 0),
	CONSTRAINT "sales_order_lines_delivered_quantity_non_negative" CHECK ("delivered_quantity" >= 0),
	CONSTRAINT "sales_order_lines_fulfilled_lte_ordered" CHECK ("reserved_quantity" + "delivered_quantity" <= "ordered_quantity"),
	CONSTRAINT "sales_order_lines_unit_price_non_negative" CHECK ("unit_price" >= 0),
	CONSTRAINT "sales_order_lines_discount_non_negative" CHECK ("discount_amount" >= 0),
	CONSTRAINT "sales_order_lines_tax_non_negative" CHECK ("tax_amount" >= 0),
	CONSTRAINT "sales_order_lines_total_non_negative" CHECK ("line_total" >= 0),
	CONSTRAINT "sales_order_lines_discount_lte_gross" CHECK ("discount_amount" <= round("ordered_quantity" * "unit_price", 2)),
	CONSTRAINT "sales_order_lines_total_accounting" CHECK ("line_total" = round("ordered_quantity" * "unit_price" - "discount_amount" + "tax_amount", 2))
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"delivery_number" text NOT NULL,
	"sales_order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"status" "delivery_status" DEFAULT 'DRAFT'::"delivery_status" NOT NULL,
	"scheduled_date" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"notes" text,
	"created_by" text NOT NULL,
	"completed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deliveries_number_not_blank" CHECK (btrim("delivery_number") <> ''),
	CONSTRAINT "deliveries_completion_metadata" CHECK (("status" = 'DONE' and "delivered_at" is not null and "completed_by" is not null)
        or ("status" <> 'DONE' and "delivered_at" is null and "completed_by" is null)),
	CONSTRAINT "deliveries_delivered_after_creation" CHECK ("delivered_at" is null or "delivered_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "delivery_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"delivery_id" uuid NOT NULL,
	"sales_order_line_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18,4) NOT NULL,
	"from_location_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_lines_quantity_positive" CHECK ("quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "procurement_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"request_number" text NOT NULL,
	"product_id" uuid NOT NULL,
	"requested_quantity" numeric(18,4) NOT NULL,
	"fulfilled_quantity" numeric(18,4) DEFAULT '0.0000' NOT NULL,
	"strategy" "procurement_strategy" NOT NULL,
	"procurement_type" "procurement_type" NOT NULL,
	"source_type" "procurement_source_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"source_line_id" uuid,
	"status" "procurement_request_status" DEFAULT 'PENDING'::"procurement_request_status" NOT NULL,
	"required_by_date" timestamp with time zone,
	"failure_reason" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "procurement_requests_request_number_not_blank" CHECK (char_length(btrim("request_number")) > 0),
	CONSTRAINT "procurement_requests_requested_quantity_chk" CHECK ("requested_quantity" > 0),
	CONSTRAINT "procurement_requests_fulfilled_quantity_chk" CHECK ("fulfilled_quantity" >= 0 and "fulfilled_quantity" <= "requested_quantity"),
	CONSTRAINT "procurement_requests_fulfillment_status_chk" CHECK ((
        ("status" = 'PARTIALLY_FULFILLED' and "fulfilled_quantity" > 0 and "fulfilled_quantity" < "requested_quantity")
        or ("status" = 'FULFILLED' and "fulfilled_quantity" = "requested_quantity")
        or ("status" not in ('PARTIALLY_FULFILLED', 'FULFILLED'))
      )),
	CONSTRAINT "procurement_requests_failure_reason_chk" CHECK (("status" = 'FAILED' and nullif(btrim("failure_reason"), '') is not null) or ("status" <> 'FAILED' and "failure_reason" is null)),
	CONSTRAINT "procurement_requests_completed_at_status_chk" CHECK ((
        ("status" in ('FULFILLED', 'FAILED', 'CANCELLED') and "completed_at" is not null)
        or ("status" not in ('FULFILLED', 'FAILED', 'CANCELLED') and "completed_at" is null)
      )),
	CONSTRAINT "procurement_requests_completed_at_chk" CHECK ("completed_at" is null or "completed_at" >= "created_at"),
	CONSTRAINT "procurement_requests_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"purchase_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"description" text NOT NULL,
	"ordered_quantity" numeric(18,4) NOT NULL,
	"received_quantity" numeric(18,4) DEFAULT '0.0000' NOT NULL,
	"unit_cost" numeric(18,2) NOT NULL,
	"tax_amount" numeric(18,2) DEFAULT '0.00' NOT NULL,
	"line_total" numeric(18,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_order_lines_description_not_blank" CHECK (char_length(btrim("description")) > 0),
	CONSTRAINT "purchase_order_lines_ordered_quantity_chk" CHECK ("ordered_quantity" > 0),
	CONSTRAINT "purchase_order_lines_received_quantity_chk" CHECK ("received_quantity" >= 0 and "received_quantity" <= "ordered_quantity"),
	CONSTRAINT "purchase_order_lines_unit_cost_chk" CHECK ("unit_cost" >= 0),
	CONSTRAINT "purchase_order_lines_tax_amount_chk" CHECK ("tax_amount" >= 0),
	CONSTRAINT "purchase_order_lines_line_total_chk" CHECK ("line_total" = round(("ordered_quantity" * "unit_cost") + "tax_amount", 2)),
	CONSTRAINT "purchase_order_lines_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"receipt_number" text NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"status" "receipt_status" DEFAULT 'DRAFT'::"receipt_status" NOT NULL,
	"received_at" timestamp with time zone,
	"notes" text,
	"created_by" text NOT NULL,
	"completed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receipts_receipt_number_not_blank" CHECK (char_length(btrim("receipt_number")) > 0),
	CONSTRAINT "receipts_status_received_at_chk" CHECK ((
        ("status" = 'DONE' and "received_at" is not null and "completed_by" is not null)
        or ("status" in ('DRAFT', 'CANCELLED') and "received_at" is null and "completed_by" is null)
      )),
	CONSTRAINT "receipts_received_at_chk" CHECK ("received_at" is null or "received_at" >= "created_at"),
	CONSTRAINT "receipts_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "receipt_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"receipt_id" uuid NOT NULL,
	"purchase_order_line_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18,4) NOT NULL,
	"to_location_id" uuid NOT NULL,
	"unit_cost" numeric(18,2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receipt_lines_quantity_chk" CHECK ("quantity" > 0),
	CONSTRAINT "receipt_lines_unit_cost_chk" CHECK ("unit_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "boms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"bom_number" text NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"output_quantity" numeric(18,4) DEFAULT '1.0000' NOT NULL,
	"uom_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "bom_status" DEFAULT 'DRAFT'::"bom_status" NOT NULL,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boms_bom_number_not_blank" CHECK (char_length(btrim("bom_number")) > 0),
	CONSTRAINT "boms_name_not_blank" CHECK (char_length(btrim("name")) > 0),
	CONSTRAINT "boms_output_quantity_chk" CHECK ("output_quantity" > 0),
	CONSTRAINT "boms_version_chk" CHECK ("version" > 0),
	CONSTRAINT "boms_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "work_centers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"capacity" numeric(18,4) DEFAULT '1.0000' NOT NULL,
	"cost_per_hour" numeric(18,2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_centers_code_not_blank" CHECK (char_length(btrim("code")) > 0),
	CONSTRAINT "work_centers_name_not_blank" CHECK (char_length(btrim("name")) > 0),
	CONSTRAINT "work_centers_capacity_chk" CHECK ("capacity" > 0),
	CONSTRAINT "work_centers_cost_per_hour_chk" CHECK ("cost_per_hour" is null or "cost_per_hour" >= 0),
	CONSTRAINT "work_centers_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
CREATE TABLE "manufacturing_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"manufacturing_order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"required_quantity" numeric(18,4) NOT NULL,
	"reserved_quantity" numeric(18,4) DEFAULT '0.0000' NOT NULL,
	"consumed_quantity" numeric(18,4) DEFAULT '0.0000' NOT NULL,
	"uom_id" uuid NOT NULL,
	"source_bom_component_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manufacturing_components_required_quantity_chk" CHECK ("required_quantity" > 0),
	CONSTRAINT "manufacturing_components_reserved_quantity_chk" CHECK ("reserved_quantity" >= 0 and "reserved_quantity" <= "required_quantity"),
	CONSTRAINT "manufacturing_components_consumed_quantity_chk" CHECK ("consumed_quantity" >= 0 and "consumed_quantity" <= "required_quantity"),
	CONSTRAINT "manufacturing_components_accounted_quantity_chk" CHECK ("reserved_quantity" + "consumed_quantity" <= "required_quantity"),
	CONSTRAINT "manufacturing_components_updated_at_chk" CHECK ("updated_at" >= "created_at")
);
--> statement-breakpoint
DROP TABLE "bom";--> statement-breakpoint
DROP TABLE "sales_order_items";--> statement-breakpoint
DROP TABLE "purchase_order_items";--> statement-breakpoint
DROP TABLE "stock_ledger";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_sku_key";--> statement-breakpoint
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_order_number_key";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_order_number_key";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" DROP CONSTRAINT "manufacturing_orders_order_number_key";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "vendor_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "tax_id" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "lead_time_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "payment_terms" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "status" "vendor_status" DEFAULT 'ACTIVE'::"vendor_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type" "product_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "uom_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "track_inventory" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "customer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "order_date" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "expected_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "currency_code" varchar(3) DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "subtotal" numeric(18,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "discount_total" numeric(18,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "tax_total" numeric(18,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "grand_total" numeric(18,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD COLUMN "confirmed_by" text;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "order_date" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "expected_receipt_date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "currency_code" varchar(3) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "subtotal" numeric(18,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "tax_total" numeric(18,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "grand_total" numeric(18,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "procurement_request_id" uuid;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "confirmed_by" text;--> statement-breakpoint
ALTER TABLE "bom_components" ADD COLUMN "uom_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_components" ADD COLUMN "sequence" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_components" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "bom_components" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_components" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "work_center_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "sequence" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "expected_duration_minutes" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "planned_quantity" numeric(18,4) NOT NULL;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "produced_quantity" numeric(18,4) DEFAULT '0.0000' NOT NULL;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "source_type" "manufacturing_order_source_type";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "warehouse_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "planned_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "planned_end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "actual_start_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "actual_end_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "assignee_id" text;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "procurement_request_id" uuid;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "work_order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "work_center_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "sequence" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "planned_duration_minutes" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "actual_duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "assignee_id" text;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "actor_id" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "before_data" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "after_data" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ip_address" inet;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "vendors" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "on_hand_qty";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "reserved_qty";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "procurement_strategy";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "procurement_type";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "procure_on_demand";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "vendor_id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "bom_id";--> statement-breakpoint
ALTER TABLE "sales_orders" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "sales_orders" DROP COLUMN "customer_email";--> statement-breakpoint
ALTER TABLE "sales_orders" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP COLUMN "vendor_name";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP COLUMN "total_amount";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP COLUMN "triggered_from_so_id";--> statement-breakpoint
ALTER TABLE "bom_operations" DROP COLUMN "work_center";--> statement-breakpoint
ALTER TABLE "bom_operations" DROP COLUMN "duration_minutes";--> statement-breakpoint
ALTER TABLE "bom_operations" DROP COLUMN "step_order";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" DROP COLUMN "target_qty";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" DROP COLUMN "produced_qty";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" DROP COLUMN "assignee";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" DROP COLUMN "triggered_from_so_id";--> statement-breakpoint
ALTER TABLE "work_orders" DROP COLUMN "work_center";--> statement-breakpoint
ALTER TABLE "work_orders" DROP COLUMN "duration_minutes";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "details";--> statement-breakpoint
ALTER TABLE "audit_logs" DROP COLUMN "user_name";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp with time zone USING "access_token_expires_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp with time zone USING "refresh_token_expires_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone USING "expires_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'sales';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone USING "expires_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sales_price" SET DATA TYPE numeric(18,2) USING "sales_price"::numeric(18,2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sales_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "cost_price" SET DATA TYPE numeric(18,2) USING "cost_price"::numeric(18,2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "cost_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bom_components" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "bom_components" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bom_components" ALTER COLUMN "bom_id" SET DATA TYPE uuid USING "bom_id"::uuid;--> statement-breakpoint
ALTER TABLE "bom_components" ALTER COLUMN "component_product_id" SET DATA TYPE uuid USING "component_product_id"::uuid;--> statement-breakpoint
ALTER TABLE "bom_components" ALTER COLUMN "quantity" SET DATA TYPE numeric(18,4) USING "quantity"::numeric(18,4);--> statement-breakpoint
ALTER TABLE "bom_operations" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "bom_operations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bom_operations" ALTER COLUMN "bom_id" SET DATA TYPE uuid USING "bom_id"::uuid;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DATA TYPE "sales_order_status" USING "status"::"sales_order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"sales_order_status";--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sales_orders" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "vendor_id" SET DATA TYPE uuid USING "vendor_id"::uuid;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "vendor_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DATA TYPE "purchase_order_status" USING "status"::"purchase_order_status";--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"purchase_order_status";--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "purchase_orders" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "product_id" SET DATA TYPE uuid USING "product_id"::uuid;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "bom_id" SET DATA TYPE uuid USING "bom_id"::uuid;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" SET DATA TYPE "manufacturing_order_status" USING "status"::"manufacturing_order_status";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"manufacturing_order_status";--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "manufacturing_order_id" SET DATA TYPE uuid USING "manufacturing_order_id"::uuid;--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "status" SET DATA TYPE "work_order_status" USING "status"::"work_order_status";--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"work_order_status";--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "completed_at" SET DATA TYPE timestamp with time zone USING "completed_at"::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at"::timestamp with time zone;--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "user" ("role");--> statement-breakpoint
CREATE INDEX "user_banned_idx" ON "user" ("banned");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "session_impersonated_by_idx" ON "session" ("impersonated_by");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" ("expires_at");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_uidx" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_customer_code_uidx" ON "customers" ("customer_code");--> statement-breakpoint
CREATE INDEX "customers_name_idx" ON "customers" ("name");--> statement-breakpoint
CREATE INDEX "customers_status_name_idx" ON "customers" ("status","name");--> statement-breakpoint
CREATE INDEX "customers_created_by_idx" ON "customers" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_vendor_code_uidx" ON "vendors" ("vendor_code");--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" ("name");--> statement-breakpoint
CREATE INDEX "vendors_status_name_idx" ON "vendors" ("status","name");--> statement-breakpoint
CREATE INDEX "vendors_created_by_idx" ON "vendors" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "units_of_measure_code_uidx" ON "units_of_measure" ("code");--> statement-breakpoint
CREATE INDEX "units_of_measure_name_idx" ON "units_of_measure" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_uidx" ON "products" ("sku");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" ("name");--> statement-breakpoint
CREATE INDEX "products_uom_id_idx" ON "products" ("uom_id");--> statement-breakpoint
CREATE INDEX "products_created_by_idx" ON "products" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "product_procurement_product_id_uidx" ON "product_procurement" ("product_id");--> statement-breakpoint
CREATE INDEX "product_procurement_vendor_id_idx" ON "product_procurement" ("preferred_vendor_id");--> statement-breakpoint
CREATE INDEX "product_procurement_bom_id_idx" ON "product_procurement" ("default_bom_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_code_uidx" ON "warehouses" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_locations_warehouse_code_uidx" ON "stock_locations" ("warehouse_id","code");--> statement-breakpoint
CREATE INDEX "stock_locations_parent_location_id_idx" ON "stock_locations" ("parent_location_id");--> statement-breakpoint
CREATE INDEX "stock_locations_warehouse_type_active_idx" ON "stock_locations" ("warehouse_id","type","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_balances_product_location_uidx" ON "stock_balances" ("product_id","location_id");--> statement-breakpoint
CREATE INDEX "stock_balances_location_product_idx" ON "stock_balances" ("location_id","product_id");--> statement-breakpoint
CREATE INDEX "stock_reservations_product_location_status_idx" ON "stock_reservations" ("product_id","location_id","status");--> statement-breakpoint
CREATE INDEX "stock_reservations_location_status_idx" ON "stock_reservations" ("location_id","status");--> statement-breakpoint
CREATE INDEX "stock_reservations_source_status_idx" ON "stock_reservations" ("source_type","source_id","status");--> statement-breakpoint
CREATE INDEX "stock_reservations_source_line_id_idx" ON "stock_reservations" ("source_line_id");--> statement-breakpoint
CREATE INDEX "stock_reservations_created_by_idx" ON "stock_reservations" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_movements_movement_number_uidx" ON "stock_movements" ("movement_number");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_movements_idempotency_key_uidx" ON "stock_movements" ("idempotency_key");--> statement-breakpoint
CREATE INDEX "stock_movements_product_occurred_at_idx" ON "stock_movements" ("product_id","occurred_at");--> statement-breakpoint
CREATE INDEX "stock_movements_reference_idx" ON "stock_movements" ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "stock_movements_from_location_occurred_at_idx" ON "stock_movements" ("from_location_id","occurred_at");--> statement-breakpoint
CREATE INDEX "stock_movements_to_location_occurred_at_idx" ON "stock_movements" ("to_location_id","occurred_at");--> statement-breakpoint
CREATE INDEX "stock_movements_performed_by_idx" ON "stock_movements" ("performed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_orders_order_number_uidx" ON "sales_orders" ("order_number");--> statement-breakpoint
CREATE INDEX "sales_orders_customer_order_date_idx" ON "sales_orders" ("customer_id","order_date");--> statement-breakpoint
CREATE INDEX "sales_orders_status_order_date_idx" ON "sales_orders" ("status","order_date");--> statement-breakpoint
CREATE INDEX "sales_orders_expected_delivery_date_idx" ON "sales_orders" ("expected_delivery_date");--> statement-breakpoint
CREATE INDEX "sales_orders_created_by_idx" ON "sales_orders" ("created_by");--> statement-breakpoint
CREATE INDEX "sales_orders_confirmed_by_idx" ON "sales_orders" ("confirmed_by");--> statement-breakpoint
CREATE INDEX "sales_order_lines_order_product_idx" ON "sales_order_lines" ("sales_order_id","product_id");--> statement-breakpoint
CREATE INDEX "sales_order_lines_product_id_idx" ON "sales_order_lines" ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "deliveries_delivery_number_uidx" ON "deliveries" ("delivery_number");--> statement-breakpoint
CREATE INDEX "deliveries_sales_order_status_idx" ON "deliveries" ("sales_order_id","status");--> statement-breakpoint
CREATE INDEX "deliveries_warehouse_status_idx" ON "deliveries" ("warehouse_id","status");--> statement-breakpoint
CREATE INDEX "deliveries_status_scheduled_date_idx" ON "deliveries" ("status","scheduled_date");--> statement-breakpoint
CREATE INDEX "deliveries_created_by_idx" ON "deliveries" ("created_by");--> statement-breakpoint
CREATE INDEX "deliveries_completed_by_idx" ON "deliveries" ("completed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "delivery_lines_delivery_order_line_uidx" ON "delivery_lines" ("delivery_id","sales_order_line_id");--> statement-breakpoint
CREATE INDEX "delivery_lines_sales_order_line_id_idx" ON "delivery_lines" ("sales_order_line_id");--> statement-breakpoint
CREATE INDEX "delivery_lines_product_id_idx" ON "delivery_lines" ("product_id");--> statement-breakpoint
CREATE INDEX "delivery_lines_from_location_id_idx" ON "delivery_lines" ("from_location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "procurement_requests_request_number_uidx" ON "procurement_requests" ("request_number");--> statement-breakpoint
CREATE INDEX "procurement_requests_product_id_idx" ON "procurement_requests" ("product_id");--> statement-breakpoint
CREATE INDEX "procurement_requests_status_required_by_date_idx" ON "procurement_requests" ("status","required_by_date");--> statement-breakpoint
CREATE INDEX "procurement_requests_source_idx" ON "procurement_requests" ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "procurement_requests_type_status_idx" ON "procurement_requests" ("procurement_type","status");--> statement-breakpoint
CREATE INDEX "procurement_requests_required_by_date_idx" ON "procurement_requests" ("required_by_date");--> statement-breakpoint
CREATE INDEX "procurement_requests_created_by_idx" ON "procurement_requests" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_order_number_uidx" ON "purchase_orders" ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_procurement_request_id_uidx" ON "purchase_orders" ("procurement_request_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_vendor_id_idx" ON "purchase_orders" ("vendor_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_status_order_date_idx" ON "purchase_orders" ("status","order_date");--> statement-breakpoint
CREATE INDEX "purchase_orders_created_by_idx" ON "purchase_orders" ("created_by");--> statement-breakpoint
CREATE INDEX "purchase_orders_confirmed_by_idx" ON "purchase_orders" ("confirmed_by");--> statement-breakpoint
CREATE INDEX "purchase_order_lines_purchase_order_id_idx" ON "purchase_order_lines" ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "purchase_order_lines_product_id_idx" ON "purchase_order_lines" ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "receipts_receipt_number_uidx" ON "receipts" ("receipt_number");--> statement-breakpoint
CREATE INDEX "receipts_purchase_order_status_idx" ON "receipts" ("purchase_order_id","status");--> statement-breakpoint
CREATE INDEX "receipts_warehouse_id_idx" ON "receipts" ("warehouse_id");--> statement-breakpoint
CREATE INDEX "receipts_status_idx" ON "receipts" ("status");--> statement-breakpoint
CREATE INDEX "receipts_received_at_idx" ON "receipts" ("received_at");--> statement-breakpoint
CREATE INDEX "receipts_created_by_idx" ON "receipts" ("created_by");--> statement-breakpoint
CREATE INDEX "receipts_completed_by_idx" ON "receipts" ("completed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "receipt_lines_receipt_order_line_uidx" ON "receipt_lines" ("receipt_id","purchase_order_line_id");--> statement-breakpoint
CREATE INDEX "receipt_lines_purchase_order_line_id_idx" ON "receipt_lines" ("purchase_order_line_id");--> statement-breakpoint
CREATE INDEX "receipt_lines_product_id_idx" ON "receipt_lines" ("product_id");--> statement-breakpoint
CREATE INDEX "receipt_lines_to_location_id_idx" ON "receipt_lines" ("to_location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "boms_bom_number_uidx" ON "boms" ("bom_number");--> statement-breakpoint
CREATE UNIQUE INDEX "boms_product_version_uidx" ON "boms" ("product_id","version");--> statement-breakpoint
CREATE INDEX "boms_product_id_idx" ON "boms" ("product_id");--> statement-breakpoint
CREATE INDEX "boms_uom_id_idx" ON "boms" ("uom_id");--> statement-breakpoint
CREATE INDEX "boms_status_idx" ON "boms" ("status");--> statement-breakpoint
CREATE INDEX "boms_created_by_idx" ON "boms" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "bom_components_bom_sequence_uidx" ON "bom_components" ("bom_id","sequence");--> statement-breakpoint
CREATE INDEX "bom_components_bom_id_idx" ON "bom_components" ("bom_id");--> statement-breakpoint
CREATE INDEX "bom_components_component_product_id_idx" ON "bom_components" ("component_product_id");--> statement-breakpoint
CREATE INDEX "bom_components_uom_id_idx" ON "bom_components" ("uom_id");--> statement-breakpoint
CREATE UNIQUE INDEX "work_centers_code_uidx" ON "work_centers" ("code");--> statement-breakpoint
CREATE INDEX "work_centers_name_idx" ON "work_centers" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "bom_operations_bom_sequence_uidx" ON "bom_operations" ("bom_id","sequence");--> statement-breakpoint
CREATE INDEX "bom_operations_bom_id_idx" ON "bom_operations" ("bom_id");--> statement-breakpoint
CREATE INDEX "bom_operations_work_center_id_idx" ON "bom_operations" ("work_center_id");--> statement-breakpoint
CREATE UNIQUE INDEX "manufacturing_orders_order_number_uidx" ON "manufacturing_orders" ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "manufacturing_orders_procurement_request_id_uidx" ON "manufacturing_orders" ("procurement_request_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_product_id_idx" ON "manufacturing_orders" ("product_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_bom_id_idx" ON "manufacturing_orders" ("bom_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_warehouse_id_idx" ON "manufacturing_orders" ("warehouse_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_status_planned_start_at_idx" ON "manufacturing_orders" ("status","planned_start_at");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_source_idx" ON "manufacturing_orders" ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_planned_start_at_idx" ON "manufacturing_orders" ("planned_start_at");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_assignee_id_idx" ON "manufacturing_orders" ("assignee_id");--> statement-breakpoint
CREATE INDEX "manufacturing_orders_created_by_idx" ON "manufacturing_orders" ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "manufacturing_components_order_source_uidx" ON "manufacturing_components" ("manufacturing_order_id","source_bom_component_id");--> statement-breakpoint
CREATE INDEX "manufacturing_components_order_id_idx" ON "manufacturing_components" ("manufacturing_order_id");--> statement-breakpoint
CREATE INDEX "manufacturing_components_product_id_idx" ON "manufacturing_components" ("product_id");--> statement-breakpoint
CREATE INDEX "manufacturing_components_uom_id_idx" ON "manufacturing_components" ("uom_id");--> statement-breakpoint
CREATE INDEX "manufacturing_components_source_bom_component_id_idx" ON "manufacturing_components" ("source_bom_component_id");--> statement-breakpoint
CREATE UNIQUE INDEX "work_orders_work_order_number_uidx" ON "work_orders" ("work_order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "work_orders_order_sequence_uidx" ON "work_orders" ("manufacturing_order_id","sequence");--> statement-breakpoint
CREATE INDEX "work_orders_manufacturing_order_id_idx" ON "work_orders" ("manufacturing_order_id");--> statement-breakpoint
CREATE INDEX "work_orders_work_center_id_idx" ON "work_orders" ("work_center_id");--> statement-breakpoint
CREATE INDEX "work_orders_status_idx" ON "work_orders" ("status");--> statement-breakpoint
CREATE INDEX "work_orders_assignee_id_idx" ON "work_orders" ("assignee_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs" ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_user_id_fkey" FOREIGN KEY ("impersonated_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_uom_id_units_of_measure_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "product_procurement" ADD CONSTRAINT "product_procurement_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_procurement" ADD CONSTRAINT "product_procurement_preferred_vendor_id_vendors_id_fkey" FOREIGN KEY ("preferred_vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "product_procurement" ADD CONSTRAINT "product_procurement_default_bom_id_boms_id_fkey" FOREIGN KEY ("default_bom_id") REFERENCES "boms"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_locations" ADD CONSTRAINT "stock_locations_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_locations" ADD CONSTRAINT "stock_locations_parent_location_id_stock_locations_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_location_id_stock_locations_id_fkey" FOREIGN KEY ("location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_location_id_stock_locations_id_fkey" FOREIGN KEY ("location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_from_location_id_stock_locations_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_to_location_id_stock_locations_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_user_id_fkey" FOREIGN KEY ("performed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_confirmed_by_user_id_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_sales_order_id_sales_orders_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_sales_order_id_sales_orders_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_completed_by_user_id_fkey" FOREIGN KEY ("completed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_delivery_id_deliveries_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_sales_order_line_id_sales_order_lines_id_fkey" FOREIGN KEY ("sales_order_line_id") REFERENCES "sales_order_lines"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "delivery_lines" ADD CONSTRAINT "delivery_lines_from_location_id_stock_locations_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_U8iXkjKGdhmY_fkey" FOREIGN KEY ("procurement_request_id") REFERENCES "procurement_requests"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_confirmed_by_user_id_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_purchase_orders_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_purchase_order_id_purchase_orders_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_completed_by_user_id_fkey" FOREIGN KEY ("completed_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_receipt_id_receipts_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_SfD2MpGsDnuv_fkey" FOREIGN KEY ("purchase_order_line_id") REFERENCES "purchase_order_lines"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_to_location_id_stock_locations_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "stock_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_uom_id_units_of_measure_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_bom_id_boms_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "boms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_component_product_id_products_id_fkey" FOREIGN KEY ("component_product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_uom_id_units_of_measure_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_bom_id_boms_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "boms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_work_center_id_work_centers_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "work_centers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_bom_id_boms_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "boms"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_v0mO8YNY5DTD_fkey" FOREIGN KEY ("procurement_request_id") REFERENCES "procurement_requests"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_components" ADD CONSTRAINT "manufacturing_components_nYBM4Ldi9w7A_fkey" FOREIGN KEY ("manufacturing_order_id") REFERENCES "manufacturing_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "manufacturing_components" ADD CONSTRAINT "manufacturing_components_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_components" ADD CONSTRAINT "manufacturing_components_uom_id_units_of_measure_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "manufacturing_components" ADD CONSTRAINT "manufacturing_components_X9kNfatAEuGM_fkey" FOREIGN KEY ("source_bom_component_id") REFERENCES "bom_components"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_manufacturing_order_id_manufacturing_orders_id_fkey" FOREIGN KEY ("manufacturing_order_id") REFERENCES "manufacturing_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_work_center_id_work_centers_id_fkey" FOREIGN KEY ("work_center_id") REFERENCES "work_centers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_vendor_code_not_blank" CHECK (char_length(btrim("vendor_code")) > 0);--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_name_not_blank" CHECK (char_length(btrim("name")) > 0);--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_lead_time_non_negative" CHECK ("lead_time_days" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sku_not_blank" CHECK (char_length(btrim("sku")) > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_name_not_blank" CHECK (char_length(btrim("name")) > 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_sales_price_non_negative" CHECK ("sales_price" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_cost_price_non_negative" CHECK ("cost_price" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_service_not_inventory_tracked" CHECK ("product_type" <> 'SERVICE' OR NOT "track_inventory");--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_number_not_blank" CHECK (btrim("order_number") <> '');--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_currency_code_format" CHECK ("currency_code" ~ '^[A-Z]{3}$');--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_subtotal_non_negative" CHECK ("subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_discount_non_negative" CHECK ("discount_total" >= 0);--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_tax_non_negative" CHECK ("tax_total" >= 0);--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_grand_total_non_negative" CHECK ("grand_total" >= 0);--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_discount_lte_subtotal" CHECK ("discount_total" <= "subtotal");--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_total_accounting" CHECK ("grand_total" = "subtotal" - "discount_total" + "tax_total");--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_expected_delivery_after_order" CHECK ("expected_delivery_date" is null or "expected_delivery_date" >= "order_date");--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_confirmation_metadata" CHECK ((
        ("status" in ('CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED') and "confirmed_at" is not null and "confirmed_by" is not null)
        or ("status" = 'DRAFT' and "confirmed_at" is null and "confirmed_by" is null)
        or ("status" = 'CANCELLED' and (("confirmed_at" is null and "confirmed_by" is null) or ("confirmed_at" is not null and "confirmed_by" is not null)))
      ));--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_confirmed_after_order" CHECK ("confirmed_at" is null or "confirmed_at" >= "order_date");--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_cancellation_metadata" CHECK (("status" = 'CANCELLED' and "cancelled_at" is not null)
        or ("status" <> 'CANCELLED' and "cancelled_at" is null));--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_cancelled_after_order" CHECK ("cancelled_at" is null or "cancelled_at" >= "order_date");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_currency_code_chk" CHECK ("currency_code" ~ '^[A-Z]{3}$');--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_order_number_not_blank" CHECK (char_length(btrim("order_number")) > 0);--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_subtotal_non_negative_chk" CHECK ("subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tax_total_non_negative_chk" CHECK ("tax_total" >= 0);--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_grand_total_chk" CHECK ("grand_total" = "subtotal" + "tax_total");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_expected_receipt_date_chk" CHECK ("expected_receipt_date" >= "order_date");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_confirmed_at_chk" CHECK ("confirmed_at" is null or "confirmed_at" >= "order_date");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_cancelled_at_chk" CHECK ("cancelled_at" is null or "cancelled_at" >= "order_date");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_event_order_chk" CHECK ("cancelled_at" is null or "confirmed_at" is null or "cancelled_at" >= "confirmed_at");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_confirmation_metadata_chk" CHECK ((
        ("status" in ('CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED') and "confirmed_at" is not null and "confirmed_by" is not null)
        or ("status" = 'DRAFT' and "confirmed_at" is null and "confirmed_by" is null)
        or ("status" = 'CANCELLED' and (("confirmed_at" is null and "confirmed_by" is null) or ("confirmed_at" is not null and "confirmed_by" is not null)))
      ));--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_status_timestamps_chk" CHECK ((
        ("status" = 'DRAFT' and "confirmed_at" is null and "cancelled_at" is null)
        or ("status" in ('CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED') and "confirmed_at" is not null and "cancelled_at" is null)
        or ("status" = 'CANCELLED' and "cancelled_at" is not null)
      ));--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_updated_at_chk" CHECK ("updated_at" >= "created_at");--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_quantity_chk" CHECK ("quantity" > 0);--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_sequence_chk" CHECK ("sequence" > 0);--> statement-breakpoint
ALTER TABLE "bom_components" ADD CONSTRAINT "bom_components_updated_at_chk" CHECK ("updated_at" >= "created_at");--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_name_not_blank" CHECK (char_length(btrim("name")) > 0);--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_sequence_chk" CHECK ("sequence" > 0);--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_expected_duration_chk" CHECK ("expected_duration_minutes" > 0);--> statement-breakpoint
ALTER TABLE "bom_operations" ADD CONSTRAINT "bom_operations_updated_at_chk" CHECK ("updated_at" >= "created_at");--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_order_number_not_blank" CHECK (char_length(btrim("order_number")) > 0);--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_planned_quantity_chk" CHECK ("planned_quantity" > 0);--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_produced_quantity_chk" CHECK ("produced_quantity" >= 0 and "produced_quantity" <= "planned_quantity");--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_source_reference_chk" CHECK (("source_type" is null and "source_id" is null) or ("source_type" is not null and "source_id" is not null));--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_planned_dates_chk" CHECK ("planned_start_at" is null or "planned_end_at" is null or "planned_end_at" >= "planned_start_at");--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_actual_dates_chk" CHECK (("actual_end_at" is null or "actual_start_at" is not null) and ("actual_end_at" is null or "actual_end_at" >= "actual_start_at"));--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_status_timestamps_chk" CHECK ((
        ("status" in ('DRAFT', 'CONFIRMED', 'WAITING_MATERIALS', 'READY') and "actual_start_at" is null and "actual_end_at" is null)
        or ("status" = 'IN_PROGRESS' and "actual_start_at" is not null and "actual_end_at" is null)
        or ("status" = 'COMPLETED' and "actual_start_at" is not null and "actual_end_at" is not null and "produced_quantity" > 0)
        or ("status" = 'CANCELLED')
      ));--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_updated_at_chk" CHECK ("updated_at" >= "created_at");--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_work_order_number_not_blank" CHECK (char_length(btrim("work_order_number")) > 0);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_name_not_blank" CHECK (char_length(btrim("name")) > 0);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_sequence_chk" CHECK ("sequence" > 0);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_planned_duration_chk" CHECK ("planned_duration_minutes" > 0);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_actual_duration_chk" CHECK ("actual_duration_minutes" is null or "actual_duration_minutes" >= 0);--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_dates_chk" CHECK (("completed_at" is null or "started_at" is not null) and ("completed_at" is null or "completed_at" >= "started_at"));--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_status_timestamps_chk" CHECK ((
        ("status" in ('PENDING', 'READY') and "started_at" is null and "completed_at" is null and "actual_duration_minutes" is null)
        or ("status" in ('IN_PROGRESS', 'PAUSED') and "started_at" is not null and "completed_at" is null)
        or ("status" = 'COMPLETED' and "started_at" is not null and "completed_at" is not null and "actual_duration_minutes" is not null)
        or ("status" = 'CANCELLED' and "completed_at" is null)
      ));--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_updated_at_chk" CHECK ("updated_at" >= "created_at");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_entity_type_chk" CHECK (nullif(btrim("entity_type"), '') is not null);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_entity_id_chk" CHECK (nullif(btrim("entity_id"), '') is not null);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_action_chk" CHECK (nullif(btrim("action"), '') is not null);--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_before_data_chk" CHECK ("before_data" is null or jsonb_typeof("before_data") = 'object');--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_after_data_chk" CHECK ("after_data" is null or jsonb_typeof("after_data") = 'object');--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_metadata_chk" CHECK ("metadata" is null or jsonb_typeof("metadata") = 'object');
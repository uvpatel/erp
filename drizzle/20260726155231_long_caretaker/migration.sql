CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"sku" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"sales_price" numeric NOT NULL,
	"cost_price" numeric NOT NULL,
	"on_hand_qty" integer DEFAULT 0 NOT NULL,
	"reserved_qty" integer DEFAULT 0 NOT NULL,
	"procurement_strategy" text DEFAULT 'MTS' NOT NULL,
	"procurement_type" text DEFAULT 'Manufacturing' NOT NULL,
	"procure_on_demand" boolean DEFAULT false NOT NULL,
	"vendor_id" text,
	"bom_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"product_id" text NOT NULL,
	"output_qty" integer DEFAULT 1 NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_components" (
	"id" text PRIMARY KEY,
	"bom_id" text NOT NULL,
	"component_product_id" text NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_operations" (
	"id" text PRIMARY KEY,
	"bom_id" text NOT NULL,
	"name" text NOT NULL,
	"work_center" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"step_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" text PRIMARY KEY,
	"sales_order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"ordered_qty" integer NOT NULL,
	"delivered_qty" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"total_amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" text PRIMARY KEY,
	"purchase_order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"ordered_qty" integer NOT NULL,
	"received_qty" integer DEFAULT 0 NOT NULL,
	"unit_cost" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"vendor_name" text NOT NULL,
	"vendor_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"total_amount" numeric NOT NULL,
	"triggered_from_so_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturing_orders" (
	"id" text PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"product_id" text NOT NULL,
	"bom_id" text NOT NULL,
	"target_qty" integer NOT NULL,
	"produced_qty" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"assignee" text,
	"triggered_from_so_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" text PRIMARY KEY,
	"manufacturing_order_id" text NOT NULL,
	"name" text NOT NULL,
	"work_center" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"details" text NOT NULL,
	"user_name" text DEFAULT 'System' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_ledger" (
	"id" text PRIMARY KEY,
	"product_id" text NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" text NOT NULL,
	"change_qty" integer NOT NULL,
	"resulting_on_hand" integer NOT NULL,
	"resulting_reserved" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text DEFAULT 'System' NOT NULL
);
--> statement-breakpoint
DROP TABLE "users";--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
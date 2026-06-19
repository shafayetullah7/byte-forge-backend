ALTER TYPE "public"."order_status_enum" ADD VALUE 'COMPLETED' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "buyer_delivery_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "shipping_method" varchar(50);
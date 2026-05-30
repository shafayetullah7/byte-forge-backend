CREATE TYPE "public"."product_media_type_enum" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type_enum" AS ENUM('COD', 'CARD', 'BKASH', 'NAGAD', 'SSLCOMMERCE');--> statement-breakpoint
CREATE TYPE "public"."address_type_enum" AS ENUM('shipping', 'billing', 'both');--> statement-breakpoint
ALTER TABLE "shipping_addresses" RENAME TO "user_addresses";--> statement-breakpoint
ALTER TABLE "user_addresses" DROP CONSTRAINT "shipping_addresses_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "shipping_addresses_user_id_idx";--> statement-breakpoint
DROP INDEX "shipping_addresses_is_default_idx";--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "type" SET DEFAULT 'image'::"public"."product_media_type_enum";--> statement-breakpoint
ALTER TABLE "product_media" ALTER COLUMN "type" SET DATA TYPE "public"."product_media_type_enum" USING "type"::"public"."product_media_type_enum";--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "type" SET DATA TYPE "public"."payment_method_type_enum" USING "type"::"public"."payment_method_type_enum";--> statement-breakpoint
ALTER TABLE "shipment_status_history" ALTER COLUMN "status" SET DATA TYPE "public"."shipping_status_enum" USING "status"::"public"."shipping_status_enum";--> statement-breakpoint
ALTER TABLE "order_addresses" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "type" "address_type_enum" DEFAULT 'shipping' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "gstin" varchar(20);--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "delivery_instructions" text;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "billing_notes" text;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_addresses_type_idx" ON "user_addresses" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "user_addresses_is_default_idx" ON "user_addresses" USING btree ("user_id","is_default");
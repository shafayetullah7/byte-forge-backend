ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."product_status_enum";--> statement-breakpoint
CREATE TYPE "public"."product_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."product_status_enum";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE "public"."product_status_enum" USING "status"::"public"."product_status_enum";
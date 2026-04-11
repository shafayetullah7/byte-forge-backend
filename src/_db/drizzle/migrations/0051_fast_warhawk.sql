ALTER TABLE "shop_translations" RENAME COLUMN "shop_name" TO "name";--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."shop_status_enum";--> statement-breakpoint
CREATE TYPE "public"."shop_status_enum" AS ENUM('DRAFT', 'PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'INACTIVE', 'REJECTED', 'SUSPENDED', 'DELETED');--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."shop_status_enum";--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DATA TYPE "public"."shop_status_enum" USING "status"::"public"."shop_status_enum";--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "business_hours" text;--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "about";--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "brand_story";--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "featured_highlight";
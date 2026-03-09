CREATE TYPE "public"."shop_status_enum" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');--> statement-breakpoint
CREATE TABLE "shop_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"shop_name" varchar(255) NOT NULL,
	"about" text,
	"brand_story" text,
	"featured_highlight" text,
	CONSTRAINT "shop_translations_shop_id_locale_unique" UNIQUE("shop_id","locale")
);
--> statement-breakpoint
ALTER TABLE "business_account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "business_account_verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "business_account" CASCADE;--> statement-breakpoint
DROP TABLE "business_account_verification" CASCADE;--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "business_account_id_shop_name_unique";--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_business_account_id_business_account_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_verification" ALTER COLUMN "trade_license_document" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "shop_verification" ALTER COLUMN "utility_bill_document" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "address" varchar(500);--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "status" "shop_status_enum" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "primary_color" varchar(7);--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "secondary_color" varchar(7);--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "accent_color" varchar(7);--> statement-breakpoint
ALTER TABLE "shop_verification" ADD COLUMN "tin_number" varchar(100);--> statement-breakpoint
ALTER TABLE "shop_verification" ADD COLUMN "tin_document" uuid;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD CONSTRAINT "shop_translations_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD CONSTRAINT "shop_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_trade_license_document_media_id_fk" FOREIGN KEY ("trade_license_document") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_tin_document_media_id_fk" FOREIGN KEY ("tin_document") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_utility_bill_document_media_id_fk" FOREIGN KEY ("utility_bill_document") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "business_account_id";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "shop_name";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "about";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "eestablish_dates";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "business_type";--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_unique" UNIQUE("owner_id");--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_slug_unique" UNIQUE("slug");--> statement-breakpoint
DROP TYPE "public"."business_account_verification_status_enum";--> statement-breakpoint
DROP TYPE "public"."business_verification_status_enum";
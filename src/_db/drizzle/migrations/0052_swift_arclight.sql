ALTER TABLE "shop_address_translations" ALTER COLUMN "country" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ALTER COLUMN "division" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ALTER COLUMN "district" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ALTER COLUMN "street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_address" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "shop_address" DROP COLUMN "division";--> statement-breakpoint
ALTER TABLE "shop_address" DROP COLUMN "district";--> statement-breakpoint
ALTER TABLE "shop_address" DROP COLUMN "street";
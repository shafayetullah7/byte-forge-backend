ALTER TABLE "shop_verification" RENAME COLUMN "trade_license_document" TO "trade_license_document_id";--> statement-breakpoint
ALTER TABLE "shop_verification" RENAME COLUMN "tin_document" TO "tin_document_id";--> statement-breakpoint
ALTER TABLE "shop_verification" RENAME COLUMN "utility_bill_document" TO "utility_bill_document_id";--> statement-breakpoint
ALTER TABLE "shop_verification" DROP CONSTRAINT "shop_verification_trade_license_document_media_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_verification" DROP CONSTRAINT "shop_verification_tin_document_media_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_verification" DROP CONSTRAINT "shop_verification_utility_bill_document_media_id_fk";
--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_trade_license_document_id_media_id_fk" FOREIGN KEY ("trade_license_document_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_tin_document_id_media_id_fk" FOREIGN KEY ("tin_document_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_utility_bill_document_id_media_id_fk" FOREIGN KEY ("utility_bill_document_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
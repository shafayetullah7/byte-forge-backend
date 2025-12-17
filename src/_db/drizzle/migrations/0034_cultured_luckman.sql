ALTER TABLE "shops" RENAME COLUMN "logo" TO "logo_id";--> statement-breakpoint
ALTER TABLE "shops" RENAME COLUMN "banner" TO "banner_id";--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_logo_media_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_banner_media_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
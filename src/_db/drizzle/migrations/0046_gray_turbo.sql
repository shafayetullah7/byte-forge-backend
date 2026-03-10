CREATE TABLE "plant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"short_description" text
);
--> statement-breakpoint
ALTER TABLE "user_local_auth_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admin_local_auth_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_pricing" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_inventory" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_local_auth_session" CASCADE;--> statement-breakpoint
DROP TABLE "admin_local_auth_session" CASCADE;--> statement-breakpoint
DROP TABLE "plant_pricing" CASCADE;--> statement-breakpoint
DROP TABLE "plant_inventory" CASCADE;--> statement-breakpoint
ALTER TABLE "plants" DROP CONSTRAINT "plants_main_image_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "plant_media" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "pot_size" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "plant_height" integer;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "growth_stage" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "propagation_type" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "plant_form" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "variegation" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "container_type" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "bundle_type" varchar(50);--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "sale_price" integer;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "cost_price" integer;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "track_quantity" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD COLUMN "low_stock_alert" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "plant_translations" ADD CONSTRAINT "plant_translations_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "plant_locale_idx" ON "plant_translations" USING btree ("plant_id","locale");--> statement-breakpoint
ALTER TABLE "plant_media" ADD CONSTRAINT "plant_media_variant_id_plant_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."plant_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "short_description";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "main_image_id";
CREATE TABLE "plant_details_tags" (
	"plant_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "plant_details_tags_plant_id_tag_id_pk" PRIMARY KEY("plant_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_categories_id_fk";
--> statement-breakpoint
DROP INDEX "products_category_id_idx";--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "is_base" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "plant_details" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "plant_details_tags" ADD CONSTRAINT "plant_details_tags_plant_id_plant_details_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant_details"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_details_tags" ADD CONSTRAINT "plant_details_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plant_details_tags_plant_id_idx" ON "plant_details_tags" USING btree ("plant_id");--> statement-breakpoint
CREATE INDEX "plant_details_tags_tag_id_idx" ON "plant_details_tags" USING btree ("tag_id");--> statement-breakpoint
ALTER TABLE "plant_details" ADD CONSTRAINT "plant_details_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_variants_display_order_idx" ON "product_variants" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "product_variants_is_base_idx" ON "product_variants" USING btree ("is_base");--> statement-breakpoint
CREATE INDEX "plant_details_category_id_idx" ON "plant_details" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "display_order";
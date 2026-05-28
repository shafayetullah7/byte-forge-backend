ALTER TABLE "plant_details_translations" DROP CONSTRAINT "plant_details_translations_plant_id_plant_details_product_id_fk";
--> statement-breakpoint
ALTER TABLE "plant_details_translations" ADD CONSTRAINT "plant_details_translations_plant_id_plant_details_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant_details"("id") ON DELETE cascade ON UPDATE no action;
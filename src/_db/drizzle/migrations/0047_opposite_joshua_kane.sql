CREATE TABLE "plant_variant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255),
	"growth_stage" varchar(50),
	"propagation_type" varchar(50),
	"plant_form" varchar(50),
	"variegation" varchar(50),
	"container_type" varchar(50),
	"bundle_type" varchar(50),
	CONSTRAINT "plant_variant_translations_variant_id_locale_unique" UNIQUE("variant_id","locale")
);
--> statement-breakpoint
ALTER TABLE "fruits" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "fruits" CASCADE;--> statement-breakpoint
DROP INDEX "plant_locale_idx";--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "uses_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plant_variant_translations" ADD CONSTRAINT "plant_variant_translations_variant_id_plant_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."plant_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_variant_translations" ADD CONSTRAINT "plant_variant_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_translations" ADD CONSTRAINT "plant_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "used_at";--> statement-breakpoint
ALTER TABLE "plant_variants" DROP COLUMN "plant_height";--> statement-breakpoint
ALTER TABLE "plant_translations" ADD CONSTRAINT "plant_translations_plant_id_locale_unique" UNIQUE("plant_id","locale");
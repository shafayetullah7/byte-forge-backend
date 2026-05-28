CREATE TABLE "product_variant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"locale" varchar(2) NOT NULL,
	"title" varchar(255) NOT NULL,
	CONSTRAINT "product_variant_translations_variant_id_locale_unique" UNIQUE("variant_id","locale")
);
--> statement-breakpoint
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;
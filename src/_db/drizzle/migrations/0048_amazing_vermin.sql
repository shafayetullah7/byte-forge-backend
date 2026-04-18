CREATE TYPE "public"."product_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');--> statement-breakpoint
CREATE TYPE "public"."product_type_enum" AS ENUM('plant', 'pot', 'seed', 'fertilizer');--> statement-breakpoint
CREATE TYPE "public"."care_difficulty_enum" AS ENUM('beginner', 'intermediate', 'expert');--> statement-breakpoint
CREATE TYPE "public"."growth_rate_enum" AS ENUM('slow', 'moderate', 'fast');--> statement-breakpoint
CREATE TYPE "public"."humidity_level_enum" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."light_requirement_enum" AS ENUM('low', 'medium', 'bright_indirect', 'direct');--> statement-breakpoint
CREATE TYPE "public"."watering_frequency_enum" AS ENUM('daily', 'weekly', 'bi_weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "shop_address_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"country" varchar(100),
	"division" varchar(100),
	"district" varchar(100),
	"street" varchar(255),
	CONSTRAINT "shop_address_translations_address_locale_unique" UNIQUE("address_id","locale")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"product_type" "product_type_enum" NOT NULL,
	"category_id" uuid,
	"slug" varchar(255) NOT NULL,
	"base_variant_id" uuid,
	"thumbnail_id" uuid,
	"status" "product_status_enum" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"locale" varchar(2) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"short_description" text,
	CONSTRAINT "product_translations_product_id_locale_unique" UNIQUE("product_id","locale")
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"product_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"sale_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"inventory_count" integer DEFAULT 0,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"low_stock_threshold" integer DEFAULT 5,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "product_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"meta_title" varchar(100),
	"meta_description" varchar(255),
	"slug" varchar(255),
	"focus_keywords" text,
	"internal_notes" text,
	CONSTRAINT "product_seo_product_id_unique" UNIQUE("product_id"),
	CONSTRAINT "product_seo_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "plant_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"scientific_name" varchar(255),
	"common_names_en" text,
	"origin_en" varchar(255),
	"light_requirement" "light_requirement_enum",
	"watering_frequency" "watering_frequency_enum",
	"humidity_level" "humidity_level_enum",
	"temperature_range" varchar(100),
	"soil_type_en" varchar(255),
	"care_difficulty" "care_difficulty_enum",
	"growth_rate" "growth_rate_enum",
	"mature_height" varchar(100),
	"mature_spread" varchar(100),
	"toxicity_info_en" text,
	CONSTRAINT "plant_details_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "plant_details_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"locale" varchar(2) NOT NULL,
	"common_names" text,
	"origin" varchar(255),
	"soil_type" varchar(255),
	"toxicity_info" text,
	CONSTRAINT "plant_details_translations_plant_id_locale_unique" UNIQUE("plant_id","locale")
);
--> statement-breakpoint
CREATE TABLE "plant_care_instructions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"light_instructions" text,
	"watering_instructions" text,
	"humidity_instructions" text,
	"fertilizer_schedule" text,
	"repotting_frequency" text,
	"pruning_notes" text,
	"common_problems" text,
	"seasonal_care" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plant_care_instructions_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "plant_care_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"care_id" uuid NOT NULL,
	"locale" varchar(2) NOT NULL,
	"light_instructions" text,
	"watering_instructions" text,
	"humidity_instructions" text,
	"fertilizer_schedule" text,
	"repotting_frequency" text,
	"pruning_notes" text,
	"common_problems" text,
	"seasonal_care" text,
	CONSTRAINT "plant_care_translations_care_id_locale_unique" UNIQUE("care_id","locale")
);
--> statement-breakpoint
CREATE TABLE "pot_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"material" varchar(50),
	"material_en" varchar(50),
	"material_bn" varchar(50),
	"size_inches" integer,
	"height_inches" integer,
	"drainage" boolean DEFAULT true,
	"drainage_holes" integer,
	"color_en" varchar(50),
	"color_bn" varchar(50),
	"weight" varchar(50),
	"indoor" boolean DEFAULT true,
	"outdoor" boolean DEFAULT true,
	CONSTRAINT "pot_details_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "seed_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"germination_days" integer,
	"germination_min" integer,
	"germination_max" integer,
	"planting_season_en" varchar(100),
	"planting_season_bn" varchar(100),
	"seeds_per_packet" integer,
	"packet_weight" varchar(50),
	"seed_type" varchar(50),
	"seed_type_en" varchar(50),
	"seed_type_bn" varchar(50),
	"harvest_days" integer,
	"harvest_days_min" integer,
	"harvest_days_max" integer,
	"sunlight_requirement" varchar(50),
	"sunlight_requirement_en" varchar(50),
	"sunlight_requirement_bn" varchar(50),
	CONSTRAINT "seed_details_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "fertilizer_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"npk_ratio" varchar(20),
	"nitrogen" varchar(10),
	"phosphorus" varchar(10),
	"potassium" varchar(10),
	"fertilizer_type" varchar(50),
	"fertilizer_type_en" varchar(50),
	"fertilizer_type_bn" varchar(50),
	"application_frequency" varchar(100),
	"application_frequency_en" varchar(100),
	"application_frequency_bn" varchar(100),
	"volume" varchar(50),
	"coverage" varchar(100),
	"organic" varchar(20),
	"indoor" varchar(20),
	"outdoor" varchar(20),
	CONSTRAINT "fertilizer_details_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "plant_variant_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"pot_size" varchar(50),
	"pot_size_inches" numeric(5, 2),
	"pot_material" varchar(50),
	"pot_color_en" varchar(100),
	"pot_color_bn" varchar(100),
	"pot_type" varchar(50),
	"growth_stage" varchar(50),
	"plant_form" varchar(50),
	"variegation" varchar(50),
	"propagation_type" varchar(50),
	"container_type" varchar(50),
	"bundle_type" varchar(50),
	"display_order" integer DEFAULT 0,
	CONSTRAINT "plant_variant_attributes_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "pot_variant_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"diameter_inches" numeric(5, 2),
	"diameter_cm" numeric(5, 2),
	"height_inches" numeric(5, 2),
	"height_cm" numeric(5, 2),
	"size_label" varchar(100),
	"color_en" varchar(100),
	"color_bn" varchar(100),
	"finish" varchar(50),
	"material" varchar(50),
	"display_order" integer DEFAULT 0,
	CONSTRAINT "pot_variant_attributes_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "seed_variant_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"packet_size_label" varchar(100),
	"seeds_per_packet" integer,
	"packet_weight_grams" numeric(10, 2),
	"treatment" varchar(50),
	"grade" varchar(50),
	"display_order" integer DEFAULT 0,
	CONSTRAINT "seed_variant_attributes_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "fertilizer_variant_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"volume_ml" integer,
	"volume_oz" numeric(10, 2),
	"volume_label" varchar(100),
	"concentration" varchar(50),
	"grade" varchar(50),
	"display_order" integer DEFAULT 0,
	CONSTRAINT "fertilizer_variant_attributes_variant_id_unique" UNIQUE("variant_id")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"media_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"type" varchar(20) DEFAULT 'image' NOT NULL,
	"is_primary" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "plants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_care" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_seo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_media" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_variants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_variant_translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plant_translations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "plants" CASCADE;--> statement-breakpoint
DROP TABLE "plant_care" CASCADE;--> statement-breakpoint
DROP TABLE "plant_seo" CASCADE;--> statement-breakpoint
DROP TABLE "plant_media" CASCADE;--> statement-breakpoint
DROP TABLE "plant_variants" CASCADE;--> statement-breakpoint
DROP TABLE "plant_variant_translations" CASCADE;--> statement-breakpoint
DROP TABLE "plant_translations" CASCADE;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::text;--> statement-breakpoint
DROP TYPE "public"."shop_status_enum";--> statement-breakpoint
CREATE TYPE "public"."shop_status_enum" AS ENUM('DRAFT', 'PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'INACTIVE', 'REJECTED', 'SUSPENDED', 'DELETED');--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."shop_status_enum";--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "status" SET DATA TYPE "public"."shop_status_enum" USING "status"::"public"."shop_status_enum";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_address" ADD COLUMN "latitude" numeric(13, 10);--> statement-breakpoint
ALTER TABLE "shop_address" ADD COLUMN "longitude" numeric(14, 10);--> statement-breakpoint
ALTER TABLE "shop_address" ADD COLUMN "google_maps_link" text;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "shop_verification" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "business_hours" text;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ADD CONSTRAINT "shop_address_translations_address_id_shop_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."shop_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ADD CONSTRAINT "shop_address_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_seo" ADD CONSTRAINT "product_seo_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_details" ADD CONSTRAINT "plant_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_details_translations" ADD CONSTRAINT "plant_details_translations_plant_id_plant_details_product_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plant_details"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_details_translations" ADD CONSTRAINT "plant_details_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care_instructions" ADD CONSTRAINT "plant_care_instructions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care_translations" ADD CONSTRAINT "plant_care_translations_care_id_plant_care_instructions_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."plant_care_instructions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care_translations" ADD CONSTRAINT "plant_care_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pot_details" ADD CONSTRAINT "pot_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seed_details" ADD CONSTRAINT "seed_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fertilizer_details" ADD CONSTRAINT "fertilizer_details_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" ADD CONSTRAINT "plant_variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pot_variant_attributes" ADD CONSTRAINT "pot_variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seed_variant_attributes" ADD CONSTRAINT "seed_variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fertilizer_variant_attributes" ADD CONSTRAINT "fertilizer_variant_attributes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_shop_id_idx" ON "products" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "products_product_type_idx" ON "products" USING btree ("product_type");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_tags_product_id_idx" ON "product_tags" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_tags_tag_id_idx" ON "product_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_price_idx" ON "product_variants" USING btree ("price");--> statement-breakpoint
CREATE INDEX "product_variants_inventory_idx" ON "product_variants" USING btree ("inventory_count");--> statement-breakpoint
CREATE INDEX "product_variants_is_active_idx" ON "product_variants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "plant_details_product_id_idx" ON "plant_details" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "plant_details_light_requirement_idx" ON "plant_details" USING btree ("light_requirement");--> statement-breakpoint
CREATE INDEX "plant_details_watering_frequency_idx" ON "plant_details" USING btree ("watering_frequency");--> statement-breakpoint
CREATE INDEX "plant_details_care_difficulty_idx" ON "plant_details" USING btree ("care_difficulty");--> statement-breakpoint
CREATE INDEX "plant_care_instructions_product_id_idx" ON "plant_care_instructions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "plant_variant_attributes_variant_id_idx" ON "plant_variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "plant_variant_attributes_pot_size_idx" ON "plant_variant_attributes" USING btree ("pot_size");--> statement-breakpoint
CREATE INDEX "plant_variant_attributes_growth_stage_idx" ON "plant_variant_attributes" USING btree ("growth_stage");--> statement-breakpoint
CREATE INDEX "plant_variant_attributes_pot_material_idx" ON "plant_variant_attributes" USING btree ("pot_material");--> statement-breakpoint
CREATE INDEX "pot_variant_attributes_variant_id_idx" ON "pot_variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "pot_variant_attributes_diameter_idx" ON "pot_variant_attributes" USING btree ("diameter_inches");--> statement-breakpoint
CREATE INDEX "pot_variant_attributes_material_idx" ON "pot_variant_attributes" USING btree ("material");--> statement-breakpoint
CREATE INDEX "pot_variant_attributes_color_idx" ON "pot_variant_attributes" USING btree ("color_en");--> statement-breakpoint
CREATE INDEX "seed_variant_attributes_variant_id_idx" ON "seed_variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "seed_variant_attributes_seeds_per_packet_idx" ON "seed_variant_attributes" USING btree ("seeds_per_packet");--> statement-breakpoint
CREATE INDEX "seed_variant_attributes_treatment_idx" ON "seed_variant_attributes" USING btree ("treatment");--> statement-breakpoint
CREATE INDEX "fertilizer_variant_attributes_variant_id_idx" ON "fertilizer_variant_attributes" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "fertilizer_variant_attributes_volume_idx" ON "fertilizer_variant_attributes" USING btree ("volume_ml");--> statement-breakpoint
CREATE INDEX "fertilizer_variant_attributes_concentration_idx" ON "fertilizer_variant_attributes" USING btree ("concentration");--> statement-breakpoint
CREATE INDEX "product_media_product_id_idx" ON "product_media" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_media_variant_id_idx" ON "product_media" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "product_media_is_primary_idx" ON "product_media" USING btree ("is_primary");--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "shop_name";--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "about";--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "brand_story";--> statement-breakpoint
ALTER TABLE "shop_translations" DROP COLUMN "featured_highlight";
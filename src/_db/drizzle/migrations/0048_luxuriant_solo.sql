-- Drop tables if they exist before recreating them
DROP TABLE IF EXISTS "shop_address_translations" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "plant_care_translations" CASCADE;
--> statement-breakpoint
-- Recreate tables fresh
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
CREATE TABLE "plant_care_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"care_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"light_level" varchar(100),
	"watering_frequency" varchar(100),
	"humidity_level" varchar(100),
	"temp_range" varchar(100),
	"soil_type" varchar(255),
	"care_difficulty" varchar(50),
	"pet_safety" varchar(50),
	"fertilizer_schedule" text,
	"repotting_frequency" text,
	"pruning_notes" text,
	CONSTRAINT "plant_care_translations_care_id_locale_unique" UNIQUE("care_id","locale")
);
--> statement-breakpoint
-- Drop columns if they exist, then add them fresh
DO $$
BEGIN
    BEGIN
        ALTER TABLE "shop_address" DROP COLUMN IF EXISTS "latitude";
    EXCEPTION
        WHEN undefined_column THEN NULL;
    END;
    ALTER TABLE "shop_address" ADD COLUMN "latitude" numeric(13, 10);
END $$;--> statement-breakpoint
DO $$
BEGIN
    BEGIN
        ALTER TABLE "shop_address" DROP COLUMN IF EXISTS "longitude";
    EXCEPTION
        WHEN undefined_column THEN NULL;
    END;
    ALTER TABLE "shop_address" ADD COLUMN "longitude" numeric(14, 10);
END $$;--> statement-breakpoint
DO $$
BEGIN
    BEGIN
        ALTER TABLE "shop_address" DROP COLUMN IF EXISTS "google_maps_link";
    EXCEPTION
        WHEN undefined_column THEN NULL;
    END;
    ALTER TABLE "shop_address" ADD COLUMN "google_maps_link" text;
END $$;--> statement-breakpoint
DO $$
BEGIN
    BEGIN
        ALTER TABLE "plants" DROP COLUMN IF EXISTS "thumbnail_id";
    EXCEPTION
        WHEN undefined_column THEN NULL;
    END;
    ALTER TABLE "plants" ADD COLUMN "thumbnail_id" uuid;
END $$;--> statement-breakpoint
DO $$
BEGIN
    BEGIN
        ALTER TABLE "plant_variants" DROP COLUMN IF EXISTS "is_default";
    EXCEPTION
        WHEN undefined_column THEN NULL;
    END;
    ALTER TABLE "plant_variants" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;
END $$;--> statement-breakpoint
-- Add constraints (they will be fresh since tables were recreated)
ALTER TABLE "shop_address_translations" ADD CONSTRAINT "shop_address_translations_address_id_shop_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."shop_address"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_address_translations" ADD CONSTRAINT "shop_address_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care_translations" ADD CONSTRAINT "plant_care_translations_care_id_plant_care_id_fk" FOREIGN KEY ("care_id") REFERENCES "public"."plant_care"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care_translations" ADD CONSTRAINT "plant_care_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Create indexes fresh
CREATE INDEX "plants_thumbnail_id_idx" ON "plants" USING btree ("thumbnail_id");--> statement-breakpoint
CREATE UNIQUE INDEX "plant_variants_unique_default" ON "plant_variants" USING btree ("plant_id") WHERE "plant_variants"."is_default" = true;
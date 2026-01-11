CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hashed_otp" varchar(255) NOT NULL,
	"purpose" varchar(50) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tree_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"icon_id" uuid,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tree_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"category_id" uuid,
	"name" varchar(255) NOT NULL,
	"scientific_name" varchar(255),
	"sku" varchar(100),
	"description" text,
	"short_description" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"main_image_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plant_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"sale_price" integer,
	"cost_price" integer,
	"track_quantity" boolean DEFAULT true NOT NULL,
	"allow_backorders" boolean DEFAULT false NOT NULL,
	CONSTRAINT "plant_pricing_plant_id_unique" UNIQUE("plant_id")
);
--> statement-breakpoint
CREATE TABLE "plant_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"stock_count" integer DEFAULT 0 NOT NULL,
	"low_stock_alert" integer DEFAULT 5,
	"supplier" varchar(255),
	"storage_location" varchar(255),
	"weight" numeric(10, 2),
	"length" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"shipping_class" varchar(100),
	"special_handling" boolean DEFAULT false NOT NULL,
	CONSTRAINT "plant_inventory_plant_id_unique" UNIQUE("plant_id")
);
--> statement-breakpoint
CREATE TABLE "plant_care" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
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
	CONSTRAINT "plant_care_plant_id_unique" UNIQUE("plant_id")
);
--> statement-breakpoint
CREATE TABLE "plant_seo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"meta_title" varchar(100),
	"meta_description" varchar(255),
	"slug" varchar(255),
	"focus_keywords" text,
	"internal_notes" text,
	CONSTRAINT "plant_seo_plant_id_unique" UNIQUE("plant_id")
);
--> statement-breakpoint
CREATE TABLE "plant_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"type" varchar(20) DEFAULT 'image' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plant_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100),
	"price" integer DEFAULT 0 NOT NULL,
	"stock_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tree_categories" ADD CONSTRAINT "tree_categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_category_id_tree_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tree_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_pricing" ADD CONSTRAINT "plant_pricing_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_inventory" ADD CONSTRAINT "plant_inventory_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_care" ADD CONSTRAINT "plant_care_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_seo" ADD CONSTRAINT "plant_seo_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_media" ADD CONSTRAINT "plant_media_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_media" ADD CONSTRAINT "plant_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plant_variants" ADD CONSTRAINT "plant_variants_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;
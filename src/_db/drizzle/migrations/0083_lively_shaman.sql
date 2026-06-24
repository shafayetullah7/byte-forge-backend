CREATE TABLE "shop_why_choose_us" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_why_choose_us_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"why_choose_us_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"text" varchar(500) NOT NULL,
	CONSTRAINT "shop_why_choose_us_translations_item_locale_unique" UNIQUE("why_choose_us_id","locale")
);
--> statement-breakpoint
CREATE TABLE "shop_value_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_value_point_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value_point_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"text" varchar(500) NOT NULL,
	CONSTRAINT "shop_value_point_translations_item_locale_unique" UNIQUE("value_point_id","locale")
);
--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "tagline" varchar(255);--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "seller_story" text;--> statement-breakpoint
ALTER TABLE "shop_translations" ADD COLUMN "brand_mission" text;--> statement-breakpoint
ALTER TABLE "shop_why_choose_us" ADD CONSTRAINT "shop_why_choose_us_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_why_choose_us_translations" ADD CONSTRAINT "shop_why_choose_us_translations_why_choose_us_id_shop_why_choose_us_id_fk" FOREIGN KEY ("why_choose_us_id") REFERENCES "public"."shop_why_choose_us"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_why_choose_us_translations" ADD CONSTRAINT "shop_why_choose_us_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_value_points" ADD CONSTRAINT "shop_value_points_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_value_point_translations" ADD CONSTRAINT "shop_value_point_translations_value_point_id_shop_value_points_id_fk" FOREIGN KEY ("value_point_id") REFERENCES "public"."shop_value_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_value_point_translations" ADD CONSTRAINT "shop_value_point_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shop_why_choose_us_shop_display_order_idx" ON "shop_why_choose_us" USING btree ("shop_id","display_order");--> statement-breakpoint
CREATE INDEX "shop_value_points_shop_display_order_idx" ON "shop_value_points" USING btree ("shop_id","display_order");
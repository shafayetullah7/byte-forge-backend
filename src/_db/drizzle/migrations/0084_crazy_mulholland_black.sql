CREATE TYPE "public"."shop_content_moderation_status_enum" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."shop_campaign_type_enum" AS ENUM('DISCOUNT', 'BUNDLE', 'FLASH_SALE', 'SEASONAL', 'FREE_SHIPPING');--> statement-breakpoint
CREATE TABLE "shop_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" "shop_campaign_type_enum" NOT NULL,
	"banner_id" uuid,
	"discount_percent" integer,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"moderation_status" "shop_content_moderation_status_enum" DEFAULT 'DRAFT' NOT NULL,
	"rejected_reason" text,
	"moderated_by_admin_id" uuid,
	"moderated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_campaigns_shop_id_slug_unique" UNIQUE("shop_id","slug")
);
--> statement-breakpoint
CREATE TABLE "shop_campaign_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "shop_campaign_translations_campaign_id_locale_unique" UNIQUE("campaign_id","locale")
);
--> statement-breakpoint
CREATE TABLE "shop_campaign_products" (
	"campaign_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "shop_campaign_products_campaign_id_product_id_pk" PRIMARY KEY("campaign_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "shop_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"slug" varchar(255) NOT NULL,
	"cover_image_id" uuid,
	"category" varchar(100),
	"read_minutes" integer,
	"is_editors_pick" boolean DEFAULT false NOT NULL,
	"editors_pick_by_admin_id" uuid,
	"editors_pick_at" timestamp with time zone,
	"moderation_status" "shop_content_moderation_status_enum" DEFAULT 'DRAFT' NOT NULL,
	"rejected_reason" text,
	"moderated_by_admin_id" uuid,
	"moderated_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_articles_shop_id_slug_unique" UNIQUE("shop_id","slug")
);
--> statement-breakpoint
CREATE TABLE "shop_article_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" text,
	"body" text,
	CONSTRAINT "shop_article_translations_article_id_locale_unique" UNIQUE("article_id","locale")
);
--> statement-breakpoint
CREATE TABLE "shop_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_follows_shop_id_user_id_unique" UNIQUE("shop_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlists_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_wishlist_id_variant_id_unique" UNIQUE("wishlist_id","variant_id")
);
--> statement-breakpoint
ALTER TABLE "shop_campaigns" ADD CONSTRAINT "shop_campaigns_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaigns" ADD CONSTRAINT "shop_campaigns_banner_id_media_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaigns" ADD CONSTRAINT "shop_campaigns_moderated_by_admin_id_admins_id_fk" FOREIGN KEY ("moderated_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaign_translations" ADD CONSTRAINT "shop_campaign_translations_campaign_id_shop_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."shop_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaign_translations" ADD CONSTRAINT "shop_campaign_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaign_products" ADD CONSTRAINT "shop_campaign_products_campaign_id_shop_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."shop_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_campaign_products" ADD CONSTRAINT "shop_campaign_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_articles" ADD CONSTRAINT "shop_articles_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_articles" ADD CONSTRAINT "shop_articles_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_articles" ADD CONSTRAINT "shop_articles_editors_pick_by_admin_id_admins_id_fk" FOREIGN KEY ("editors_pick_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_articles" ADD CONSTRAINT "shop_articles_moderated_by_admin_id_admins_id_fk" FOREIGN KEY ("moderated_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_article_translations" ADD CONSTRAINT "shop_article_translations_article_id_shop_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."shop_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_article_translations" ADD CONSTRAINT "shop_article_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_follows" ADD CONSTRAINT "shop_follows_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_follows" ADD CONSTRAINT "shop_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shop_campaigns_shop_id_idx" ON "shop_campaigns" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_campaigns_moderation_status_idx" ON "shop_campaigns" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "shop_campaigns_dates_idx" ON "shop_campaigns" USING btree ("shop_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "shop_campaign_products_campaign_id_idx" ON "shop_campaign_products" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "shop_campaign_products_product_id_idx" ON "shop_campaign_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "shop_articles_shop_id_idx" ON "shop_articles" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_articles_moderation_status_idx" ON "shop_articles" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "shop_articles_published_at_idx" ON "shop_articles" USING btree ("shop_id","published_at");--> statement-breakpoint
CREATE INDEX "shop_follows_shop_id_idx" ON "shop_follows" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "shop_follows_user_id_idx" ON "shop_follows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_wishlist_id_idx" ON "wishlist_items" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_variant_id_idx" ON "wishlist_items" USING btree ("variant_id");
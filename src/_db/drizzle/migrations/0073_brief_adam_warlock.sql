CREATE TABLE "shop_shipping_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"district_id" uuid NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_shipping_rates_shop_id_district_id_unique" UNIQUE("shop_id","district_id")
);
--> statement-breakpoint
ALTER TABLE "shop_shipping_rates" ADD CONSTRAINT "shop_shipping_rates_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_shipping_rates" ADD CONSTRAINT "shop_shipping_rates_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;
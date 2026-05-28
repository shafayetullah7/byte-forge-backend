CREATE TYPE "public"."inventory_movement_type_enum" AS ENUM('INITIAL_STOCK', 'RESTOCK', 'ORDER_RESERVED', 'ORDER_FULFILLED', 'ORDER_CANCELLED', 'CUSTOMER_RETURN', 'DAMAGED', 'LOST', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"shop_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_variant_id_unique" UNIQUE("variant_id"),
	CONSTRAINT "inventory_quantity_check" CHECK ("inventory"."quantity" >= 0),
	CONSTRAINT "inventory_reserved_check" CHECK ("inventory"."reserved_quantity" >= 0),
	CONSTRAINT "inventory_reserved_lte_quantity" CHECK ("inventory"."reserved_quantity" <= "inventory"."quantity"),
	CONSTRAINT "inventory_threshold_check" CHECK ("inventory"."low_stock_threshold" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"shop_id" uuid NOT NULL,
	"movement_type" "inventory_movement_type_enum" NOT NULL,
	"quantity_change" integer NOT NULL,
	"previous_quantity" integer NOT NULL,
	"new_quantity" integer NOT NULL,
	"previous_reserved" integer NOT NULL,
	"new_reserved" integer NOT NULL,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"reason" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_variant_id_idx" ON "inventory" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "inventory_shop_id_idx" ON "inventory" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "inventory_track_inventory_idx" ON "inventory" USING btree ("track_inventory");--> statement-breakpoint
CREATE INDEX "inventory_movements_inventory_id_idx" ON "inventory_movements" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_shop_id_idx" ON "inventory_movements" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_inventory_created_at_idx" ON "inventory_movements" USING btree ("inventory_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_shop_created_at_idx" ON "inventory_movements" USING btree ("shop_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_reference_idx" ON "inventory_movements" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_movement_type_idx" ON "inventory_movements" USING btree ("movement_type");
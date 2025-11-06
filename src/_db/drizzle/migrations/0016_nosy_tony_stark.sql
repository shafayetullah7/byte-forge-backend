CREATE TYPE "public"."id_type_enum" AS ENUM('nid', 'passport', 'driving_license', 'other');--> statement-breakpoint
CREATE TABLE "shops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_name" varchar(25500) NOT NULL,
	"about" text,
	"eestablish_dates" date,
	"business_type" varchar(100),
	"logo" text,
	"banner" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"branch_name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_branch_address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_branch_id" uuid NOT NULL,
	"country" varchar(100) NOT NULL,
	"division" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"street" varchar(255) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_branch_address_shop_branch_id_unique" UNIQUE("shop_branch_id")
);
--> statement-breakpoint
CREATE TABLE "shop_branch_contact" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"shop_branch_id" uuid NOT NULL,
	"business_email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"alternative_phone" varchar(20),
	"whatsapp" varchar(20),
	"telegram" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_branch_contact_shop_branch_id_unique" UNIQUE("shop_branch_id")
);
--> statement-breakpoint
CREATE TABLE "shop_social_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"facebook" varchar(255),
	"instagram" varchar(255),
	"x" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_social_media_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "shop_branch_business" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_branch_id" uuid NOT NULL,
	"business_hours" text NOT NULL,
	"local_delivery" boolean DEFAULT false NOT NULL,
	"nationwide_shipping" boolean DEFAULT false NOT NULL,
	"in_store_pickup" boolean DEFAULT false NOT NULL,
	"international_shipping" boolean DEFAULT false NOT NULL,
	"delivery_area_description" text NOT NULL,
	"minimum_delivery_time" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_branch_business_shop_branch_id_unique" UNIQUE("shop_branch_id")
);
--> statement-breakpoint
CREATE TABLE "shop_branch_manager" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_branch_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"working_since" timestamp with time zone,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"alternative_phone" varchar(20),
	"whatsapp" varchar(20),
	"telegram" varchar(20),
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_branch_manager_verification_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_branch_manager_id" uuid NOT NULL,
	"address" text NOT NULL,
	"id_type" "id_type_enum" NOT NULL,
	"id_number" varchar(100) NOT NULL,
	"id_document" text NOT NULL,
	"proof_of_address" text NOT NULL,
	"background_check_authorization" boolean DEFAULT false NOT NULL,
	"professional_certification" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_verification_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"business_license_number" varchar(100),
	"business_license" text,
	"tin_number" varchar(100) NOT NULL,
	"tin" text NOT NULL,
	"business_document" text NOT NULL,
	"owner_id_proof" text NOT NULL,
	"professional_certification" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shop_branch" ADD CONSTRAINT "shop_branch_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_branch_address" ADD CONSTRAINT "shop_branch_address_shop_branch_id_shop_branch_id_fk" FOREIGN KEY ("shop_branch_id") REFERENCES "public"."shop_branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_branch_contact" ADD CONSTRAINT "shop_branch_contact_shop_branch_id_shop_branch_id_fk" FOREIGN KEY ("shop_branch_id") REFERENCES "public"."shop_branch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_social_media" ADD CONSTRAINT "shop_social_media_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_branch_business" ADD CONSTRAINT "shop_branch_business_shop_branch_id_shop_branch_id_fk" FOREIGN KEY ("shop_branch_id") REFERENCES "public"."shop_branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_branch_manager" ADD CONSTRAINT "shop_branch_manager_shop_branch_id_shop_branch_id_fk" FOREIGN KEY ("shop_branch_id") REFERENCES "public"."shop_branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_branch_manager_verification_info" ADD CONSTRAINT "shop_branch_manager_verification_info_shop_branch_manager_id_shop_branch_manager_id_fk" FOREIGN KEY ("shop_branch_manager_id") REFERENCES "public"."shop_branch_manager"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_verification_info" ADD CONSTRAINT "shop_verification_info_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
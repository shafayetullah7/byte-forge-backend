CREATE TYPE "public"."business_account_verification_status_enum" AS ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."business_verification_status_enum" AS ENUM('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "business_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"verification_status" "business_account_verification_status_enum" NOT NULL,
	"logo_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_account_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_account_id" uuid NOT NULL,
	"trade_license_number" varchar(100),
	"trade_license_document" varchar(255),
	"tin_number" varchar(100),
	"tin_document" varchar(255),
	"other_supporting_document" varchar(255),
	"status" "business_verification_status_enum" DEFAULT 'PENDING' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manager" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"working_since" timestamp with time zone,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"alternative_phone" varchar(20),
	"whatsapp" varchar(20),
	"telegram" varchar(20),
	"manager_image" uuid,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"country" varchar(100) NOT NULL,
	"division" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"street" varchar(255) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_address_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "shop_business" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"business_hours" text NOT NULL,
	"local_delivery" boolean DEFAULT false NOT NULL,
	"nationwide_shipping" boolean DEFAULT false NOT NULL,
	"in_store_pickup" boolean DEFAULT false NOT NULL,
	"international_shipping" boolean DEFAULT false NOT NULL,
	"delivery_area_description" text NOT NULL,
	"minimum_delivery_time" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_business_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "shop_contact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"business_email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"alternative_phone" varchar(20),
	"whatsapp" varchar(20),
	"telegram" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_contact_shop_id_unique" UNIQUE("shop_id")
);
--> statement-breakpoint
CREATE TABLE "shop_manager" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"manager_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shop_manager_manager_id_unique" UNIQUE("manager_id")
);

--> statement-breakpoint
DROP TABLE "shop_branch" CASCADE;--> statement-breakpoint
DROP TABLE "shop_branch_address" CASCADE;--> statement-breakpoint
DROP TABLE "shop_branch_contact" CASCADE;--> statement-breakpoint
DROP TABLE "shop_branch_business" CASCADE;--> statement-breakpoint
DROP TABLE "shop_branch_manager" CASCADE;--> statement-breakpoint
DROP TABLE "shop_branch_manager_verification_info" CASCADE;--> statement-breakpoint
DROP TABLE "shop_verification_info" CASCADE;--> statement-breakpoint
DROP TYPE "public"."shop_verification_status_enum";--> statement-breakpoint
CREATE TYPE "public"."shop_verification_status_enum" AS ENUM('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');--> statement-breakpoint

ALTER TABLE "business_account" ADD CONSTRAINT "business_account_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_account" ADD CONSTRAINT "business_account_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_account_verification" ADD CONSTRAINT "business_account_verification_business_account_id_business_account_id_fk" FOREIGN KEY ("business_account_id") REFERENCES "public"."business_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager" ADD CONSTRAINT "manager_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager" ADD CONSTRAINT "manager_manager_image_media_id_fk" FOREIGN KEY ("manager_image") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_address" ADD CONSTRAINT "shop_address_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_business" ADD CONSTRAINT "shop_business_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_contact" ADD CONSTRAINT "shop_contact_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_manager" ADD CONSTRAINT "shop_manager_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_manager" ADD CONSTRAINT "shop_manager_manager_id_manager_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."manager"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."id_type_enum";--> statement-breakpoint
DROP TYPE "public"."manager_verification_status_enum";

--> statement-breakpoint
CREATE TABLE "shop_verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"trade_license_number" varchar(100),
	"trade_license_document" text,
	"utility_bill_document" text,
	"status" "shop_verification_status_enum" DEFAULT 'PENDING' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "shop_verification" ADD CONSTRAINT "shop_verification_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "shop_verification" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shop_verification" ALTER COLUMN "status" SET DEFAULT 'PENDING'::text;--> statement-breakpoint
ALTER TABLE "shop_verification" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."shop_verification_status_enum";--> statement-breakpoint
ALTER TABLE "shop_verification" ALTER COLUMN "status" SET DATA TYPE "public"."shop_verification_status_enum" USING "status"::"public"."shop_verification_status_enum";--> statement-breakpoint


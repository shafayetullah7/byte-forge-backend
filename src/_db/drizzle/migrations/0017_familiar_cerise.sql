CREATE TYPE "public"."manager_verification_status_enum" AS ENUM('pending', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."shop_verification_status_enum" AS ENUM('pending', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "shop_branch_manager_verification_info" ADD COLUMN "status" "manager_verification_status_enum" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_verification_info" ADD COLUMN "status" "shop_verification_status_enum" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "shop_verification_info" ADD COLUMN "verified_at" timestamp with time zone;
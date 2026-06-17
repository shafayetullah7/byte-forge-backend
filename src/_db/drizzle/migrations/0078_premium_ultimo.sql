CREATE TYPE "public"."payment_method_status_enum" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "payment_methods_user_id_idx";--> statement-breakpoint
DROP INDEX "payment_methods_is_default_idx";--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "key" "payment_method_type_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "display_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "logo_url" varchar(2048);--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "status" "payment_method_status_enum" DEFAULT 'INACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "last_four";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "expiry";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "is_default";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_key_unique" UNIQUE("key");
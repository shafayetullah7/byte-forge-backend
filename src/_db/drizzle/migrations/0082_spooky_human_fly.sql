CREATE TYPE "public"."review_report_status_enum" AS ENUM('OPEN', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"reported_by_seller_user_id" uuid NOT NULL,
	"reason" varchar(255) NOT NULL,
	"details" text,
	"status" "review_report_status_enum" DEFAULT 'OPEN' NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by_admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'APPROVED';--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "featured_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "featured_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_removed_by_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_by_admin_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "removed_reason" text;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reported_by_seller_user_id_users_id_fk" FOREIGN KEY ("reported_by_seller_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_resolved_by_admin_id_admins_id_fk" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_reports_review_id_idx" ON "review_reports" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reports_reported_by_seller_user_id_idx" ON "review_reports" USING btree ("reported_by_seller_user_id");--> statement-breakpoint
CREATE INDEX "review_reports_status_idx" ON "review_reports" USING btree ("status");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_featured_by_admin_id_admins_id_fk" FOREIGN KEY ("featured_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_removed_by_admin_id_admins_id_fk" FOREIGN KEY ("removed_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reviews_is_featured_idx" ON "reviews" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "reviews_is_removed_by_admin_idx" ON "reviews" USING btree ("is_removed_by_admin");
ALTER TABLE "user_addresses" ADD COLUMN "district_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "division_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_addresses_district_id_idx" ON "user_addresses" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "user_addresses_division_id_idx" ON "user_addresses" USING btree ("division_id");--> statement-breakpoint
ALTER TABLE "user_addresses" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "user_addresses" DROP COLUMN "state";
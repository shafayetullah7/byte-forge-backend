ALTER TABLE "otps" DROP COLUMN "used";--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_purpose_unique" UNIQUE("user_id","purpose");
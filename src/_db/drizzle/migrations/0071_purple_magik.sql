ALTER TABLE "carts" DROP CONSTRAINT "carts_user_id_unique";--> statement-breakpoint
ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "guest_token" varchar(64);--> statement-breakpoint
CREATE INDEX "carts_guest_token_idx" ON "carts" USING btree ("guest_token");--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_guest_token_unique" UNIQUE("guest_token");
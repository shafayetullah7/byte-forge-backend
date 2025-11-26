ALTER TABLE "shops" RENAME COLUMN "user_id" TO "owner_id";--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "shops" ALTER COLUMN "shop_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "logo" SET DATA TYPE uuid USING logo::uuid;--> statement-breakpoint
ALTER TABLE "shops" ALTER COLUMN "banner" SET DATA TYPE uuid USING banner::uuid;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "tag_groups" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "tag_groups" ADD CONSTRAINT "tag_groups_slug_unique" UNIQUE("slug");
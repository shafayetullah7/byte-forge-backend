ALTER TABLE "categories" ADD COLUMN "children_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tag_groups" ADD COLUMN "tag_count" integer DEFAULT 0 NOT NULL;
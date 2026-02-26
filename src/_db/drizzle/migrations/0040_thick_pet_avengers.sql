CREATE TABLE "tag_group_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "tag_group_translations_group_id_locale_unique" UNIQUE("group_id","locale")
);
--> statement-breakpoint
CREATE TABLE "tag_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "tag_translations_tag_id_locale_unique" UNIQUE("tag_id","locale")
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"code" varchar(10) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_rtl" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tag_groups" DROP CONSTRAINT "tag_groups_name_unique";--> statement-breakpoint
ALTER TABLE "tag_group_translations" ADD CONSTRAINT "tag_group_translations_group_id_tag_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."tag_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_group_translations" ADD CONSTRAINT "tag_group_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_locale_languages_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_groups" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "tag_groups" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "description";
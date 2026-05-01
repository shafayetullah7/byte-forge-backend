-- ✅ 1. Create enums FIRST

CREATE TYPE "public"."growth_stage_enum" AS ENUM (
  'seedling',
  'juvenile',
  'mature'
);

CREATE TYPE "public"."plant_form_enum" AS ENUM (
  'upright',
  'trailing',
  'climbing',
  'bushy'
);

CREATE TYPE "public"."variegation_enum" AS ENUM (
  'none',
  'low',
  'medium',
  'high'
);

CREATE TYPE "public"."propagation_type_enum" AS ENUM (
  'cutting',
  'seed',
  'division',
  'grafting'
);

CREATE TYPE "public"."container_type_enum" AS ENUM (
  'nursery_pot',
  'ceramic',
  'plastic',
  'terracotta'
);

CREATE TYPE "public"."leaf_density_enum" AS ENUM (
  'sparse',
  'moderate',
  'dense'
);

-- ✅ 2. Alter existing columns with SAFE casting

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage"
TYPE "public"."growth_stage_enum"
USING "growth_stage"::text::"public"."growth_stage_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage" SET DEFAULT 'juvenile';

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage" SET NOT NULL;


ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form"
TYPE "public"."plant_form_enum"
USING "plant_form"::text::"public"."plant_form_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form" SET DEFAULT 'upright';

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form" SET NOT NULL;


ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation"
TYPE "public"."variegation_enum"
USING "variegation"::text::"public"."variegation_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation" SET DEFAULT 'none';

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation" SET NOT NULL;


ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type"
TYPE "public"."propagation_type_enum"
USING "propagation_type"::text::"public"."propagation_type_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type" SET DEFAULT 'cutting';

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type" SET NOT NULL;


ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type"
TYPE "public"."container_type_enum"
USING "container_type"::text::"public"."container_type_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type" SET DEFAULT 'nursery_pot';

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type" SET NOT NULL;


-- ✅ 3. Add new columns

ALTER TABLE "plant_variant_attributes"
ADD COLUMN "leaf_density" "leaf_density_enum" DEFAULT 'moderate' NOT NULL;

ALTER TABLE "plant_variant_attributes"
ADD COLUMN "stem_count" integer DEFAULT 1;

ALTER TABLE "plant_variant_attributes"
ADD COLUMN "current_height" varchar(50);

ALTER TABLE "plant_variant_attributes"
ADD COLUMN "current_spread" varchar(50);

ALTER TABLE "plant_variant_attributes"
ADD COLUMN "container_size" varchar(50);


-- ✅ 4. Index

CREATE INDEX "plant_variant_attributes_variegation_idx"
ON "plant_variant_attributes" USING btree ("variegation");
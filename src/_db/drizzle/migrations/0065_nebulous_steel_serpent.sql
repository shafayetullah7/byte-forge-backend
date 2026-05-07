-- ALTER TABLE "plant_details" ALTER COLUMN "care_difficulty" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."care_difficulty_enum";--> statement-breakpoint
-- CREATE TYPE "public"."care_difficulty_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'EXPERT');--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "care_difficulty" SET DATA TYPE "public"."care_difficulty_enum" USING "care_difficulty"::"public"."care_difficulty_enum";--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "growth_rate" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."growth_rate_enum";--> statement-breakpoint
-- CREATE TYPE "public"."growth_rate_enum" AS ENUM('SLOW', 'MODERATE', 'FAST');--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "growth_rate" SET DATA TYPE "public"."growth_rate_enum" USING "growth_rate"::"public"."growth_rate_enum";--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "humidity_level" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."humidity_level_enum";--> statement-breakpoint
-- CREATE TYPE "public"."humidity_level_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "humidity_level" SET DATA TYPE "public"."humidity_level_enum" USING "humidity_level"::"public"."humidity_level_enum";--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "light_requirement" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."light_requirement_enum";--> statement-breakpoint
-- CREATE TYPE "public"."light_requirement_enum" AS ENUM('LOW', 'MEDIUM', 'BRIGHT_INDIRECT', 'DIRECT');--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "light_requirement" SET DATA TYPE "public"."light_requirement_enum" USING "light_requirement"::"public"."light_requirement_enum";--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "watering_frequency" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."watering_frequency_enum";--> statement-breakpoint
-- CREATE TYPE "public"."watering_frequency_enum" AS ENUM('DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');--> statement-breakpoint
-- ALTER TABLE "plant_details" ALTER COLUMN "watering_frequency" SET DATA TYPE "public"."watering_frequency_enum" USING "watering_frequency"::"public"."watering_frequency_enum";--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "growth_stage" SET DEFAULT 'JUVENILE';--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "plant_form" SET DEFAULT 'UPRIGHT';--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "variegation" SET DEFAULT 'NONE';--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "leaf_density" SET DEFAULT 'MODERATE';--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "propagation_type" SET DEFAULT 'CUTTING';--> statement-breakpoint
-- ALTER TABLE "plant_variant_attributes" ALTER COLUMN "container_type" SET DEFAULT 'NURSERY_POT';


-- =========================
-- PLANT DETAILS ENUMS
-- =========================

-- care_difficulty_enum
ALTER TABLE "plant_details"
ALTER COLUMN "care_difficulty" DROP DEFAULT;

ALTER TABLE "plant_details"
ALTER COLUMN "care_difficulty"
SET DATA TYPE text
USING UPPER("care_difficulty"::text);

DROP TYPE IF EXISTS "public"."care_difficulty_enum";

CREATE TYPE "public"."care_difficulty_enum" AS ENUM (
  'BEGINNER',
  'INTERMEDIATE',
  'EXPERT'
);

ALTER TABLE "plant_details"
ALTER COLUMN "care_difficulty"
SET DATA TYPE "public"."care_difficulty_enum"
USING "care_difficulty"::"public"."care_difficulty_enum";


-- growth_rate_enum
ALTER TABLE "plant_details"
ALTER COLUMN "growth_rate" DROP DEFAULT;

ALTER TABLE "plant_details"
ALTER COLUMN "growth_rate"
SET DATA TYPE text
USING UPPER("growth_rate"::text);

DROP TYPE IF EXISTS "public"."growth_rate_enum";

CREATE TYPE "public"."growth_rate_enum" AS ENUM (
  'SLOW',
  'MODERATE',
  'FAST'
);

ALTER TABLE "plant_details"
ALTER COLUMN "growth_rate"
SET DATA TYPE "public"."growth_rate_enum"
USING "growth_rate"::"public"."growth_rate_enum";


-- humidity_level_enum
ALTER TABLE "plant_details"
ALTER COLUMN "humidity_level" DROP DEFAULT;

ALTER TABLE "plant_details"
ALTER COLUMN "humidity_level"
SET DATA TYPE text
USING UPPER("humidity_level"::text);

DROP TYPE IF EXISTS "public"."humidity_level_enum";

CREATE TYPE "public"."humidity_level_enum" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH'
);

ALTER TABLE "plant_details"
ALTER COLUMN "humidity_level"
SET DATA TYPE "public"."humidity_level_enum"
USING "humidity_level"::"public"."humidity_level_enum";


-- light_requirement_enum
ALTER TABLE "plant_details"
ALTER COLUMN "light_requirement" DROP DEFAULT;

ALTER TABLE "plant_details"
ALTER COLUMN "light_requirement"
SET DATA TYPE text
USING UPPER("light_requirement"::text);

DROP TYPE IF EXISTS "public"."light_requirement_enum";

CREATE TYPE "public"."light_requirement_enum" AS ENUM (
  'LOW',
  'MEDIUM',
  'BRIGHT_INDIRECT',
  'DIRECT'
);

ALTER TABLE "plant_details"
ALTER COLUMN "light_requirement"
SET DATA TYPE "public"."light_requirement_enum"
USING "light_requirement"::"public"."light_requirement_enum";


-- watering_frequency_enum
ALTER TABLE "plant_details"
ALTER COLUMN "watering_frequency" DROP DEFAULT;

ALTER TABLE "plant_details"
ALTER COLUMN "watering_frequency"
SET DATA TYPE text
USING UPPER("watering_frequency"::text);

DROP TYPE IF EXISTS "public"."watering_frequency_enum";

CREATE TYPE "public"."watering_frequency_enum" AS ENUM (
  'DAILY',
  'WEEKLY',
  'BI_WEEKLY',
  'MONTHLY'
);

ALTER TABLE "plant_details"
ALTER COLUMN "watering_frequency"
SET DATA TYPE "public"."watering_frequency_enum"
USING "watering_frequency"::"public"."watering_frequency_enum";


-- =========================
-- PLANT VARIANT ATTRIBUTE ENUMS
-- =========================

-- growth_stage_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage"
SET DATA TYPE text
USING UPPER("growth_stage"::text);

DROP TYPE IF EXISTS "public"."growth_stage_enum";

CREATE TYPE "public"."growth_stage_enum" AS ENUM (
  'SEEDLING',
  'JUVENILE',
  'MATURE',
  'CUTTING'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage"
SET DATA TYPE "public"."growth_stage_enum"
USING "growth_stage"::"public"."growth_stage_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "growth_stage"
SET DEFAULT 'JUVENILE';


-- plant_form_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form"
SET DATA TYPE text
USING UPPER("plant_form"::text);

DROP TYPE IF EXISTS "public"."plant_form_enum";

CREATE TYPE "public"."plant_form_enum" AS ENUM (
  'UPRIGHT',
  'TRAILING',
  'BUSHY',
  'CLIMBING',
  'ROSETTE'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form"
SET DATA TYPE "public"."plant_form_enum"
USING "plant_form"::"public"."plant_form_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "plant_form"
SET DEFAULT 'UPRIGHT';


-- variegation_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation"
SET DATA TYPE text
USING UPPER("variegation"::text);

DROP TYPE IF EXISTS "public"."variegation_enum";

CREATE TYPE "public"."variegation_enum" AS ENUM (
  'NONE',
  'VARIEGATED',
  'SEMI_VARIEGATED',
  'ALBO',
  'AUREO'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation"
SET DATA TYPE "public"."variegation_enum"
USING "variegation"::"public"."variegation_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "variegation"
SET DEFAULT 'NONE';


-- leaf_density_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "leaf_density" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "leaf_density"
SET DATA TYPE text
USING UPPER("leaf_density"::text);

DROP TYPE IF EXISTS "public"."leaf_density_enum";

CREATE TYPE "public"."leaf_density_enum" AS ENUM (
  'SPARSE',
  'MODERATE',
  'DENSE'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "leaf_density"
SET DATA TYPE "public"."leaf_density_enum"
USING "leaf_density"::"public"."leaf_density_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "leaf_density"
SET DEFAULT 'MODERATE';


-- propagation_type_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type"
SET DATA TYPE text
USING UPPER("propagation_type"::text);

DROP TYPE IF EXISTS "public"."propagation_type_enum";

CREATE TYPE "public"."propagation_type_enum" AS ENUM (
  'CUTTING',
  'SEED',
  'TISSUE_CULTURE',
  'AIR_LAYER',
  'DIVISION'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type"
SET DATA TYPE "public"."propagation_type_enum"
USING "propagation_type"::"public"."propagation_type_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "propagation_type"
SET DEFAULT 'CUTTING';


-- container_type_enum
ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type" DROP DEFAULT;

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type"
SET DATA TYPE text
USING UPPER("container_type"::text);

DROP TYPE IF EXISTS "public"."container_type_enum";

CREATE TYPE "public"."container_type_enum" AS ENUM (
  'NURSERY_POT',
  'DECORATIVE_POT',
  'HANGING_BASKET',
  'TERRARIUM',
  'GROW_BAG'
);

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type"
SET DATA TYPE "public"."container_type_enum"
USING "container_type"::"public"."container_type_enum";

ALTER TABLE "plant_variant_attributes"
ALTER COLUMN "container_type"
SET DEFAULT 'NURSERY_POT';
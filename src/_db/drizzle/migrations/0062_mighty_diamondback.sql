DROP INDEX "plant_variant_attributes_pot_size_idx";--> statement-breakpoint
DROP INDEX "plant_variant_attributes_pot_material_idx";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_size";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_size_inches";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_material";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_color_en";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_color_bn";--> statement-breakpoint
ALTER TABLE "plant_variant_attributes" DROP COLUMN "pot_type";
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ProductStatusEnum } from '@/_db/drizzle/enum';
import {
  productTranslationSchema,
  plantDetailsSchema,
  careGuideSchema,
  UUIDSchema,
} from './create-plant.dto';

// === Update Plant Schema ===
// All fields optional for partial updates
export const updatePlantSchema = z.object({
  // Basic Product Information
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .max(255, 'Slug must be at most 255 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens only',
    )
    .optional(),

  thumbnailId: UUIDSchema.optional(),

  status: z
    .enum(Object.keys(ProductStatusEnum) as [string, ...string[]])
    .optional(),

  // Translations (upserts provided locales)
  translations: z.array(productTranslationSchema).optional(),

  // Plant Details (partial update - includes categoryId, tagIds, translations)
  plantDetails: plantDetailsSchema.partial().optional(),

  // Care Guide (partial update - EN and/or BN)
  careGuide: z
    .object({
      en: careGuideSchema.partial(),
      bn: careGuideSchema.partial(),
    })
    .optional(),

  // Media (replaces existing)
  mediaIds: z.array(UUIDSchema).optional(),
});

export class UpdatePlantDto extends createZodDto(updatePlantSchema) {}

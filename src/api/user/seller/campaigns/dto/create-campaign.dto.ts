import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SlugSchema } from '@/common/schemas/slug.schema';
import { ShopCampaignTypeEnum } from '@/_db/drizzle/enum';

const campaignTranslationSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().optional().nullable(),
});

export const campaignTranslationsSchema = z.object({
  en: campaignTranslationSchema,
  bn: campaignTranslationSchema,
});

export const createCampaignSchema = z
  .object({
    slug: SlugSchema.optional(),
    type: z.nativeEnum(ShopCampaignTypeEnum),
    bannerId: z.string().uuid().optional().nullable(),
    discountPercent: z.coerce
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    productIds: z.array(z.string().uuid()).max(50).optional().default([]),
    translations: z.object({
      en: campaignTranslationSchema,
      bn: campaignTranslationSchema.optional(),
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export class CreateCampaignDto extends createZodDto(createCampaignSchema) {}

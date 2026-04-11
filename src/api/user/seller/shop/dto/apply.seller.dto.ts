import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Reusable SlugSchema for URL-safe slugs
export const SlugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(255, 'Slug must be at most 255 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens only (e.g. my-shop)',
  );

export const shopTranslationSchema = z.object({
  locale: z.string().min(2).max(10),
  name: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(1, { message: 'message.validation.notEmpty' })
    .max(255, { message: 'message.validation.maxLength' }),
  description: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(10, { message: 'message.validation.minLength' })
    .max(2000, { message: 'message.validation.maxLength' }),
  businessHours: z.string().trim().optional(),
});

export const applySellerSchema = z.object({
  address: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(5, { message: 'message.validation.minLength' })
    .max(500, { message: 'message.validation.maxLength' }),

  // Optional slug - if not provided, will be generated from English shop name
  slug: SlugSchema.optional(),

  logoId: z.uuid({ message: 'message.validation.invalidUuid' }).optional(),
  bannerId: z.uuid({ message: 'message.validation.invalidUuid' }).optional(),

  // Translations
  translations: z
    .array(shopTranslationSchema)
    .min(1, { message: 'message.validation.atLeastOne' }),

  // Verification Details
  tradeLicenseNumber: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(1, { message: 'message.validation.notEmpty' }),
  tradeLicenseDocumentId: z.uuid({
    message: 'message.validation.invalidUuid',
  }),
  tinNumber: z.string().trim().optional(),
  tinDocumentId: z
    .uuid({ message: 'message.validation.invalidUuid' })
    .optional(),
  utilityBillDocumentId: z
    .uuid({
      message: 'message.validation.invalidUuid',
    })
    .optional(),
});

export class ApplySellerDto extends createZodDto(applySellerSchema) {}

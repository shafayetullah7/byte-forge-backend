import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const shopTranslationSchema = z.object({
  locale: z.string().min(2).max(10),
  shopName: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(1, { message: 'message.validation.notEmpty' })
    .max(255, { message: 'message.validation.maxLength' }),
  about: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(10, { message: 'message.validation.minLength' })
    .max(2000, { message: 'message.validation.maxLength' }),
  brandStory: z.string().trim().optional(),
  featuredHighlight: z.string().trim().optional(),
});

export const applySellerSchema = z.object({
  address: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(5, { message: 'message.validation.minLength' })
    .max(500, { message: 'message.validation.maxLength' }),

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

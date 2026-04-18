import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Zod schema for shop translation (bilingual)
 */
const shopTranslationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'message.validation.notEmpty' })
    .max(255, { message: 'message.validation.maxLength' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'message.validation.shop.descriptionMin' })
    .max(2000, { message: 'message.validation.maxLength' })
    .optional(),
  businessHours: z
    .string()
    .trim()
    .max(500, { message: 'message.validation.maxLength' })
    .optional(),
});

/**
 * Zod schema for shop branding
 */
const shopBrandingSchema = z.object({
  logoId: z
    .string()
    .uuid({ message: 'message.validation.invalidUuid' })
    .optional(),
  bannerId: z
    .string()
    .uuid({ message: 'message.validation.invalidUuid' })
    .optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      message: 'message.validation.invalidHexColor',
    })
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      message: 'message.validation.invalidHexColor',
    })
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      message: 'message.validation.invalidHexColor',
    })
    .optional(),
});

/**
 * Combined schema for updating shop info
 */
export const updateShopInfoSchema = z
  .object({
    // Shop slug (URL-friendly identifier)
    slug: z
      .string()
      .trim()
      .min(3, { message: 'message.validation.shop.slugMin' })
      .max(50, { message: 'message.validation.maxLength' })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'message.validation.shop.slugFormat',
      })
      .optional(),

    // Branding (logo, banner, colors)
    branding: shopBrandingSchema.optional(),

    // Translations (bilingual - English and Bengali)
    translations: z.object({
      en: shopTranslationSchema,
      bn: shopTranslationSchema,
    }),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'message.validation.atLeastOne',
  });

export class UpdateShopInfoDto extends createZodDto(updateShopInfoSchema) {}

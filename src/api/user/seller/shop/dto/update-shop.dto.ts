import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateShopTranslationSchema = z.object({
  locale: z.string().min(2, { message: 'message.validation.minLength' }).max(10, { message: 'message.validation.maxLength' }),
  shopName: z.string().trim().min(1, { message: 'message.validation.notEmpty' }).max(255, { message: 'message.validation.maxLength' }).optional(),
  about: z.string().trim().min(10, { message: 'message.validation.minLength' }).max(2000, { message: 'message.validation.maxLength' }).optional(),
  brandStory: z.string().trim().optional(),
  featuredHighlight: z.string().trim().optional(),
});

export const updateShopSchema = z.object({
  address: z.string().trim().min(5, { message: 'message.validation.minLength' }).max(500, { message: 'message.validation.maxLength' }).optional(),
  translations: z.array(updateShopTranslationSchema).optional(),
});

export class UpdateShopDto extends createZodDto(updateShopSchema) {}

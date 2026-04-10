import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateShopSocialMediaSchema = z
  .object({
    facebook: z
      .url({ message: 'message.validation.invalidUrl' })
      .max(255, { message: 'message.validation.maxLength' })
      .optional(),
    instagram: z
      .url({ message: 'message.validation.invalidUrl' })
      .max(255, { message: 'message.validation.maxLength' })
      .optional(),
    x: z
      .url({ message: 'message.validation.invalidUrl' })
      .max(255, { message: 'message.validation.maxLength' })
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'message.validation.atLeastOne',
  });

export class UpdateShopSocialMediaDto extends createZodDto(
  updateShopSocialMediaSchema,
) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 🔹 Common reusable phone number schema
// const phoneSchema = z
//   .string()
//   .trim()
//   .regex(/^[\d+\-\s()]{6,20}$/, {
//     message: `Phone number must be between 6–20 characters and contain only digits, spaces, +, -, or ().`,
//   });

export const setupShopSchema = z.object({
  shopName: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(1, { message: 'message.validation.notEmpty' })
    .max(255, { message: 'message.validation.maxLength' }),

  about: z
    .string({ error: 'message.validation.required' })
    .trim()
    .min(10, {
      message: 'message.validation.minLength',
    })
    .max(2000, { message: 'message.validation.maxLength' }),

  establishDate: z.iso.date().optional(),

  logoId: z.uuid({ message: 'message.validation.invalidUuid' }).optional(),

  bannerId: z.uuid({ message: 'message.validation.invalidUuid' }).optional(),
});

export class SetupShopDto extends createZodDto(setupShopSchema) {}

import { ZodDtoFactory } from '@/common/factories/zod.dto.factory';
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
    .string({ error: 'Shop name is required.' })
    .trim()
    .min(1, { message: 'Shop name cannot be empty.' })
    .max(255, { message: 'Shop name must not exceed 255 characters.' }),

  about: z
    .string({ error: 'About section is required.' })
    .trim()
    .min(10, {
      message: 'About section must be at least 10 characters long.',
    })
    .max(2000, { message: 'About section must not exceed 2000 characters.' }),

  establishDate: z.date().optional(),

  logo: z.uuid({ message: 'Logo must be a valid UUID.' }).optional(),

  banner: z.uuid({ message: 'Banner must be a valid UUID.' }).optional(),
});

export class SetupShopDto extends ZodDtoFactory.create(setupShopSchema) {}

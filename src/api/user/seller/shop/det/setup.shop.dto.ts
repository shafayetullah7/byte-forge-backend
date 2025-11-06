import { z } from 'zod';

// 🔹 Common reusable phone number schema
const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d+\-\s()]{6,20}$/, {
    message: `Phone number must be between 6–20 characters and contain only digits, spaces, +, -, or ().`,
  });

// 🔹 Main schema
export const setupShopSchema = z.object({
  basic: z.object({
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

    establishDate: z
      .string({ error: 'Establish date is required.' })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Establish date must be a valid ISO date string.',
      }),

    logo: z.uuid({ message: 'Logo must be a valid UUID.' }).optional(),

    banner: z.uuid({ message: 'Banner must be a valid UUID.' }).optional(),
  }),

  mainBranch: z.object({
    contact: z.object({
      businessEmail: z
        .email({ message: 'Invalid business email address.' })
        .max(255, {
          message: 'Business email must not exceed 255 characters.',
        }),

      phone: phoneSchema.refine((val) => val.length > 0, {
        message: 'Primary phone number is required.',
      }),

      alternativePhone: phoneSchema.optional(),
      whatsapp: phoneSchema.optional(),
      telegram: phoneSchema.optional(),
    }),
  }),
});

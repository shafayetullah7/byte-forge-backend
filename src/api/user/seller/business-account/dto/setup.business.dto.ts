import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// const createBusinessVerificationSchema = z.object({
//   license: z
//     .object({
//       tradeLicenseNumber: z
//         .string()
//         .max(100, 'Trade license number must not exceed 100 characters'),
//       tradeLicenseDocument: z.uuid(),
//     })
//     .optional(),

//   tin: z
//     .object({
//       tinNumber: z
//         .string()
//         .max(100, 'TIN number must not exceed 100 characters'),

//       tinDocument: z
//         .string()
//         .max(255, 'Document URL must not exceed 255 characters'),
//     })
//     .optional(),

//   otherSupportingDocument: z.uuid().optional(),
// });

const businessAccountBasicSchema = z.object({
  name: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(255, 'Business name must not exceed 255 characters'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must not exceed 500 characters'),
  logoId: z.uuid('Invalid logo media ID').optional(),
});

const createBusinessAccountSchema = z.object({
  basicInfo: businessAccountBasicSchema,
  //   verification: createBusinessVerificationSchema,
});

export class CreateBusinessAccountDto extends createZodDto(
  createBusinessAccountSchema,
) {}

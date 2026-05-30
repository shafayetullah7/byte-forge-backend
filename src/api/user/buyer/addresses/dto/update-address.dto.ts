import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AddressTypeEnum } from '@/_db/drizzle/enum';

export const UpdateAddressSchema = z.object({
  type: z.nativeEnum(AddressTypeEnum).optional(),
  label: z
    .string()
    .trim()
    .min(1, 'Label cannot be empty')
    .max(50)
    .optional(),
  recipientName: z
    .string()
    .trim()
    .min(1, 'Recipient name cannot be empty')
    .max(100)
    .optional(),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone cannot be empty')
    .max(20)
    .optional(),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 cannot be empty')
    .max(255)
    .optional(),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z
    .string()
    .trim()
    .min(1, 'City cannot be empty')
    .max(100)
    .optional(),
  state: z.string().trim().max(100).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  country: z
    .string()
    .trim()
    .min(1, 'Country cannot be empty')
    .max(100)
    .optional(),
  companyName: z.string().trim().max(255).optional().nullable(),
  gstin: z.string().trim().max(20).optional().nullable(),
  deliveryInstructions: z.string().optional().nullable(),
  billingNotes: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export class UpdateAddressDto extends createZodDto(UpdateAddressSchema) {}

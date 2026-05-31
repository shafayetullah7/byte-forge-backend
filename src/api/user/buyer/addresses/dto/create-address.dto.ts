import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AddressTypeEnum } from '@/_db/drizzle/enum';

export const CreateAddressSchema = z.object({
  type: z
    .nativeEnum(AddressTypeEnum)
    .default(AddressTypeEnum.SHIPPING),
  label: z
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(50, 'Label cannot exceed 50 characters'),
  recipientName: z
    .string()
    .trim()
    .min(1, 'Recipient name is required')
    .max(100, 'Recipient name cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number cannot exceed 20 characters'),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 cannot exceed 255 characters'),
  addressLine2: z.string().trim().max(255).optional(),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(100)
    .default('Bangladesh'),
  companyName: z.string().trim().max(255).optional(),
  deliveryInstructions: z.string().trim().max(1000, "Delivery instructions cannot exceed 1000 characters").optional(),
  billingNotes: z.string().trim().max(1000, "Billing notes cannot exceed 1000 characters").optional(),
  isDefault: z.boolean().default(false),
});

export class CreateAddressDto extends createZodDto(CreateAddressSchema) {}

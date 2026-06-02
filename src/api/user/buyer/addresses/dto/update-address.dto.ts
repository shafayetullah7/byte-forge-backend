import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AddressTypeEnum } from '@/_db/drizzle/enum';

// Helper regex patterns
const NAME_PATTERN = /^[a-zA-Z\s\u0980-\u09FF]+$/; // English letters, spaces, and Bengali Unicode range
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/; // E.164 format, allows + and 1-15 digits
const POSTAL_CODE_PATTERN = /^\d{4,10}$/; // 4-10 digits for Bangladesh and international
const COMPANY_NAME_PATTERN = /^[a-zA-Z0-9\s\u0980-\u09FF\.\-\&\(\)\,]+$/; // Alphanumeric, spaces, Bengali, and common company name chars

export const UpdateAddressSchema = z.object({
  type: z.nativeEnum(AddressTypeEnum).optional(),
  label: z
    .string()
    .trim()
    .min(1, 'Label cannot be empty')
    .max(50, 'Label cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\u0980-\u09FF\-_]+$/, 'Label can only contain letters, numbers, spaces, hyphens, underscores, and Bengali characters')
    .optional(),
  recipientName: z
    .string()
    .trim()
    .min(1, 'Recipient name cannot be empty')
    .max(100, 'Recipient name cannot exceed 100 characters')
    .regex(NAME_PATTERN, 'Recipient name can only contain letters, spaces, and Bengali characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone cannot be empty')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(PHONE_PATTERN, 'Phone number must be a valid phone number (e.g., +8801XXXXXXXXX)')
    .optional(),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 cannot be empty')
    .max(255, 'Address line 1 cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s\u0980-\u09FF\.\-\#\,\/\\]+$/, 'Address line 1 can only contain alphanumeric characters, spaces, periods, hyphens, commas, slashes, hash, backslashes, and Bengali characters')
    .optional(),
  addressLine2: z
    .string()
    .trim()
    .max(255, 'Address line 2 cannot exceed 255 characters')
    .regex(/^[a-zA-Z0-9\s\u0980-\u09FF\.\-\#\,\/\\]*$/, 'Address line 2 can only contain alphanumeric characters, spaces, periods, hyphens, commas, slashes, hash, backslashes, and Bengali characters')
    .optional()
    .nullable(),
  city: z
    .string()
    .trim()
    .min(1, 'City cannot be empty')
    .max(100, 'City cannot exceed 100 characters')
    .regex(NAME_PATTERN, 'City name can only contain letters, spaces, and Bengali characters')
    .optional(),
  state: z
    .string()
    .trim()
    .max(100, 'State cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\u0980-\u09FF]*$/, 'State can only contain letters, spaces, and Bengali characters')
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .trim()
    .max(20, 'Postal code cannot exceed 20 characters')
    .regex(POSTAL_CODE_PATTERN, 'Postal code must contain only digits (4-10 digits)')
    .optional()
    .nullable(),
  country: z
    .string()
    .trim()
    .min(1, 'Country cannot be empty')
    .max(100, 'Country cannot exceed 100 characters')
    .optional(),
  companyName: z
    .string()
    .trim()
    .max(255, 'Company name cannot exceed 255 characters')
    .regex(COMPANY_NAME_PATTERN, 'Company name can only contain alphanumeric characters, spaces, periods, hyphens, ampersands, parentheses, commas, and Bengali characters')
    .optional()
    .nullable(),
  deliveryInstructions: z
    .string()
    .trim()
    .max(1000, 'Delivery instructions cannot exceed 1000 characters')
    .optional()
    .nullable(),
  billingNotes: z
    .string()
    .trim()
    .max(1000, 'Billing notes cannot exceed 1000 characters')
    .optional()
    .nullable(),
  isDefault: z.boolean().optional(),
});

export class UpdateAddressDto extends createZodDto(UpdateAddressSchema) {}

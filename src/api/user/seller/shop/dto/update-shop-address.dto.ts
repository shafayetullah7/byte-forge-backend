import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateShopAddressSchema = z
  .object({
    country: z
      .string()
      .min(2, { message: 'message.validation.minLength' })
      .max(100, { message: 'message.validation.maxLength' })
      .optional(),
    division: z
      .string()
      .min(2, { message: 'message.validation.minLength' })
      .max(100, { message: 'message.validation.maxLength' })
      .optional(),
    district: z
      .string()
      .min(2, { message: 'message.validation.minLength' })
      .max(100, { message: 'message.validation.maxLength' })
      .optional(),
    street: z
      .string()
      .min(5, { message: 'message.validation.minLength' })
      .max(255, { message: 'message.validation.maxLength' })
      .optional(),
    postalCode: z
      .string()
      .min(4, { message: 'message.validation.minLength' })
      .max(20, { message: 'message.validation.maxLength' })
      .optional(),
    // Google Maps location - using coerce.number for explicit type conversion
    latitude: z.coerce
      .number()
      .min(-90, { message: 'message.validation.invalidLatitude' })
      .max(90, { message: 'message.validation.invalidLatitude' })
      .optional(),
    longitude: z.coerce
      .number()
      .min(-180, { message: 'message.validation.invalidLongitude' })
      .max(180, { message: 'message.validation.invalidLongitude' })
      .optional(),
    googleMapsLink: z
      .url({ message: 'message.validation.invalidUrl' })
      .max(500, { message: 'message.validation.maxLength' })
      .optional(),
    // Translations for address fields (for Bengali - 'bn' locale)
    // English values are stored in the main address fields, translations are for other languages
    translations: z
      .object({
        country: z
          .string()
          .min(2, { message: 'message.validation.minLength' })
          .max(100, { message: 'message.validation.maxLength' })
          .optional(),
        division: z
          .string()
          .min(2, { message: 'message.validation.minLength' })
          .max(100, { message: 'message.validation.maxLength' })
          .optional(),
        district: z
          .string()
          .min(2, { message: 'message.validation.minLength' })
          .max(100, { message: 'message.validation.maxLength' })
          .optional(),
        street: z
          .string()
          .min(5, { message: 'message.validation.minLength' })
          .max(255, { message: 'message.validation.maxLength' })
          .optional(),
      })
      .refine(
        (data) => {
          // At least one translation field must be provided
          const translationFields = [
            'country',
            'division',
            'district',
            'street',
          ];
          return translationFields.some(
            (field) => data[field as keyof typeof data] !== undefined,
          );
        },
        {
          message: 'message.validation.atLeastOne',
        },
      )
      .optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: 'message.validation.atLeastOne',
  });

export class UpdateShopAddressDto extends createZodDto(
  updateShopAddressSchema,
) {}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const markDamagedSchema = z.object({
  variantId: z.string().uuid({ message: 'Variant ID must be a valid UUID' }),
  quantity: z.number().int().positive('Quantity must be a positive number'),
  reason: z.string().trim().min(1, 'Reason cannot be empty').max(500, 'Reason too long').optional(),
});

export class MarkDamagedDto extends createZodDto(markDamagedSchema) {}

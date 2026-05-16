import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const adjustStockSchema = z.object({
  variantId: z.string().uuid({ message: 'Variant ID must be a valid UUID' }),
  quantityChange: z.number().int().refine((n) => n !== 0, {
    message: 'Quantity change must be non-zero',
  }),
  referenceType: z.string().trim().min(1, 'Reference type cannot be empty').max(50, 'Reference type too long').optional(),
  referenceId: z.string().trim().min(1, 'Reference ID cannot be empty').max(255, 'Reference ID too long').optional(),
  reason: z.string().trim().min(1, 'Reason cannot be empty').max(500, 'Reason too long'),
});

export class AdjustStockDto extends createZodDto(adjustStockSchema) {}

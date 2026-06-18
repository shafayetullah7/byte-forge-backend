import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CancelSellerOrderSchema = z.object({
  reason: z.string().min(1).max(1000),
});

export class CancelSellerOrderDto extends createZodDto(CancelSellerOrderSchema) {}

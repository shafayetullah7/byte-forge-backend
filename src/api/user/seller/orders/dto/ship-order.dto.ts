import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ShipOrderSchema = z.object({
  carrier: z.string().min(1).max(100),
  trackingNumber: z.string().min(1).max(100),
  estimatedDelivery: z.string().datetime().optional(),
});

export class ShipOrderDto extends createZodDto(ShipOrderSchema) {}

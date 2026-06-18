import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OrderStatusEnum } from '@/_db/drizzle/enum/order-status.enum';

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatusEnum),
  notes: z.string().max(1000).optional(),
});

export class UpdateOrderStatusDto extends createZodDto(UpdateOrderStatusSchema) {}

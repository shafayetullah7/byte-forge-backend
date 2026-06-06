import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationParamsSchema } from '@/common/schemas/pagination.schema';

export const OrdersFilterSchema = PaginationParamsSchema.extend({
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  orderStatus: z.string().optional(),
  paymentStatus: z.string().optional(),
});

export class OrdersFilterDto extends createZodDto(OrdersFilterSchema) {}

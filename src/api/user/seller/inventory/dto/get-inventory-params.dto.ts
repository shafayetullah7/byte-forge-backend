import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getInventoryParamsSchema = z.object({
  id: z.string().uuid({ message: 'Product ID must be a valid UUID' }),
});

export class GetInventoryParamsDto extends createZodDto(getInventoryParamsSchema) {}

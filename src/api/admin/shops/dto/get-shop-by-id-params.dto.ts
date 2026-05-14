import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const getShopByIdParamsSchema = z.object({
  id: z.string().uuid({ message: 'Shop ID must be a valid UUID' }),
});

export class GetShopByIdParamsDto extends createZodDto(getShopByIdParamsSchema) {}

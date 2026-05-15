import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const shopIdParamSchema = z.object({
  id: z.string().uuid('Invalid shop ID format'),
});

export class ShopIdParamDto extends createZodDto(shopIdParamSchema) {}

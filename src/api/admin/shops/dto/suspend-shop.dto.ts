import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const suspendShopSchema = z.object({
  reason: z
    .string()
    .min(10, 'Suspension reason must be at least 10 characters'),
});

export class SuspendShopDto extends createZodDto(suspendShopSchema) {}

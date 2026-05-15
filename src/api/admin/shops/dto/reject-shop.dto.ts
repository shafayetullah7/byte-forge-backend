import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const rejectShopSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export class RejectShopDto extends createZodDto(rejectShopSchema) {}

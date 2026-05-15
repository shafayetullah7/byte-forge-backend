import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const approveShopSchema = z.object({
  notes: z.string().trim().optional(),
});

export class ApproveShopDto extends createZodDto(approveShopSchema) {}

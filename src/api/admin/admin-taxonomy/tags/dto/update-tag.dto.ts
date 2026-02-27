import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateTagSchema = z.object({
  groupId: z.uuid('Invalid UUID for group ID').optional(),
  slug: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateTagDto extends createZodDto(updateTagSchema) {}

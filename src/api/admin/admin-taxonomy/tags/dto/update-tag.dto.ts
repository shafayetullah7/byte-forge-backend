import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateTagSchema = z.object({
  groupId: z.string().uuid('Invalid UUID for group ID').optional(),
  name: z.string().min(1, 'Name cannot be empty').max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateTagDto extends createZodDto(updateTagSchema) {}

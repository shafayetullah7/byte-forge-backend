import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createTagSchema = z.object({
  groupId: z.string().uuid('Invalid UUID for group ID'),
  name: z.string().min(1, 'Name cannot be empty').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class CreateTagDto extends createZodDto(createTagSchema) {}

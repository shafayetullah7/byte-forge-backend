import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createTagSchema = z.object({
  groupId: z.string().uuid('Invalid UUID for group ID'),
  slug: z.string().trim().min(1, 'Slug is required').max(255),
  isActive: z.boolean().optional(),
  translations: z.array(
    z.object({
      locale: z.string().trim().min(2).max(10),
      name: z.string().trim().min(1, 'Name cannot be empty').max(255),
      description: z.string().optional(),
    })
  ).min(1, 'At least one translation is required'),
});

export class CreateTagDto extends createZodDto(createTagSchema) {}

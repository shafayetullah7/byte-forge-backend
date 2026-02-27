import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SlugSchema } from '@/common/schemas/slug.schema';

const createTagSchema = z.object({
  groupId: z.uuid('Invalid UUID for group ID'),
  slug: SlugSchema,
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

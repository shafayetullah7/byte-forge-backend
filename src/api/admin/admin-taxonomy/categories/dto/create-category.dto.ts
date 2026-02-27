import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SlugSchema } from '@/common/schemas/slug.schema';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255),
  slug: SlugSchema,
  parentId: z.string().uuid('Invalid UUID for parent ID').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}

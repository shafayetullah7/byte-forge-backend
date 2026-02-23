import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(255).optional(),
  parentId: z.string().uuid('Invalid UUID for parent ID').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
